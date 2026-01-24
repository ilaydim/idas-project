import React from 'react';
import './ProfilePage.css';
import idasLogo from '../../assets/images/icon.png';

const ProfilePage = () => {
  // Simüle edilmiş kullanıcı verisi
  const user = {
    name: "İlayda Dim",
    role: "Senior Software Analyst",
    email: "ilayda.dim@havelsan.com.tr",
    stats: { authored: 12, reviewed: 8, completionRate: "94%" }
  };

  return (
    <div className="profileContainer">
      <header className="profileHeader">
        <button className="backBtn" onClick={() => window.history.back()}>← Dashboard</button>
        <h2 className="headerTitle">Kullanıcı Profili</h2>
      </header>

      <div className="profileLayout">
        {/* Sol Sütun: Kullanıcı Kartı */}
        <aside className="profileSidebar">
          <div className="userCard">
            <div className="avatarContainer">
              <img src={idasLogo} alt="User Avatar" className="profileAvatar" />
            </div>
            <h3 className="userName">{user.name}</h3>
            <p className="userRole">{user.role}</p>
            <div className="userBadge">Premium Erişimi</div>
          </div>

          <div className="userStatsCard">
            <div className="profileStat">
              <span>Yazılan</span>
              <strong>{user.stats.authored}</strong>
            </div>
            <div className="profileStat">
              <span>İncelenen</span>
              <strong>{user.stats.reviewed}</strong>
            </div>
            <div className="profileStat">
              <span>Başarı</span>
              <strong>{user.stats.completionRate}</strong>
            </div>
          </div>
        </aside>

        {/* Sağ Sütun: Ayarlar ve Tercihler */}
        <main className="profileMain">
          <section className="settingsSection">
            <h3>Hesap Ayarları</h3>
            <div className="inputRow">
              <div className="inputField">
                <label>E-posta</label>
                <input type="email" defaultValue={user.email} />
              </div>
              <div className="inputField">
                <label>Şifre</label>
                <button className="changePasswordBtn">Şifreyi Güncelle</button>
              </div>
            </div>
          </section>

          <section className="settingsSection">
            <h3>Sistem Tercihleri</h3>
            <div className="preferenceItem">
              <div className="prefInfo">
                <strong>AI Otomatik Öneri</strong>
                <p>Yazım sırasında AI'nın otomatik önerilerde bulunmasını sağlar.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="preferenceItem">
              <div className="prefInfo">
                <strong>HAVELSAN Terminoloji Kontrolü</strong>
                <p>Dökümanı HAVELSAN standart terminolojisine göre denetler.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </section>

          <div className="profileActions">
            <button className="saveProfileBtn">Değişiklikleri Kaydet</button>
            <button className="logoutBtn">Oturumu Kapat</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;