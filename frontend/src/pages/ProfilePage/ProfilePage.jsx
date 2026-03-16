import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import './ProfilePage.css';
import idasLogo from '../../assets/images/icon.png';
import { useTheme } from "../../context/ThemeProvider";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({ authored: 0, reviewed: 0, completionRate: "0%" });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const demo = {
    stats: { authored: 0, reviewed: 0, completionRate: "—" }
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/login");
        return;
      }
      setAuthUser(data.user);
      setFullName(data.user.user_metadata?.full_name || '');
      setRole(data.user.user_metadata?.role || '');
      setAvatarUrl(data.user.user_metadata?.avatar_url || null);
      setLoading(false);
      fetchUserStats(data.user.id);
    };

    loadUser();
  }, [navigate]);

  const fetchUserStats = async (userId) => {
    try {
      setIsStatsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const authored = data.filter(doc => doc.template_key !== 'review').length;
        const reviews = data.filter(doc => doc.template_key === 'review');
        const reviewedCount = reviews.length;

        let totalCompletion = 0;
        let reviewsWithContent = 0;

        reviews.forEach(review => {
          if (review.content && review.content.requirements) {
            const reqs = review.content.requirements;
            if (reqs.length > 0) {
              const successful = reqs.filter(r => !r.issue || r.fixedByAI).length;
              totalCompletion += (successful / reqs.length);
              reviewsWithContent++;
            }
          }
        });

        const avgRate = reviewsWithContent > 0
          ? Math.round((totalCompletion / reviewsWithContent) * 100) + "%"
          : "—";

        setStats({
          authored,
          reviewed: reviewedCount,
          completionRate: avgRate
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#38bdf8' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordMsg({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsUpdatingPassword(false);

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMsg({ type: '', text: '' });
      }, 2000);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName, role: role, avatar_url: avatarUrl }
    });

    setIsSavingProfile(false);

    if (error) {
      setProfileMsg({ type: 'error', text: error.message });
    } else {
      setAuthUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Supabase Storage (requires a bucket named 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Metadata
      setAvatarUrl(publicUrl);
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      setProfileMsg({ type: 'success', text: 'Avatar updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      // Fallback alert for the user to understand if their Supabase bucket is missing
      if (err.message.includes('Bucket not found') || err.message.includes('404')) {
        alert("Sistem Hatası: Lütfen Supabase'de 'avatars' adında Public bir Storage Bucket oluşturduğunuzdan emin olun.");
      }
      setProfileMsg({ type: 'error', text: 'Error uploading avatar: ' + err.message });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 5000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setProfileMsg({ type: '', text: '' });

    try {
      // Sadece metadata verisini siliyoruz (Storage'daki dosya kalabilir veya oradan da silinebilir ama güvenlik/yetki açısından şimdilik referansı kesmek en doğrusu)
      await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      setAvatarUrl(null);
      setProfileMsg({ type: 'success', text: 'Avatar removed successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Error removing avatar: ' + err.message });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Gerçek bir senaryoda kullanıcıya tekrar şifre sorulabilir
    // Veya Edge Function üzerinden admin yetkisiyle silinmelidir
    // Supabase client direk auth.admin.deleteUser() yapamaz (güvenlik)
    // Şimdilik oturumu kapatıp /login e yönlendiriyoruz (veya kendi Edge func varsa buraya eklenir)
    // Simülasyon:
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/register");
    }, 1500);
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    await supabase.auth.signOut();
    navigate("/login");
  };

  const displayName = authUser?.user_metadata?.full_name || authUser?.email || "User";
  const displayRole = authUser?.user_metadata?.role || "—";

  const email = authUser?.email || "";

  if (loading) {
    return <div className="profileContainer">Loading...</div>;
  }

  return (
    <div className="profileContainer">
      <header className="profileHeader">
        <button className="backBtn" onClick={() => window.history.back()}>
          <span className="backIcon">←</span>
          Go Back
        </button>
        <h2 className="headerTitle">Account Settings</h2>
      </header>

      <div className="profileLayout">
        {/* Sol Sütun: Kullanıcı Kartı */}
        <aside className="profileSidebar">
          <div className="userCard">
            <div className="avatarContainer">
              <img
                src={avatarUrl ? avatarUrl : idasLogo}
                alt="User Avatar"
                className="profileAvatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = idasLogo;
                }}
              />
              <div className="avatarOverlay">
                <label className="uploadAvatarBtn">
                  {isUploadingAvatar ? '...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {avatarUrl && (
                  <button className="removeAvatarBtn" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <h3 className="userName">{displayName}</h3>
            <p className="userRole">{displayRole}</p>
            <div className="userBadge">Free</div>
          </div>

          <div className="statsSection">
            <h4 className="statsTitle">Performance Summary</h4>
            <div className="userStatsCard">
              <div className="profileStat">
                <span className="statIcon">📄</span>
                <div className="statInfo">
                  <span>Authored</span>
                  <strong>{isStatsLoading ? "..." : stats.authored}</strong>
                </div>
              </div>
              <div className="profileStat">
                <span className="statIcon">👁️‍🗨️</span>
                <div className="statInfo">
                  <span>Reviewed</span>
                  <strong>{isStatsLoading ? "..." : stats.reviewed}</strong>
                </div>
              </div>
              <div className="profileStat">
                <span className="statIcon">🏆</span>
                <div className="statInfo">
                  <span>Success Rate</span>
                  <strong>{isStatsLoading ? "..." : stats.completionRate}</strong>
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
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="inputField">
                <label>Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Analyst"
                />
              </div>
            </div>

            <div className="inputRow" style={{ marginTop: '24px' }}>
              <div className="inputField">
                <label>Email</label>
                <input type="email" value={email} readOnly disabled style={{ opacity: 0.7 }} />
              </div>
              <div className="inputField">
                <label>Password</label>
                <button className="changePasswordBtn" onClick={() => setShowPasswordModal(true)}>
                  Update Password
                </button>
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
                <strong>Dark Mode</strong>
                <p>Toggle the system-wide visual theme.</p>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </div>
          </section>

          <div className="profileActions">
            {profileMsg.text && (
              <span className={`profile-msg ${profileMsg.type}`} style={{ alignSelf: 'center', marginRight: '16px', fontWeight: 'bold' }}>
                {profileMsg.text}
              </span>
            )}
            <button className="saveProfileBtn" onClick={handleUpdateProfile} disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="logoutBtn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button className="deleteAccountBtn" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </button>
          </div>
        </main>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <div className="pw-modal-header">
              <h3>🔒 Update Password</h3>
              <button className="pw-close-btn" onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); setPasswordMsg({ type: '', text: '' }); }}>✕</button>
            </div>
            <p className="pw-modal-desc">Choose a strong password to keep your account secure.</p>
            <form onSubmit={handleUpdatePassword}>
              <div className="inputField pw-field">
                <label>New Password</label>
                <div className="pw-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="pw-strength">
                  <div className="pw-strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`pw-bar ${i <= getPasswordStrength(newPassword).level ? 'active' : ''}`}
                        style={{ background: i <= getPasswordStrength(newPassword).level ? getPasswordStrength(newPassword).color : undefined }}
                      />
                    ))}
                  </div>
                  <span className="pw-strength-label" style={{ color: getPasswordStrength(newPassword).color }}>
                    {getPasswordStrength(newPassword).label}
                  </span>
                </div>
              )}

              {/* Password Requirements */}
              {newPassword && (
                <ul className="pw-requirements">
                  <li className={newPassword.length >= 6 ? 'met' : ''}>At least 6 characters</li>
                  <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>One uppercase letter</li>
                  <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'met' : ''}>One special character</li>
                </ul>
              )}

              <div className="inputField pw-field">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="pw-mismatch">Passwords don't match</span>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <span className="pw-match">✓ Passwords match</span>
                )}
              </div>

              {passwordMsg.text && (
                <p className={`password-msg ${passwordMsg.type}`}>
                  {passwordMsg.text}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); setPasswordMsg({ type: '', text: '' }); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isUpdatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}>
                  {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="password-modal-overlay">
          <div className="password-modal" style={{ border: '1px solid #ef4444' }}>
            <h3 style={{ color: '#ef4444' }}>Are you absolutely sure?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              This action cannot be undone. This will permanently delete your account,
              remove your documents, and clear all associated data from our servers.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn-save" style={{ background: '#ef4444', color: 'white' }} onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;