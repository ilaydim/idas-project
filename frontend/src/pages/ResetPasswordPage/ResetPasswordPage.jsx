import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPasswordPage.css";
import idasLogo from "../../assets/images/icon.png";
import { supabase } from "../../utils/supabase";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Listen for the PASSWORD_RECOVERY event from Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    setSessionReady(true);
                }
            }
        );

        // Also check if already in a valid session (user may have already landed)
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                setSessionReady(true);
            }
        };
        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: "", color: "" };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
        if (score <= 2) return { level: 2, label: "Fair", color: "#f59e0b" };
        if (score <= 3) return { level: 3, label: "Good", color: "#38bdf8" };
        return { level: 4, label: "Strong", color: "#10b981" };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            setStatus({
                type: "error",
                message: "Password must be at least 6 characters.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", message: "Passwords do not match." });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: "", message: "" });

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                setStatus({ type: "error", message: error.message });
            } else {
                setStatus({
                    type: "success",
                    message: "Password updated successfully! Redirecting to login...",
                });
                setTimeout(async () => {
                    await supabase.auth.signOut();
                    navigate("/login");
                }, 2500);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setStatus({
                type: "error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <div className="reset-page-wrapper">
            <div className="reset-form-section">
                <div className="reset-form-container">
                    <div className="reset-logo-holder" onClick={() => navigate("/")}>
                        <img src={idasLogo} alt="IDAS Logo" />
                    </div>

                    <div className="reset-header">
                        <h1>Reset Your Password</h1>
                        <p>Choose a strong new password to secure your account.</p>
                    </div>

                    {!sessionReady ? (
                        <div className="reset-loading">
                            <div className="reset-spinner"></div>
                            <p>Verifying your reset link...</p>
                        </div>
                    ) : (
                        <form className="reset-main-form" onSubmit={handleSubmit}>
                            <div className="reset-input-field">
                                <label>New Password</label>
                                <div className="reset-pw-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        onInvalid={(e) =>
                                            e.target.setCustomValidity("Please fill in this field.")
                                        }
                                        onInput={(e) => e.target.setCustomValidity("")}
                                    />
                                    <button
                                        type="button"
                                        className="reset-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className="reset-strength">
                                    <div className="reset-strength-bars">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`reset-bar ${i <= strength.level ? "active" : ""}`}
                                                style={{
                                                    background:
                                                        i <= strength.level ? strength.color : undefined,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span
                                        className="reset-strength-label"
                                        style={{ color: strength.color }}
                                    >
                                        {strength.label}
                                    </span>
                                </div>
                            )}

                            {/* Password Requirements */}
                            {newPassword && (
                                <ul className="reset-requirements">
                                    <li className={newPassword.length >= 6 ? "met" : ""}>
                                        At least 6 characters
                                    </li>
                                    <li className={/[A-Z]/.test(newPassword) ? "met" : ""}>
                                        One uppercase letter
                                    </li>
                                    <li className={/[0-9]/.test(newPassword) ? "met" : ""}>
                                        One number
                                    </li>
                                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? "met" : ""}>
                                        One special character
                                    </li>
                                </ul>
                            )}

                            <div className="reset-input-field">
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    onInvalid={(e) =>
                                        e.target.setCustomValidity("Please fill in this field.")
                                    }
                                    onInput={(e) => e.target.setCustomValidity("")}
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <span className="reset-mismatch">Passwords don't match</span>
                                )}
                                {confirmPassword &&
                                    newPassword === confirmPassword &&
                                    confirmPassword.length > 0 && (
                                        <span className="reset-match">✓ Passwords match</span>
                                    )}
                            </div>

                            {status.message && (
                                <div className={`reset-status-msg ${status.type}`}>
                                    {status.type === "success" && (
                                        <span className="status-icon">✅</span>
                                    )}
                                    {status.type === "error" && (
                                        <span className="status-icon">⚠️</span>
                                    )}
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="reset-submit-btn"
                                disabled={
                                    isSubmitting ||
                                    !newPassword ||
                                    !confirmPassword ||
                                    newPassword !== confirmPassword
                                }
                            >
                                {isSubmitting ? "Updating..." : "Save New Password"}
                            </button>
                        </form>
                    )}

                    <p className="reset-back-link">
                        <span onClick={() => navigate("/login")}>Back to Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
