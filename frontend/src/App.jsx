import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Yeni klasör yapısına göre import yolları 
import LoginPage from "./pages/LoginPage/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import AuthoringPage from "./pages/AuthoringPage/AuthoringPage";
import ReviewPage from "./pages/ReviewPage/ReviewPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Giriş ekranı - Kimlik doğrulama gereksinimi için [cite: 130, 209] */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Dashboard - Mod seçimi için [cite: 77, 142] */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Yazım Modu - HAVELSAN şablonu desteği [cite: 19, 307] */}
          <Route path="/authoring" element={<AuthoringPage />} />
          
          {/* İnceleme Modu - .docx analizi için [cite: 20, 237] */}
          <Route path="/review" element={<ReviewPage />} />
          
          {/* Hatalı rotalarda Giriş sayfasına yönlendir [cite: 132, 173] */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;