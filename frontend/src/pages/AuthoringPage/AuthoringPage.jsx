import React, { useState, useEffect } from "react";
import { SRS_TEMPLATES } from "../../utils/templates";
import DownloadMenu from "../../components/DownloadMenu/DownloadMenu";
import "./AuthoringPage.css";

const AuthoringPage = () => {
  // --- DURUM YÖNETİMİ ---
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [content, setContent] = useState({});
  const [progress, setProgress] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages] = useState([
    { role: 'ai', text: 'Hazırım. Döküman yapısını tamamladıktan sonra indirebilirsin.' }
  ]);
  const [revisionHistory, setRevisionHistory] = useState([
    { id: 1, name: "İlayda Dim", date: "24.01.2026", reason: "Initial Setup", version: "0.1" }
  ]);

  // --- İLERLEME HESAPLAMA ---
  useEffect(() => {
    if (isTemplateLocked && selectedTemplate) {
      const sections = SRS_TEMPLATES[selectedTemplate].sections;
      const required = sections.filter(s => s.required);
      const filled = required.filter(s => content[s.id] && content[s.id].trim().length > 0).length;
      setProgress(Math.round((filled / required.length) * 100));
    }
  }, [content, selectedTemplate, isTemplateLocked]);

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

  return (
    <div className="auth-master-container">
      {/* 1. ÜST NAVBAR */}
      <header className="auth-modern-nav">
        <div className="nav-group-left">
          <button className="nav-back-pill" onClick={() => window.history.back()}>← Dashboard</button>
          <div className="nav-breadcrumb">
            <span 
              className={`breadcrumb-clickable ${isTemplateLocked ? 'active' : ''}`} 
              onClick={isTemplateLocked ? handleGoBackToSelection : null}
            >
              Authoring Mode
            </span>
            {isTemplateLocked && (
              <>
                <span className="path-divider">/</span>
                <span className="active-template-name">{SRS_TEMPLATES[selectedTemplate].title}</span>
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
          <button className="nav-save-btn" disabled={!isTemplateLocked}>Taslağı Kaydet</button>
          <div className="nav-avatar">İD</div>
        </div>
      </header>

      {/* 2. ANA İÇERİK ALANI */}
      {!isTemplateLocked ? (
        /* ŞABLON SEÇİM EKRANI */
        <div className="template-selection-view">
          <div className="selection-card">
            <h1 className="selection-title">Yeni Döküman Başlat</h1>
            <p className="selection-subtitle">Lütfen standart yapıyı seçin. İçindekiler ve Revizyon Geçmişi otomatik oluşturulacaktır.</p>
            <div className="template-grid">
              {Object.keys(SRS_TEMPLATES).map(key => (
                <div key={key} className="template-card-box" onClick={() => handleTemplateSelect(key)}>
                  <div className="t-card-icon">{key.includes('IEEE') ? '🌐' : '🏢'}</div>
                  <h3>{SRS_TEMPLATES[key].title}</h3>
                  <p>{SRS_TEMPLATES[key].description}</p>
                  <div className="select-badge">Seç ve Başla</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* EDİTÖR GÖRÜNÜMÜ */
        <div className="auth-main-layout">
          {/* SOL: Navigasyon */}
          <aside className="auth-sidebar-nav">
            <div className="panel-tag">DÖKÜMAN YAPISI</div>
            <div className="sidebar-scroller">
              <div className={`section-row ${activeSection === "toc" ? "active" : ""}`} onClick={() => setActiveSection("toc")}>
                <div className="indicator-dot"></div>
                <span className="section-title-text">Table of Contents</span>
              </div>
              {SRS_TEMPLATES[selectedTemplate].sections.map(s => (
                <div 
                  key={s.id} 
                  className={`section-row ${activeSection === s.id ? "active" : ""} ${content[s.id]?.length > 0 ? "completed" : ""}`} 
                  onClick={() => setActiveSection(s.id)}
                >
                  <div className="indicator-dot"></div>
                  <span className="section-title-text">{s.title}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ORTA: Editör veya TOC Sayfası */}
          <main className="auth-editor-core">
            <div className="editor-top-info">
               <h2>{activeSection === "toc" ? "Table of Contents & History" : SRS_TEMPLATES[selectedTemplate].sections.find(s => s.id === activeSection)?.title}</h2>
               <p className="hint-text">
                 {activeSection === "toc" ? "Döküman hiyerarşisini takip edin." : (SRS_TEMPLATES[selectedTemplate].sections.find(s => s.id === activeSection)?.hint || "Yazmaya başlayın...")}
               </p>
            </div>

            <div className="textarea-wrapper scrollable-view">
              {activeSection === "toc" ? (
                /* İÇİNDEKİLER VE REVİZYON SAYFASI */
                <div className="toc-dynamic-page">
                  <div className="toc-list">
                    {SRS_TEMPLATES[selectedTemplate].sections.map(s => (
                      <div key={s.id} className="toc-entry" onClick={() => setActiveSection(s.id)}>
                        <span className="toc-entry-title">{s.title}</span>
                        <div className="toc-entry-dots"></div>
                        <span className="toc-entry-page">GİT</span>
                      </div>
                    ))}
                  </div>

                  <div className="revision-history-box">
                    <div className="rev-header-row">
                      <h3>Revision History</h3>
                      <button className="add-rev-btn" onClick={addRevisionRow}>+ Yeni Satır</button>
                    </div>
                    <table className="revision-table">
                      <thead>
                        <tr><th>Name</th><th>Date</th><th>Reason</th><th>Version</th></tr>
                      </thead>
                      <tbody>
                        {revisionHistory.map(row => (
                          <tr key={row.id}>
                            <td><input value={row.name} onChange={e => updateRevision(row.id, "name", e.target.value)} placeholder="İsim..." /></td>
                            <td><input value={row.date} onChange={e => updateRevision(row.id, "date", e.target.value)} placeholder="Tarih..." /></td>
                            <td><input value={row.reason} onChange={e => updateRevision(row.id, "reason", e.target.value)} placeholder="Neden..." /></td>
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
                  onChange={e => setContent({...content, [activeSection]: e.target.value})} 
                  placeholder="Gereksinimleri teknik bir dille buraya yazın..."
                />
              )}
            </div>
          </main>

          {/* SAĞ: AI Yan Panel */}
          <aside className="auth-ai-sidebar">
            <div className="ai-analysis-layer">
              <div className="panel-tag">💡 CANLI ANALİZ</div>
              <div className="warning-scroll-area">
                <div className="analysis-card error">
                  <div className="card-head"><strong>Belirsizlik</strong></div>
                  <p>"Hızlıca" kelimesi ölçülebilir değil.</p>
                </div>
              </div>
            </div>
            <div className="ai-chat-layer">
              <div className="panel-tag">💬 AI ASİSTANI</div>
              <div className="chat-history-area">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-msg-bubble ${m.role}`}>{m.text}</div>
                ))}
              </div>
              <div className="chat-input-bar">
                <input 
                  type="text" 
                  placeholder="Yardım isteyin..." 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                />
                <button className="chat-send-btn">➤</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default AuthoringPage;