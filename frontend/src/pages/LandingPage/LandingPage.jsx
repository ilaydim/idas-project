import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import idasLogo from "../../assets/images/icon.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <header className="landing-nav">
        <div className="nav-logo">
          {/* Logo artık tek başına ve daha büyük olacak */}
          <img src={idasLogo} alt="IDAS Logo" className="main-logo-img" />
        </div>
        <div className="nav-actions">
          {/* Üst menüde sadece hesabına girecekler için "Log In" var */}
          <button className="btn-login-text" onClick={() => navigate("/login")}>Log In</button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="landing-hero">
        <div className="hero-content-left">
          <div className="hero-eyebrow">
            <span className="sparkle">✨</span> Intelligent Validation Based on IEEE Standards
          </div>
          <h1 className="hero-title">
            LLM-Powered Requirement Perfection<br/>
            <span className="text-gradient">in Seconds.</span>
          </h1>
          <p className="hero-subtitle">
            Analyze your SRS documents in real-time powered by Gemini AI. Instantly detect requirements failing SMART criteria and fix them with intelligent suggestions.
          </p>
          <div className="hero-buttons">
            {/* Ortada sadece yeni kullanıcıyı çekecek dev bir buton var */}
            <button className="btn-primary-large" onClick={() => navigate("/register")}>
              Start for Free <span></span>
            </button>
          </div>
        </div>

        {/* HERO RIGHT - MOCK UI */}
        <div className="hero-visual-right">
          <div className="mock-window">
            <div className="mock-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mock-body">
              <div className="mock-req-line">FR-01: The system should work very fast.</div>
              <div className="floating-ai-card">
                <div className="card-top">
                  <span className="mock-id">#FR-01</span>
                  <span className="mock-badge">Not Measurable</span>
                </div>
                <div className="card-text">"Fast" is not a measurable metric.</div>
                <div className="card-suggestion">Suggestion: Update to "System response time should be under 200ms".</div>
              </div>
            </div>
          </div>
          <div className="glow-blob"></div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="landing-features">
        <div className="feature-card">
          <div className="f-icon">⚡</div>
          <h3>Real-Time Analysis</h3>
          <p>As you type, our background AI instantly audits your requirements for inconsistencies.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🖱️</div>
          <h3>Drag & Drop Editing</h3>
          <p>Apply AI-driven correction suggestions directly to your document with a single click or drag.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🎯</div>
          <h3>SMART & IEEE Compliance</h3>
          <p>Meet international standards effortlessly with Specific, Measurable, and Achievable criteria checks.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;