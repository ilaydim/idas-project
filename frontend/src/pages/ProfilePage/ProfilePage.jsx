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
        <button className="backBtn" onClick={() => window.history.back()}>
          <span className="backIcon">←</span>
          Geri Dön
        </button>
        <h2 className="headerTitle">Hesap Ayarları</h2>
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
            <div className="userBadge">Premium Access</div>
          </div>

          <div className="statsSection">
            <h4 className="statsTitle">Performance Summary</h4>
            <div className="userStatsCard">
              <div className="profileStat">
                <span className="statIcon">📄</span>
                <div className="statInfo">
                  <span>Authored</span>
                  <strong>{user.stats.authored}</strong>
                </div>
              </div>
              <div className="profileStat">
                <span className="statIcon">👁️‍🗨️</span>
                <div className="statInfo">
                  <span>Reviewed</span>
                  <strong>{user.stats.reviewed}</strong>
                </div>
              </div>
              <div className="profileStat">
                <span className="statIcon">🏆</span>
                <div className="statInfo">
                  <span>Success Rate</span>
                  <strong>{user.stats.completionRate}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Sağ Sütun: Ayarlar ve Tercihler */}
        <main className="profileMain">
          <section className="settingsSection">
            <h3>Account Settings</h3>
            <div className="inputRow">
              <div className="inputField">
                <label>Email</label>
                <input type="email" defaultValue={user.email} />
              </div>
              <div className="inputField">
                <label>Password</label>
                <button className="changePasswordBtn">Update Password</button>
              </div>
            </div>
          </section>

          <section className="settingsSection">
            <h3>System Preferences</h3>
            <div className="preferenceItem">
              <div className="prefInfo">
                <strong>AI Auto-Suggest</strong>
                <p>Enables automatic AI suggestions during writing.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="preferenceItem">
              <div className="prefInfo">
                <strong>HAVELSAN Terminology Check</strong>
                <p>Checks the document according to HAVELSAN standard terminology.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </section>

          <div className="profileActions">
            <button className="saveProfileBtn">Save Changes</button>
            <button className="logoutBtn">Log Out</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;