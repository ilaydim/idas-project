import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";
import idasLogo from "../../assets/images/icon.png";
import { supabase } from "../../utils/supabase";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: "", message: "" });

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                if (error.message.includes("User not found")) {
                    setStatus({ type: "error", message: "Kayıtlı değilsiniz, lütfen kayıt olun." });
                } else {
                    setStatus({ type: "error", message: error.message });
                }
            } else {
                setStatus({
                    type: "success",
                    message: "If an account exists with this email, a reset link has been sent. Please check your inbox.",
                });
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

    return (
        <div className="forgot-page-wrapper">
            <div className="forgot-form-section">
                <div className="forgot-form-container">
                    <div className="forgot-logo-holder" onClick={() => navigate("/")}>
                        <img src={idasLogo} alt="IDAS Logo" />
                    </div>

                    <div className="forgot-header">
                        <h1>Forgot Password?</h1>
                        <p>
                            No worries! Enter your email address and we'll send you a link to
                            reset your password.
                        </p>
                    </div>

                    <form className="forgot-main-form" onSubmit={handleSubmit}>
                        <div className="forgot-input-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                onInvalid={(e) =>
                                    e.target.setCustomValidity("Please fill in this field.")
                                }
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>

                        {status.message && (
                            <div className={`forgot-status-msg ${status.type}`}>
                                {status.type === "success" && <span className="status-icon">✉️</span>}
                                {status.type === "error" && <span className="status-icon">⚠️</span>}
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="forgot-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <p className="forgot-back-link">
                        Remember your password?{" "}
                        <span onClick={() => navigate("/login")}>Back to Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
