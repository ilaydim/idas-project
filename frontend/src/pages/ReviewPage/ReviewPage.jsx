import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import "./ReviewPage.css";
import DocumentUpload from "./components/DocumentUpload";
import idasLogo from "../../assets/images/icon.png";

// Export Libraries
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  Header,
  Footer,
  PageNumber
} from "docx";

const API_BASE = "http://127.0.0.1:8001";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [uiConfig, setUiConfig] = useState(null);
  const [user, setUser] = useState({ name: "", initials: "" });
  const [authUser, setAuthUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (authUser && !error) {
        const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0];
        const nameParts = fullName ? fullName.split(' ') : [];
        let calculatedInitials = "US";
        if (nameParts.length >= 2) {
          calculatedInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
          calculatedInitials = nameParts[0].substring(0, 2).toUpperCase();
        }

        const avatarUrl = authUser.user_metadata?.avatar_url || null;

        setAuthUser(authUser);
        setUser({ name: fullName, initials: calculatedInitials, avatarUrl });
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const loadSavedReview = async () => {
      const params = new URLSearchParams(window.location.search);
      const docId = params.get("id");
      if (!docId) return;

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', docId)
          .single();

        if (error) throw error;
        if (data) {
          const parsedData = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          setAnalysisData(parsedData);
          setFileName(data.title.replace("Review: ", ""));
          setStatus("REVIEWING");
        }
      } catch (err) {
        console.error("Error loading review:", err.message);
      }
    };
    loadSavedReview();
  }, []);

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
  const [status, setStatus] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") ? "REVIEWING" : "IDLE";
  }); // IDLE, UPLOADING, REVIEWING
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [isRewriting, setIsRewriting] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/ui-config`)
      .then(res => res.json())
      .then(data => setUiConfig(data))
      .catch(err => console.error("UI Config load error:", err));
  }, []);

  const handleFileUpload = async (file) => {
    setStatus("UPLOADING");
    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/upload-review`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setAnalysisData(data);
        setStatus("ERROR");
      } else {
        setAnalysisData(data);
        setStatus("REVIEWING");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("ERROR");
      setAnalysisData({ error: "Connection error. Please check if backend is running." });
    }
  };

  const handleApplySuggestion = async (reqId) => {
    const req = analysisData?.requirements?.find(r => r.id === reqId);
    if (!req) return;

    setIsRewriting(reqId);
    try {
      const response = await fetch(`${API_BASE}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: req.text,
          issue: req.issue || "",
          suggestion: req.suggestion || ""
        })
      });
      const data = await response.json();
      const rewrittenText = data.result || req.suggestion;

      // HATA KONTROLÜ (Gemini Quota Error 429 vs)
      if (rewrittenText && rewrittenText.includes("Error rewriting requirement:")) {
        alert("The AI service is currently unavailable or has reached its quota limit. Please try again later.\n\n" + rewrittenText);
        return; // İşlemi iptal et, metni bozma
      }

      setAnalysisData(prev => ({
        ...prev,
        requirements: prev.requirements.map(r => {
          if (r.id === reqId) {
            return {
              ...r,
              originalText: r.text, // Eski metni saklıyoruz
              text: rewrittenText,
              status: "success",
              issue: null,
              suggestion: null,
              fixedByAI: true
            };
          }
          return r;
        })
      }));
    } catch (e) {
      console.error("Error during rewrite:", e);
      alert("A network error occurred while trying to contact the AI service.");
    } finally {
      setIsRewriting(null);
    }
  };

  const getSortedRequirements = () => {
    if (!analysisData || !analysisData.requirements) return [];
    return [...analysisData.requirements].sort((a, b) => {
      // AI Fixed olanlar en başa
      if (a.fixedByAI && !b.fixedByAI) return -1;
      if (!a.fixedByAI && b.fixedByAI) return 1;
      return 0;
    });
  };

  const generatePDF = (sortedReqs) => {
    const doc = new jsPDF();
    const title = fileName.split('.')[0] || "SRS_Analysis_Report";

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("IDAS: AI Analysis Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document: ${fileName || "Unnamed"}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 35);

    // Stats Summary
    const stats = {
      total: sortedReqs.length,
      issues: sortedReqs.filter(r => r.issue && r.status !== 'success').length,
      fixed: sortedReqs.filter(r => r.fixedByAI).length
    };

    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Requirements', stats.total],
        ['Identified Issues', stats.issues],
        ['AI Fixed / Optimized', stats.fixed]
      ],
      theme: 'striped',
      headStyles: { fillGray: true }
    });

    // Content Table
    const tableData = sortedReqs.map((req, index) => {
      let content = req.text;
      if (req.fixedByAI && req.originalText) {
        content = `${req.text}\n\n(Original: ${req.originalText})`;
      }

      let status = "-";
      if (req.fixedByAI) status = "AI FIXED";
      else if (req.issue && req.status !== 'success') status = "ISSUE";
      else status = "OK";

      return [
        req.id || `REQ-${index + 1}`,
        req.type || "FR",
        content,
        status
      ];
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['ID', 'Type', 'Requirement / Analysis', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 255] },
      columnStyles: {
        2: { cellWidth: 100 }, // Requirement column width
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'AI FIXED') data.cell.styles.textColor = [0, 128, 0];
          if (data.cell.raw === 'ISSUE') data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    doc.save(`${title}_Analysis.pdf`);
  };

  const generateDOCX = async (sortedReqs) => {
    const title = fileName.split('.')[0] || "SRS_Analysis_Report";

    const rows = sortedReqs.map(req => {
      let contentItems = [
        new Paragraph({
          children: [new TextRun({ text: req.text, bold: req.fixedByAI })],
          spacing: { after: 120 }
        })
      ];

      if (req.fixedByAI && req.originalText) {
        contentItems.push(new Paragraph({
          children: [
            new TextRun({ text: "Original Text:", bold: true, size: 18, color: "666666" }),
            new TextRun({ text: ` ${req.originalText}`, italic: true, size: 18, color: "666666" })
          ],
          spacing: { after: 120 }
        }));
      }

      if (req.issue && req.status !== 'success') {
        contentItems.push(new Paragraph({
          children: [
            new TextRun({ text: "Identified Issue: ", bold: true, color: "FF0000" }),
            new TextRun({ text: req.issue, color: "FF0000" })
          ],
          spacing: { after: 120 }
        }));
      }

      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(req.id || "-")] }),
          new TableCell({ children: [new Paragraph(req.type || "FR")] }),
          new TableCell({ children: contentItems }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: req.fixedByAI ? "AI FIXED" : (req.issue ? "ISSUE" : "OK"),
                    color: req.fixedByAI ? "008000" : (req.issue ? "FF0000" : "000000"),
                    bold: true
                  })
                ]
              })
            ]
          }),
        ]
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "IDAS: AI Analysis Report", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Document: ${fileName || "Unnamed"}`, spacing: { before: 200 } }),
          new Paragraph({ text: `Date: ${new Date().toLocaleString()}`, spacing: { after: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "ID", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Requirement / Analysis", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Status", bold: true })] }),
                ]
              }),
              ...rows
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_Analysis.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateMD = (sortedReqs) => {
    let markdown = `# AI Analysis Report: ${fileName || "SRS Document"}\n\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
    markdown += `--- \n\n`;

    sortedReqs.forEach((req, index) => {
      const statusIcon = req.fixedByAI ? "✅" : (req.issue ? "⚠️" : "ℹ️");
      markdown += `### ${index + 1}. ${statusIcon} [${req.id}] ${req.type}\n`;

      markdown += `**Current Text:** ${req.text}\n\n`;

      if (req.fixedByAI && req.originalText) {
        markdown += `> **Original Text (Uploaded SRS):** \n`;
        markdown += `> _${req.originalText}_\n\n`;
      }

      if (req.issue && req.status !== 'success') {
        markdown += `> [!WARNING]\n`;
        markdown += `> **Issue:** ${req.issue}\n`;
        if (req.suggestion) {
          markdown += `> **AI Suggestion:** ${req.suggestion}\n`;
        }
        markdown += `\n`;
      }
      markdown += `--- \n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Analysis_Report_${fileName.split('.')[0] || "document"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format) => {
    const sortedReqs = getSortedRequirements();
    if (sortedReqs.length === 0) return;

    if (format === 'pdf') generatePDF(sortedReqs);
    else if (format === 'docx') generateDOCX(sortedReqs);
    else generateMD(sortedReqs);

    setShowExportMenu(false);
  };

  const handleSaveDocument = async () => {
    if (!analysisData || !authUser) return;
    setIsSaving(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const existingId = params.get("id");

      const title = `Review: ${fileName || "Untitled Analysis"}`;
      const draftPayload = {
        user_id: authUser.id,
        title: title,
        content: analysisData,
        template_key: 'review',
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      if (existingId) draftPayload.id = existingId;

      const { data: savedData, error } = await supabase
        .from('documents')
        .upsert(draftPayload)
        .select();

      if (error) throw error;

      if (!existingId && savedData && savedData[0]) {
        navigate(`/review?id=${savedData[0].id}`, { replace: true });
      }

      alert("Document saved successfully to your dashboard!");
    } catch (err) {
      console.error("Save error:", err.message);
      alert("Error saving document: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "IDLE") {
    return (
      <div className="review-page idle">
        <header className="review-custom-header">
          <div className="header-left-group">
            <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
            </div>
            <button className="nav-back-pill" onClick={() => window.history.back()}>
              <span className="back-arrow">‹</span> Dashboard
            </button>
            <h1 className="review-title-text">Design the Content, Define the Standard!</h1>
          </div>
          <div className="header-right-group">
            <div className="review-profile-row">
              <span className="review-user-name">{user.name || "User"}</span>
              <div className="review-avatar-rounded" onClick={() => navigate('/profile')}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" />
                ) : (
                  <span>{user.initials || "US"}</span>
                )}
              </div>
              <button className="review-logout-btn" onClick={handleLogout} title="Log Out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </header>
        <div className="upload-container">
          <DocumentUpload onUpload={handleFileUpload} uiConfig={uiConfig} />
        </div>
      </div>
    );
  }

  if (status === "UPLOADING") {
    return (
      <div className="review-page loading">
        <header className="review-custom-header">
          <div className="header-left-group">
            <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
            </div>
            <button className="nav-back-pill" onClick={() => setStatus("IDLE")}>
              <span className="back-arrow">‹</span> Dashboard
            </button>
            <h1 className="review-title-text">Design the Content, Define the Standard!</h1>
          </div>
          <div className="header-right-group">
            <div className="review-profile-row">
              <span className="review-user-name">{user.name || "User"}</span>
              <div className="review-avatar-rounded" onClick={() => navigate('/profile')}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" />
                ) : (
                  <span>{user.initials}</span>
                )}
              </div>
              <button className="review-logout-btn" onClick={handleLogout} title="Log Out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </header>
        <div className="spinner-frame">
          <div className="spinner-box">
            <div className="spinner"></div>
            <p>{uiConfig?.review.analyzing || "Analyzing your document..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="review-page error-state">
        <header className="review-custom-header">
          <div className="header-left-group">
            <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
            </div>
            <button className="nav-back-pill" onClick={() => setStatus("IDLE")}>
              <span className="back-arrow">‹</span> Try Again
            </button>
            <h1 className="review-title-text">Analysis Error</h1>
          </div>
          <div className="header-right-group">
            <div className="review-profile-row">
              <span className="review-user-name">{user.name || "User"}</span>
              <div className="review-avatar-rounded" onClick={() => navigate('/profile')}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" />
                ) : (
                  <span>{user.initials}</span>
                )}
              </div>
              <button className="review-logout-btn" onClick={handleLogout} title="Log Out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </header>
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Oops! Something went wrong.</h2>
          <p className="error-msg">{analysisData?.error || "Unknown error occurred during analysis."}</p>
          {analysisData?.raw && (
            <pre className="raw-debug">AI Response: {analysisData.raw}</pre>
          )}
          <button className="retry-btn" onClick={() => setStatus("IDLE")}>Go Back & Retry</button>
        </div>
      </div >
    );
  }

  const selectedReq = analysisData?.requirements?.find(r => r.id === selectedReqId);

  // DİNAMİK İSTATİSTİK HESAPLAMASI (Identified Issues azalacak, AI Fixed artacak)
  const stats = {
    total: analysisData?.requirements?.length || 0,
    fr: analysisData?.requirements?.filter(r => r.type === "FR").length || 0,
    nfr: analysisData?.requirements?.filter(r => r.type === "NFR").length || 0,
    issues: analysisData?.requirements?.filter(r => r.issue && r.status !== 'success').length || 0,
    aiFixed: analysisData?.requirements?.filter(r => r.fixedByAI).length || 0
  };

  const fixedReqs = analysisData?.requirements?.filter(r => r.fixedByAI) || [];

  return (
    <div className="review-page results">
      <header className="review-custom-header">
        <div className="header-left-group">
          <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img src={idasLogo} alt="IDAS Logo" className="brand-logo" />
          </div>
          <button className="nav-back-pill" onClick={() => navigate('/dashboard')}>
            <span className="back-arrow">‹</span> Dashboard
          </button>
          {fileName ? (
            <div className="editable-title-area">
              {isEditingTitle ? (
                <input
                  className="title-edit-input"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                  autoFocus
                />
              ) : (
                <h1 className="review-title-text editable" onClick={() => setIsEditingTitle(true)}>
                  {fileName}
                  <span className="edit-pencil">✎</span>
                </h1>
              )}
            </div>
          ) : (
            <h1 className="review-title-text">Design the Content, Define the Standard!</h1>
          )}
        </div>

        <div className="header-right-group">
          <div className="header-floating-actions">
            <div className="export-wrapper" style={{ position: 'relative' }}>
              <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
                {uiConfig?.review.download_btn || "Export Report"} <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
              </button>
              {showExportMenu && (
                <div className="export-dropdown">
                  <div className="export-option" onClick={() => { handleExport("pdf"); setShowExportMenu(false); }}>PDF Document (.pdf)</div>
                  <div className="export-option" onClick={() => { handleExport("docx"); setShowExportMenu(false); }}>Word Document (.docx)</div>
                  <div className="export-option" onClick={() => { handleExport("md"); setShowExportMenu(false); }}>Markdown File (.md)</div>
                </div>
              )}
            </div>

            <button
              className={`save-btn ${isSaving ? 'loading' : ''}`}
              onClick={handleSaveDocument}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : (uiConfig?.review.save_btn || "Save")}
            </button>
          </div>

          <div className="review-profile-row">
            <span className="review-user-name">{user.name || "User"}</span>
            <div className="review-avatar-rounded" onClick={() => navigate('/profile')}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" />
              ) : (
                <span>{user.initials || "US"}</span>
              )}
            </div>
            <button className="review-logout-btn" onClick={handleLogout} title="Log Out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="review-layout">
        <aside className="review-summary">
          <div className="summary-card">
            <h3>{uiConfig?.review.summary_title || "Summary"}</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span>{uiConfig?.review.total_label || "Total"}</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="stat-item warning">
                <span>{uiConfig?.review.issue_label || "Issues"}</span>
                <strong>{stats.issues}</strong>
              </div>
              <div className="stat-item fr">
                <span>FR</span>
                <strong>{stats.fr}</strong>
              </div>
              <div className="stat-item nfr">
                <span>NFR</span>
                <strong>{stats.nfr}</strong>
              </div>
              <div className="stat-item aifixed">
                <span>AI FIXED</span>
                <strong>{stats.aiFixed}</strong>
              </div>
            </div>
          </div>

          {/* YENİ EKLENEN YAPAY ZEKA TARAFINDAN DÜZELTİLENLER KUTUSU */}
          {fixedReqs.length > 0 && (
            <div className="summary-card ai-fixed-box">
              <h3>AI Fixed Requirements</h3>
              <ul className="fixed-list">
                {fixedReqs.map((req, idx) => (
                  <li key={req.id} className="fixed-list-item" onClick={() => setSelectedReqId(req.id)}>
                    <span className="order-num">{idx + 1}.</span>
                    <span className={`type-badge ${req.type.toLowerCase()}`}>{req.type}</span>
                    <span className="req-id">{req.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="results-list">
          {analysisData?.requirements?.map((req) => (
            <div
              key={req.id}
              className={`req-card ${req.status} ${selectedReqId === req.id ? 'active' : ''}`}
              onClick={() => setSelectedReqId(req.id)}
            >
              <div className="req-meta">
                <span className="req-id">{req.id}</span>
                {req.fixedByAI && (
                  <span className="fixed-by-ai-badge">Fixed by AI</span>
                )}
                <span className={`type-badge ${req.type.toLowerCase()}`}>{req.type}</span>
              </div>
              <p className="req-text">{req.text}</p>

              {req.originalText && (
                <div className="original-req-box">
                  <span className="original-label">Previous Version:</span>
                  <p className="original-text">{req.originalText}</p>
                </div>
              )}

              {req.issue && (
                <div className="issue-msg">
                  <strong>⚠️ Issue:</strong> {req.issue}
                </div>
              )}
            </div>
          ))}
        </main>

        <aside className="suggestion-panel">
          <h3>{uiConfig?.review.suggestion_title || "AI Suggestion"}</h3>
          {selectedReq ? (
            <div className="suggestion-box">
              <p className="suggestion-text">
                {selectedReq.suggestion || "This requirement follows best practices."}
              </p>
              {selectedReq.suggestion && (
                <button
                  className="apply-btn"
                  onClick={() => handleApplySuggestion(selectedReq.id)}
                  disabled={isRewriting === selectedReq.id}
                  style={{ opacity: isRewriting === selectedReq.id ? 0.7 : 1, cursor: isRewriting === selectedReq.id ? 'not-allowed' : 'pointer' }}
                >
                  {isRewriting === selectedReq.id ? "Rewriting..." : (uiConfig?.review.apply_btn || "Apply Suggestion")}
                </button>
              )}
            </div>
          ) : (
            <p className="hint-text">Select a requirement to see suggestions.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ReviewPage;