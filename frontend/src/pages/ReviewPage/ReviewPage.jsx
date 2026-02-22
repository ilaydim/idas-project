import React, { useState, useEffect } from "react";
import "./ReviewPage.css";
import DocumentUpload from "./components/DocumentUpload";

const API_BASE = "http://127.0.0.1:8088";

const ReviewPage = () => {
  const [uiConfig, setUiConfig] = useState(null);
  const [status, setStatus] = useState("IDLE"); // IDLE, UPLOADING, REVIEWING
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/ui-config`)
      .then(res => res.json())
      .then(data => setUiConfig(data))
      .catch(err => console.error("UI Config load error:", err));
  }, []);

  const handleFileUpload = async (file) => {
    setStatus("UPLOADING");
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

  const handleApplySuggestion = (reqId) => {
    setAnalysisData(prev => ({
      ...prev,
      requirements: prev.requirements.map(req => {
        if (req.id === reqId) {
          return { ...req, text: req.suggestion, status: "success", issue: null, suggestion: null };
        }
        return req;
      })
    }));
  };

  if (status === "IDLE") {
    return (
      <div className="review-page idle">
        <header className="review-header">
          <div className="review-header-left">
            <button className="back-btn" onClick={() => window.history.back()}>← Dashboard</button>
            <h1>{uiConfig?.review.title || "Document Review"}</h1>
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
        <div className="spinner-box">
          <div className="spinner"></div>
          <p>{uiConfig?.review.analyzing || "Analyzing your document..."}</p>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="review-page error-state">
        <header className="review-header">
          <div className="review-header-left">
            <button className="back-btn" onClick={() => setStatus("IDLE")}>← Try Again</button>
            <h1>Analysis Error</h1>
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
      </div>
    );
  }

  const selectedReq = analysisData?.requirements?.find(r => r.id === selectedReqId);
  const stats = analysisData?.stats || { total: 0, fr: 0, nfr: 0, issues: 0 };

  return (
    <div className="review-page results">
      <header className="results-header">
        <div className="review-header-left">
          <button className="back-btn" onClick={() => setStatus("IDLE")}>← New Upload</button>
          <h1>{uiConfig?.review.title || "Analysis Results"}</h1>
        </div>
        <div className="header-actions">
          <button className="export-btn">{uiConfig?.review.download_btn || "Export Report"}</button>
          <button className="save-btn">{uiConfig?.review.save_btn || "Save"}</button>
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
            </div>
          </div>
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
                <span className={`type-badge ${req.type.toLowerCase()}`}>{req.type}</span>
              </div>
              <p className="req-text">{req.text}</p>
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
                >
                  {uiConfig?.review.apply_btn || "Apply Correction"}
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