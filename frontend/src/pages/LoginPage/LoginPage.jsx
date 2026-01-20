import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

// Logoyu klasör yapınıza uygun şekilde içe aktarın
import idasLogo from '../../assets/images/icon.png';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <div className="text-center">
          {/* Emojiyi kaldırıp resmi ekliyoruz */}
          <div className="logoIconContainer">
            <img src={idasLogo} alt="IDAS Logo" className="logoImage" />
          </div>
          <h2 className="font-bold text-2xl text-slate-800">IDAS: Akıllı SRS Asistanı</h2>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8">
          <div className="inputGroup">
            <label>Kullanıcı Adı</label>
            <input type="text" placeholder="Kullanıcı Adınızı Giriniz..." required />
          </div>
          <div className="inputGroup">
            <label>Şifre</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="loginBtn">Sisteme Giriş Yap</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;