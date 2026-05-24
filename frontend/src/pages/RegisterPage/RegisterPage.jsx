import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import idasLogo from "../../assets/images/icon.png";
import { supabase } from "../../utils/supabase"; // Yolun doğru olduğundan emin ol

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sadece geçerli mail formatlarını kabul et (ör: saklavciyaren@gmail.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Lütfen geçerli bir e-posta adresi girin (örneğin: isim@gmail.com).");
      return;
    }

    try {
      // 1. Supabase ile kayıt işlemini başlat
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name, // İsmi metadata olarak kaydediyoruz
          },
        },
      });

      if (error) throw error;

      if (data) {
        // E-posta onayı kapalı olduğu için Supabase arka planda otomatik giriş yaptı.
        // Kullanıcıyı direkt sisteme (dashboard'a) alıyoruz.
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Registration failed: " + error.message);
      console.error("Error details:", error);
    }
  };

  return (
    <div className="register-container">
      {/* --- SOL PANEL: CANLI ANALİZ KARTLARI --- */}
      <div className="register-brand-side">

        {/* SÜZÜLEN AI KARTLARI KONTEYNERİ (10 Kart) */}
        <div className="floating-cards-container">

          {/* KART 1: Not Specific */}
          <div className="floating-ai-card card-pos-1">
            <div className="card-top">
              <span className="mock-id">#FR-05</span>
              <span className="mock-badge badge-s">Not Specific</span>
            </div>
            <div className="card-text">"The system should be user-friendly" is vague.</div>
            <div className="card-suggestion">Suggestion: Define specific usability criteria (e.g., SUS score 80).</div>
          </div>

          {/* KART 2: Not Measurable */}
          <div className="floating-ai-card card-pos-2">
            <div className="card-top">
              <span className="mock-id">#NFR-12</span>
              <span className="mock-badge badge-m">Not Measurable</span>
            </div>
            <div className="card-text">"Pages should load quickly" is not measurable.</div>
            <div className="card-suggestion">Suggestion: "Page load time must be under 2s on a 4G connection."</div>
          </div>

          {/* KART 3: Not Time-bound */}
          <div className="floating-ai-card card-pos-3">
            <div className="card-top">
              <span className="mock-id">#FR-21</span>
              <span className="mock-badge badge-t">Not Time-bound</span>
            </div>
            <div className="card-text">"Reporting module will be completed" lacks a deadline.</div>
            <div className="card-suggestion">Suggestion: "Reporting module will be deployed by the end of Q3."</div>
          </div>

          {/* KART 4: Not Achievable */}
          <div className="floating-ai-card card-pos-4">
            <div className="card-top">
              <span className="mock-id">#NFR-08</span>
              <span className="mock-badge badge-a">Not Achievable</span>
            </div>
            <div className="card-text">"100% bug-free operation" is unrealistic.</div>
            <div className="card-suggestion">Suggestion: Target a realistic crash-free rate like 99.9%.</div>
          </div>

          {/* KART 5: Not Relevant */}
          <div className="floating-ai-card card-pos-5">
            <div className="card-top">
              <span className="mock-id">#FR-15</span>
              <span className="mock-badge badge-r">Not Relevant</span>
            </div>
            <div className="card-text">"End-users view DB schema" does not align with user goals.</div>
            <div className="card-suggestion">Suggestion: Remove or restrict this requirement to system admins.</div>
          </div>

          {/* KART 6: Not Measurable (Küçük) */}
          <div className="floating-ai-card card-pos-6">
            <div className="card-top">
              <span className="mock-id">#FR-34</span>
              <span className="mock-badge badge-m">Not Measurable</span>
            </div>
            <div className="card-text">"Provide high security" needs metrics.</div>
            <div className="card-suggestion">Suggestion: "Implement AES-256 encryption."</div>
          </div>

          {/* KART 7: Not Specific (Büyük) */}
          <div className="floating-ai-card card-pos-7">
            <div className="card-top">
              <span className="mock-id">#NFR-41</span>
              <span className="mock-badge badge-s">Not Specific</span>
            </div>
            <div className="card-text">"Support multiple browsers" is ambiguous.</div>
            <div className="card-suggestion">Suggestion: "Support Chrome v90+, Firefox v88+, and Safari v14+."</div>
          </div>

          {/* KART 8: Not Time-bound (Küçük) */}
          <div className="floating-ai-card card-pos-8">
            <div className="card-top">
              <span className="mock-id">#FR-09</span>
              <span className="mock-badge badge-t">Not Time-bound</span>
            </div>
            <div className="card-text">"Update cache eventually" needs timeline.</div>
            <div className="card-suggestion">Suggestion: "Update cache every 15 minutes."</div>
          </div>

          {/* KART 9: Not Achievable */}
          <div className="floating-ai-card card-pos-9">
            <div className="card-top">
              <span className="mock-id">#NFR-18</span>
              <span className="mock-badge badge-a">Not Achievable</span>
            </div>
            <div className="card-text">"Handle 10 billion concurrent users" is likely excessive.</div>
            <div className="card-suggestion">Suggestion: Define peak load based on actual market data.</div>
          </div>

          {/* KART 10: Not Relevant (Küçük) */}
          <div className="floating-ai-card card-pos-10">
            <div className="card-top">
              <span className="mock-id">#FR-52</span>
              <span className="mock-badge badge-r">Not Relevant</span>
            </div>
            <div className="card-text">"Include a weather widget" is out of scope.</div>
            <div className="card-suggestion">Suggestion: Remove this feature.</div>
          </div>

        </div>

        {/* Arka plan parlaması (Koyu mavi arka planla uyumlu olacak şekilde ayarlandı) */}
        <div className="register-glow-blob"></div>
      </div>

      {/* --- SAĞ PANEL: FORM ALANI --- */}
      <div className="register-form-side">
        <div className="form-wrapper">

          <div className="form-logo-center" onClick={() => navigate("/")}>
            <img src={idasLogo} alt="IDAS Logo" />
          </div>

          <div className="form-header">
            <h2>Create an Account</h2>
            <p>Enter your details to get started with IDAS.</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                onInvalid={(e) => e.target.setCustomValidity('Please fill in this field.')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </div>

            <div className="input-group">
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

            <div className="input-group">
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

            <button type="submit" className="btn-register-primary">Sign Up</button>
          </form>

          <div className="register-footer">
            Already have an account? <span onClick={() => navigate("/login")}>Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;