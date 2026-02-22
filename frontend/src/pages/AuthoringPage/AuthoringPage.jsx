import React, { useState, useEffect } from "react";
import DownloadMenu from "../../components/DownloadMenu/DownloadMenu";
import DocumentStructure from "./components/DocumentStructure";
import AIAssistant from "./components/AIAssistant";
import "./AuthoringPage.css";

const AuthoringPage = () => {
  // --- DURUM YÖNETİMİ ---
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [content, setContent] = useState({});
  const [progress, setProgress] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [templates, setTemplates] = useState({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [revisionHistory, setRevisionHistory] = useState([]);
  const [user, setUser] = useState({ name: "", initials: "" });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uiConfig, setUiConfig] = useState(null);

  // --- ŞABLONLARI ÇEKME ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Templates
        const tResp = await fetch("http://localhost:8088/templates");
        const tData = await tResp.json();
        setTemplates(tData);

        // Fetch Session / Document Data
        const sResp = await fetch("http://localhost:8088/session");
        const sData = await sResp.json();
        setMessages(sData.document.messages);
        setRevisionHistory(sData.document.revisionHistory);
        setContent(sData.document.content);
        setUser(sData.user);

        // Fetch UI Config
        const cResp = await fetch("http://localhost:8088/ui-config");
        const cData = await cResp.json();
        setUiConfig(cData);
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchData();
  }, []);

  // --- İLERLEME HESAPLAMA ---
  useEffect(() => {
    if (isTemplateLocked && selectedTemplate && templates[selectedTemplate]) {
      const sections = templates[selectedTemplate].sections;
      const required = sections.filter(s => s.required);
      const filled = required.filter(s => content[s.id] && content[s.id].trim().length > 0).length;
      setProgress(Math.round((filled / required.length) * 100));
    }
  }, [content, selectedTemplate, isTemplateLocked, templates]);

  // --- OTOMATİK ANALİZ (DEBOUNCE) ---
  useEffect(() => {
    if (!activeSection || activeSection === "toc" || !content[activeSection]) {
      setAnalysisResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch("http://localhost:8088/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content[activeSection] })
        });
        const data = await response.json();

        // Backend'den gelen cevabı array formatına sokalım (virgülle ayrılmış veya satır satır olabilir)
        // Şimdilik basitçe tüm metni bir kart olarak gösterelim veya '.' ile ayıralım
        const results = data.result.split('\n').filter(r => r.trim().length > 0);
        setAnalysisResults(results);
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000); // 2 saniye bekle

    return () => clearTimeout(timer);
  }, [content[activeSection], activeSection]);

  // --- FONKSİYONLAR ---
  const handleTemplateSelect = (tempKey) => {
    setSelectedTemplate(tempKey);
    setIsTemplateLocked(true);
    setActiveSection("toc"); // İlk açılışta İçindekiler'i göster
  };

  const handleGoBackToSelection = () => {
    // Kullanıcı geri dönmek isterse her şeyi sıfırla
    setIsTemplateLocked(false);
    setSelectedTemplate(null);
    setContent({});
    setProgress(0);
  };

  const addRevisionRow = () => {
    setRevisionHistory([...revisionHistory, { id: Date.now(), name: "", date: "", reason: "", version: "" }]);
  };

  const updateRevision = (id, field, value) => {
    setRevisionHistory(revisionHistory.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const issueText = e.dataTransfer.getData("issueText");
    if (!issueText) return;

    setMessages(prev => [...prev, { role: 'user', text: `Bu sorunu nasıl çözebilirim: "${issueText}"` }]);

    try {
      const response = await fetch("http://localhost:8088/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: issueText })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
    } catch (error) {
      console.error("Resolution error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I cannot help right now." }]);
    }
  };



  return (
    <div className="auth-master-container">
      {/* 1. ÜST NAVBAR */}
      <header className="auth-modern-nav">
        <div className="nav-group-left">
          <button className="nav-back-pill" onClick={() => window.history.back()}>
            {uiConfig?.navbar.dashboard_btn || "..."}
          </button>
          <div className="nav-breadcrumb">
            <span
              className={`breadcrumb-clickable ${isTemplateLocked ? 'active' : ''}`}
              onClick={isTemplateLocked ? handleGoBackToSelection : null}
            >
              {uiConfig?.navbar.mode_title || "..."}
            </span>
            {isTemplateLocked && templates[selectedTemplate] && (
              <>
                <span className="path-divider">/</span>
                <span className="active-template-name">{templates[selectedTemplate].title}</span>
              </>
            )}
          </div>
        </div>

        <div className="nav-group-right">
          {isTemplateLocked && (
            <>
              {/* İNDİRME DROPDOWN BİLEŞENİ */}
              <DownloadMenu
                selectedTemplate={selectedTemplate}
                content={content}
                revisionHistory={revisionHistory}
                templates={templates}
                uiConfig={uiConfig}
              />
              <div className="circular-progress-box">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="prog-number">%{progress}</span>
              </div>
            </>
          )}
          <button className="nav-save-btn" disabled={!isTemplateLocked}>
            {uiConfig?.navbar.save_btn || "..."}
          </button>
          <div className="nav-avatar">{user.initials}</div>
        </div>
      </header>

      {/* 2. ANA İÇERİK ALANI */}
      {!isTemplateLocked ? (
        /* ŞABLON SEÇİM EKRANI */
        <div className="template-selection-view">
          <div className="selection-hero">
            <div className="selection-hero-left">
              <p className="hero-eyebrow">Authoring Mode</p>
              <h1 className="hero-title">
                {uiConfig?.navbar.selection_title || "Start New Document"}
              </h1>
              <p className="hero-subtitle">
                {uiConfig?.navbar.selection_subtitle || "Choose a standard template to start authoring your SRS document."}
              </p>
              <div className="hero-badge">
                <span className="badge-dot" />
                Ready to begin
              </div>
            </div>
            <div className="selection-hero-right">
              <p className="template-list-label">Choose a standard</p>
              <div className="template-list">
                {isLoadingTemplates ? (
                  <div className="loading-templates">Loading templates...</div>
                ) : Object.keys(templates).length > 0 ? (
                  Object.keys(templates).map((key, idx) => {
                    const colors = [
                      { bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '🌐' },
                      { bg: 'linear-gradient(135deg, #0ea5e9, #2563eb)', icon: '🏢' },
                      { bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: '📋' },
                      { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '🔬' },
                    ];
                    const style = colors[idx % colors.length];
                    return (
                      <div key={key} className="template-list-item" onClick={() => handleTemplateSelect(key)}>
                        <div className="tli-icon" style={{ background: style.bg }}>
                          {style.icon}
                        </div>
                        <div className="tli-text">
                          <h3>{templates[key].title}</h3>
                          <p>{templates[key].description}</p>
                        </div>
                        <div className="tli-arrow">→</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-templates">No templates found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EDİTÖR GÖRÜNÜMÜ */
        <div className="auth-main-layout">
          <DocumentStructure
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sections={templates[selectedTemplate]?.sections || []}
            content={content}
            uiConfig={uiConfig}
          />

          {/* ORTA: Editör veya TOC Sayfası */}
          <main className="auth-editor-core">
            <div className="editor-top-info">
              <h2>{activeSection === "toc" ? (uiConfig?.editor.toc_title || "...") : templates[selectedTemplate]?.sections.find(s => s.id === activeSection)?.title}</h2>
              <p className="hint-text">
                {activeSection === "toc" ? (uiConfig?.editor.toc_hint || "...") : (templates[selectedTemplate]?.sections.find(s => s.id === activeSection)?.hint || "...")}
              </p>
            </div>

            <div className="textarea-wrapper scrollable-view">
              {activeSection === "toc" ? (
                /* İÇİNDEKİLER VE REVİZYON SAYFASI */
                <div className="toc-dynamic-page">
                  <div className="toc-list">
                    {templates[selectedTemplate]?.sections.map(s => (
                      <div key={s.id} className="toc-entry" onClick={() => setActiveSection(s.id)}>
                        <span className="toc-entry-title">{s.title}</span>
                        <div className="toc-entry-dots"></div>
                        <span className="toc-entry-page">GO</span>
                      </div>
                    ))}
                  </div>

                  <div className="revision-history-box">
                    <div className="rev-header-row">
                      <h3>Revision History</h3>
                      <button className="add-rev-btn" onClick={addRevisionRow}>+ New Row</button>
                    </div>
                    <table className="revision-table">
                      <thead>
                        <tr><th>Name</th><th>Date</th><th>Reason</th><th>Version</th></tr>
                      </thead>
                      <tbody>
                        {revisionHistory.map(row => (
                          <tr key={row.id}>
                            <td><input value={row.name} onChange={e => updateRevision(row.id, "name", e.target.value)} placeholder="Name..." /></td>
                            <td><input value={row.date} onChange={e => updateRevision(row.id, "date", e.target.value)} placeholder="Date..." /></td>
                            <td><input value={row.reason} onChange={e => updateRevision(row.id, "reason", e.target.value)} placeholder="Reason..." /></td>
                            <td><input value={row.version} onChange={e => updateRevision(row.id, "version", e.target.value)} placeholder="0.1" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* METİN EDİTÖRÜ */
                <textarea
                  className="main-editor-textarea"
                  value={content[activeSection] || ""}
                  onChange={e => setContent({ ...content, [activeSection]: e.target.value })}
                  placeholder={uiConfig?.editor.placeholder || "..."}
                />
              )}
            </div>
          </main>

          <AIAssistant
            messages={messages}
            setMessages={setMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isDraggingOver={isDraggingOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            analysisResults={analysisResults}
            isAnalyzing={isAnalyzing}
            uiConfig={uiConfig}
          />
        </div>
      )}
    </div>
  );
};

export default AuthoringPage;