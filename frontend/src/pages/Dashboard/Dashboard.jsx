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
  const initials = useMemo(() => {
    const name = authUser?.user_metadata?.full_name;
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "ID";
  }, [authUser]);

  return (
    <div className="dashboardWrapper">
      <div className="cyber-grid"></div>

      <header className="dashboardHeader">
        <div className="headerLeft">
          <div className="logo-area" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
          </div>
          <div className="welcome-text">
            <h1>Welcome, {displayName}</h1>
            <p>Your AI-powered SRS workspace is ready.</p>
          </div>
        </div>
        
        <div className="headerRight">
          <div className="profile-rect" onClick={() => navigate('/profile')} title="My Profile">
            <div className="rect-inner">{initials}</div>
          </div>
        </div>
      </header>

      <div className="modeSelectionGrid">
        <div className="modeCard author" onClick={() => navigate('/authoring')}>
          <div className="modeIcon">✍️</div>
          <div className="modeInfo">
            <h3>Authoring Mode</h3>
            <p>Create new requirements with AI guidance.</p>
          </div>
          <div className="scan-line"></div>
        </div>

        <div className="modeCard review" onClick={() => navigate('/review')}>
          <div className="modeIcon">🔍</div>
          <div className="modeInfo">
            <h3>Review Mode</h3>
            <p>Analyze and debug your SRS documents.</p>
          </div>
          <div className="scan-line"></div>
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
              <div key={doc.id} className="doc-item-card" onClick={() => navigate(`/authoring?id=${doc.id}`)}>
                <div className="doc-card-top">
                  <div className="file-icon-bg">📄</div>
                  <button className="delete-btn" onClick={(e) => handleDelete(e, doc.id)} title="Delete Document">
                    ✕
                  </button>
                </div>
                
                <div className="doc-card-body">
                  <h4 className="doc-title-text">{doc.title || "New SRS Document"}</h4>
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
        <p>© 2024 IDAS // Intelligent Documentation Assistant for SRS</p>
      </footer>
    </div>
  );
};

export default Dashboard;