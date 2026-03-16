import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import idasLogo from "../../assets/images/icon.png";
import { supabase } from "../../utils/supabase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        console.log("Already logged in, redirecting to Dashboard...");
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Supabase ile giriş yapıyoruz
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        alert("Login error: " + error.message);
        return;
      }

      if (data.user) {
        console.log("Login successful, redirecting to Dashboard...");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* SOL TARAF: Login'e özel AI Scanner Animasyonu (Bozulmadı) */}
      <div className="login-visual-section">
        <div className="login-visual-text">
          <h2>Welcome Back</h2>
          <p>Login to keep optimizing your SRS documents with AI precision.</p>
        </div>

        <div className="login-ai-console">
          <div className="console-nav">
            <span className="c-dot r"></span>
            <span className="c-dot y"></span>
            <span className="c-dot g"></span>
            <div className="c-title">IDAS AI ANALYSIS</div>
          </div>
          <div className="console-content">
            <div className="console-line">
              <span className="c-id">FR-102:</span> The interface <span className="c-bad">should be very good</span>.
            </div>
            <div className="console-fix-popup">
              <div className="c-fix-title">✨ AI REFINEMENT</div>
              <div className="c-fix-body">
                The interface <span className="c-good">shall adhere to WCAG 2.1 accessibility standards</span>.
              </div>
            </div>
            <div className="console-scanner-line"></div>
          </div>
        </div>
        <div className="login-background-glow"></div>
      </div>

      {/* SAĞ TARAF: Register Sayfasıyla Aynı Stil ve Yerleşim */}
      <div className="login-form-section">
        <div className="login-form-container">

          <div className="login-logo-holder" onClick={() => navigate("/")}>
            <img src={idasLogo} alt="IDAS Logo" />
          </div>

          <div className="login-welcome-msg">
            <h1>Login to IDAS</h1>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form className="login-main-form" onSubmit={handleSubmit}>
            <div className="login-input-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                onInvalid={(e) => e.target.setCustomValidity('Please fill in this field.')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </div>

            <div className="login-input-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                onInvalid={(e) => e.target.setCustomValidity('Please fill in this field.')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </div>

            <div className="login-helper-text">
              <span onClick={() => navigate("/forgot-password")}>Forgot password?</span>
            </div>

            <button type="submit" className="login-submit-btn">Sign In</button>
          </form>

          <p className="login-switch-page">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;