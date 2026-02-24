import React, { useState, useEffect, useRef } from "react";
import DownloadMenu from "../../components/DownloadMenu/DownloadMenu";
import DocumentStructure from "./components/DocumentStructure";
import AIAssistant from "./components/AIAssistant";
import "./AuthoringPage.css";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

const AuthoringPage = () => {
  // --- DURUM YÖNETİMİ ---
  const navigate = useNavigate();
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
  const lastAnalyzedText = useRef(""); // İstekleri frenlemek için hafıza
  const [activeHighlightId, setActiveHighlightId] = useState(null);

  // --- ŞABLONLARI ÇEKME (BU BLOĞU GÜNCELLE) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tResp = await fetch("http://localhost:8088/templates");
        const tData = await tResp.json();
        setTemplates(tData);

        const cResp = await fetch("http://localhost:8088/ui-config");
        const cData = await cResp.json();
        setUiConfig(cData);

        // --- SUPABASE BAĞLANTISI BURADA BAŞLIYOR ---
        const params = new URLSearchParams(window.location.search);
        const docId = params.get("id");

        if (docId) {
          const { data: documentData, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', docId) // Sadece bu ID'li dökümanı getir
            .single();      // Tek bir obje olarak al

          if (documentData && !error) {
            setSelectedTemplate(documentData.template_key);
            setIsTemplateLocked(true);
            setContent(documentData.content || {}); // Veri artık buraya dolacak
            setRevisionHistory(documentData.revision_history || []);
            setProgress(documentData.progress || 0);
            setActiveSection("toc");
          }
        } else {
          // Yeni dökümansa eski local session mantığı kalsın
          const sResp = await fetch("http://localhost:8088/session");
          const sData = await sResp.json();
          setMessages(sData.document.messages);
          setRevisionHistory(sData.document.revisionHistory);
          setContent(sData.document.content);
          setUser(sData.user);
        }
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

  // --- DİNAMİK KULLANICI BİLGİSİNİ ÇEKME ---
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // İsim metadata'da varsa al, yoksa email'in @'ten önceki kısmını al
        const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0];
        
        // Baş harfleri hesapla (Örn: "İlayda Dim" -> "İD")
        const nameParts = fullName.split(' ').filter(part => part.length > 0);
        let calculatedInitials = "US"; // Varsayılan
        
        if (nameParts.length >= 2) {
          calculatedInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
          calculatedInitials = nameParts[0].substring(0, 2).toUpperCase();
        }

        setUser({ name: fullName, initials: calculatedInitials });
      }
    };

    fetchCurrentUser();
  }, []);

