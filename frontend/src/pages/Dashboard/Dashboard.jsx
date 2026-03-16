import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../../utils/supabase';
import idasLogo from "../../assets/images/icon.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) { navigate('/login'); return; }
      setAuthUser(data.user);
    };
    loadUser();
  }, [navigate]);

  const fetchDrafts = async () => {
    if (!authUser) return;
    try {
      setIsLoadingDocs(true);
      const { data, error } = await supabase
        .from('documents').select('*')
        .eq('user_id', authUser.id).eq('status', 'draft')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) { console.error(err.message); }
    finally { setIsLoadingDocs(false); }
  };

  useEffect(() => { fetchDrafts(); }, [authUser]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (!error) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } else {
        alert("Error deleting document: " + error.message);
      }
    }
  };

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || "User";
  const avatarUrl = authUser?.user_metadata?.avatar_url || null;
  const initials = useMemo(() => {
    const name = authUser?.user_metadata?.full_name;
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "US";
  }, [authUser]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className="dashboardWrapper">
      <div className="cyber-grid"></div>

      <header className="dashboardHeader">
        <div className="headerLeft">
          <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
          </div>
          <div className="welcome-text">
            <h1>Welcome, {displayName}</h1>
            <p>Your AI-powered SRS workspace is ready.</p>
          </div>
        </div>

        <div className="headerRight">
          <div className="profile-rect" onClick={() => navigate('/profile')} title="My Profile" style={{ overflow: 'hidden', padding: avatarUrl ? '0' : undefined }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="rect-inner">{initials}</div>
            )}
          </div>
          <button className="dashboard-logout-btn" onClick={handleLogout} title="Log Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <div className="modeSelectionGrid">
        {/* Authoring Mode */}
        <div className="modeWrapper author-wrapper">
          <div className="modeCard author" onClick={() => navigate('/authoring')}>
            <div className="modeIcon">✍️</div>
            <div className="modeInfo">
              <h3>Authoring Mode</h3>
              <p>Create new requirements with AI guidance.</p>
            </div>
          </div>
          <div className="preview-below author-preview">
            <div className="editor-sim">
              <div className="typing-lines">
                <div className="t-line l1"><span className="line-num">1</span>The system shall authenticate all users</div>
                <div className="t-line l2"><span className="line-num">2</span>using multi-factor verification before</div>
                <div className="t-line l3"><span className="line-num">3</span>granting access to restricted data.<span className="cursor blink">|</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Mode */}
        <div className="modeWrapper review-wrapper">
          <div className="modeCard review" onClick={() => navigate('/review')}>
            <div className="modeIcon">🔍</div>
            <div className="modeInfo">
              <h3>Review Mode</h3>
              <p>Analyze and debug your SRS documents.</p>
            </div>
          </div>
          <div className="preview-below review-preview">
            <div className="workflow-float">
              <div className="req-list">
                <div className="moving-req req-1">📄 REQ-101</div>
                <div className="moving-req req-2">📄 REQ-102</div>
                <div className="moving-req req-3">📄 REQ-103</div>
              </div>
              <div className="review-flow-right">
                <div className="analyzing-step">
                  <span className="analyzing-label">Analyzing</span>
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
                </div>
                <div className="suggestion-area">
                  <div className="suggestion-chip sc-1">
                    <span className="chip-icon">✨</span>
                    <span className="chip-text">The system shall authenticate all users prior to resource access.</span>
                  </div>
                  <div className="suggestion-chip sc-2">
                    <span className="chip-icon">✨</span>
                    <span className="chip-text">All passwords shall be hashed using bcrypt or stronger.</span>
                  </div>
                  <div className="suggestion-chip sc-3">
                    <span className="chip-icon">✨</span>
                    <span className="chip-text">The login page shall support multiple language localizations.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="workspace-section">
        <div className="workspace-header">
          <div className="workspace-header-text">
            <h2>Recent Documents</h2>
            <p>Manage and edit your saved specifications</p>
          </div>
          <div className="header-line"></div>
        </div>

        <div className="doc-grid-container">
          {isLoadingDocs ? (
            <div className="ai-loader">
              <div className="spinner"></div>
              <p>Syncing with workspace...</p>
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="doc-item-card"
                onClick={() => {
                  if (doc.template_key === 'review') {
                    navigate(`/review?id=${doc.id}`);
                  } else {
                    navigate(`/authoring?id=${doc.id}`);
                  }
                }}
              >
                <div className="doc-card-top">
                  <div className="file-icon-bg">📄</div>
                  <button className="delete-btn" onClick={(e) => handleDelete(e, doc.id)} title="Delete Document">
                    ✕
                  </button>
                </div>

                <div className="doc-card-body">
                  <h4 className="doc-title-text">{(doc.title || "New SRS Document").replace(/^Review:\s*/i, '')}</h4>
                  <div className="doc-meta">
                    <span className="type-tag">{doc.template_key?.toUpperCase() || "SRS"}</span>
                    <span className="status-indicator">Draft</span>
                  </div>
                </div>

                <div className="doc-card-footer">
                  <div className="date-info">
                    <span className="label">Last updated</span>
                    <span className="value">{new Date(doc.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="edit-action">
                    <span>Edit</span>
                    <i className="edit-icon">✎</i>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No documents found</h3>
              <p>Start by creating a new document in Authoring Mode.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="dashboardFooter">
        <p>© 2026 IDAS // Intelligent Documentation Assistant for SRS</p>
      </footer>
    </div>
  );
};

export default Dashboard;