// --- OTOMATİK ANALİZ (AKILLI DEBOUNCE) ---
  useEffect(() => {
    const currentText = content[activeSection];

    if (!activeSection || activeSection === "toc" || !currentText) {
      setAnalysisResults([]);
      setActiveHighlightId(null);
      return;
    }

    // Ekranda değişiklik yoksa API'ye boşuna gitme!
    if (currentText === lastAnalyzedText.current) {
      return; 
    }

    // Bekleme süresini 6 saniyeden 10 saniyeye çıkardık.
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch("http://localhost:8088/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ req_id: activeSection, text: currentText })
        });
        const data = await response.json();
        
        const rawResults = Array.isArray(data) ? data : (data.result || []);

        if (Array.isArray(rawResults)) {
          const resultsWithIds = rawResults.map((res, index) => ({
            ...res,
            req_id: res.req_id || activeSection,
            id: res.req_id || `${activeSection}-${index}`
          }));
          setAnalysisResults(resultsWithIds);
          
          // BAŞARILI: Bu metni hafızaya al ki aynı metin için bir daha istek atmasın
          lastAnalyzedText.current = currentText; 
        } else {
          setAnalysisResults([]);
        }
        
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 10000); // 10 Saniye bekle

    return () => clearTimeout(timer);
  }, [content[activeSection], activeSection]);

  // --- FONKSİYONLAR ---
  const handleTemplateSelect = (tempKey) => {
    setSelectedTemplate(tempKey);
    setIsTemplateLocked(true);
    setActiveSection("toc"); // İlk açılışta İçindekiler'i göster
  };

  const handleGoBackToSelection = () => {
      // 1. URL'deki ID parametresini temizle ki refresh atınca tekrar yüklenmesin
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('id');
      window.history.pushState({}, '', newUrl.href);

      // 2. State'leri sıfırla ve seçim ekranına dön
      setIsTemplateLocked(false);
      setSelectedTemplate(null);
      setContent({});
      setProgress(0);
      setActiveSection("");
    };

  const handleGoToDashboard = () => {
    // 1. İçerideki tüm state'leri güvenli bir şekilde sıfırla
    setIsTemplateLocked(false);
    setSelectedTemplate(null);
    setContent({});
    setProgress(0);
    setActiveSection("");

    // 2. Sadece React Router kullanarak yönlendirme yap
    navigate('/dashboard'); 
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

  // AuthoringPage.jsx içinde onDrop fonksiyonunu bununla değiştir:
  const onDrop = (e) => {
      e.preventDefault();
      setIsDraggingOver(false);
      
      // Karttan gelen metni alıyoruz
      const droppedText = e.dataTransfer.getData("text/plain");
      
      if (droppedText) {
          // Bu satır, metni doğrudan chat input kutusuna yazar
          setChatInput(droppedText);
      }
  };

  const handleSaveDraft = async () => {
    if (!isTemplateLocked || !selectedTemplate) return;

    try {
      setIsAnalyzing(true); // Lazer animasyonunu başlat
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return alert("Lütfen giriş yapın.");

      const params = new URLSearchParams(window.location.search);
      const existingId = params.get("id");

      const draftPayload = {
        user_id: authUser.id,
        title: templates[selectedTemplate]?.title || "Untitled SRS",
        template_key: selectedTemplate,
        content: content, 
        revision_history: revisionHistory, // Buradaki alt tireli isim SQL ile aynı olmalı
        progress: progress,
        status: "draft",
        updated_at: new Date().toISOString()
      };
      // Eğer döküman zaten varsa ID'yi ekle ki yenisini yaratmasın, güncellesin
      if (existingId) draftPayload.id = existingId;

      // .select() ekleyerek kaydedilen veriyi geri döndürüyoruz
      const { data: savedData, error } = await supabase.from('documents').upsert(draftPayload).select();

      if (error) throw error;
      alert("Taslak başarıyla kaydedildi.");
      if (!existingId && savedData && savedData[0]) {
        const newId = savedData[0].id;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', newId);
        window.history.pushState({ path: newUrl.href }, '', newUrl.href);
      }
    } catch (error) {
      console.error("Draft save error:", error);
      alert("Kaydedilemedi.");
    } finally {
      setIsAnalyzing(false); // Lazer animasyonunu bitir
    }
  };

  return (
    <div className="auth-master-container">
      {/* 1. ÜST NAVBAR */}
      <header className="auth-modern-nav">
              <div className="nav-group-left">
                {/* Akıllı Geri Butonu */}
                <button 
                  className="nav-back-pill" 
                  onClick={() => isTemplateLocked ? handleGoBackToSelection() : handleGoToDashboard()}
                >
                  <span className="back-arrow">‹</span> 
                  {isTemplateLocked ? "Şablon Seçimi" : "Dashboard"}
                </button>
                
                <div className="nav-breadcrumb">
                  <span
                    className={`breadcrumb-clickable ${isTemplateLocked ? 'active' : ''}`}
                    onClick={isTemplateLocked ? handleGoBackToSelection : null}
                  >
                    {uiConfig?.navbar.mode_title || "Authoring Mode"}
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
                {/* Sadece Editör modundaysak Save butonu ve Progress görünür */}
                {isTemplateLocked && (
                  <>
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
                    <button 
                      className={`nav-save-btn ${isAnalyzing ? 'analyzing' : ''}`} 
                      onClick={handleSaveDraft}
                    >
                      {uiConfig?.navbar.save_btn || "Save Draft"}
                      <span className="btn-laser-line"></span> 
                    </button>
                  </>
                )}

                {/* Dinamik Profil: Statik ID yerine artık user.initials geliyor */}
                <div className="nav-profile-section" onClick={() => navigate('/profile')}>
                  <span className="nav-user-fullname">{user.name || "User"}</span>
                  <div className="nav-avatar">{user.initials || "ID"}</div>
                </div>
              </div>
            </header>

      {/* 2. ANA İÇERİK ALANI */}
      {!isTemplateLocked ? (
              /* YENİ ŞABLON SEÇİM EKRANI YAPISI */
              <div className="template-selection-view">
                <div className="selection-layout">
                  
                  {/* Sol: Rehber/Sidebar Alanı */}
                  <aside className="selection-guide-aside">
                    <div className="guide-content-wrapper">
                      <div className="mode-tag">AI AUTHORING</div>
                      <h1 className="hero-title">
                        {uiConfig?.navbar.selection_title || "Start New Document"}
                      </h1>
                      <p className="hero-subtitle">
                        {uiConfig?.navbar.selection_subtitle || "Choose a standard template to start authoring your SRS document."}
                      </p>
                      
                      <div className="guide-features">
                        <div className="feat-item"><span>✦</span> IEEE 830 / ISO 29148 Support</div>
                        <div className="feat-item"><span>✦</span> Real-time AI Analysis</div>
                        <div className="feat-item"><span>✦</span> Automated Draft Saving</div>
                      </div>
                    </div>
                  </aside>

                  {/* Sağ: Şablon Kartları */}
                  <section className="selection-templates-grid">
                    <div className="grid-header">
                      <p className="template-grid-label">Available Standards</p>
                      <div className="header-line-faded"></div>
                    </div>
                    
                    <div className="template-list-container">
                      {isLoadingTemplates ? (
                        <div className="loading-state-ui">Loading AI Frameworks...</div>
                      ) : (
                        Object.keys(templates).map((key, idx) => {
                          const icons = ['🌐', '🏢', '📋', '🔬'];
                          return (
                            <div key={key} className="template-card-modern" onClick={() => handleTemplateSelect(key)}>
                              <div className="card-icon-wrap">{icons[idx % icons.length]}</div>
                              <div className="card-info">
                                <h3>{templates[key].title}</h3>
                                <p>{templates[key].description}</p>
                              </div>
                              <div className="card-action-arrow"></div>
                              {/* Soldan sağa tarama (shimmer) efekti için boş div */}
                              <div className="card-scan-shimmer"></div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
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
            activeHighlightId={activeHighlightId}
            setActiveHighlightId={setActiveHighlightId}
          />
        </div>
      )}
    </div>
  );
};

export default AuthoringPage;