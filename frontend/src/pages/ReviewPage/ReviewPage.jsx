import React, { useState } from 'react';
import './ReviewPage.css';

const ReviewPage = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.name.endsWith('.docx')) { // .docx sınırı
      setFile(uploadedFile);
      startAnalysis();
    } else {
      alert("Lütfen sadece .docx formatında bir dosya yükleyin.");
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    // Gerçek uygulamada Python Backend/Agent burayı tetikleyecek
    setTimeout(() => {
      setIsAnalyzing(false);
      setReport({
        totalRequirements: 12,
        frCount: 8,
        nfrCount: 4,
        issues: [
          { id: 1, type: 'Belirsizlik', text: 'Sistem hızlı olmalıdır.', suggestion: 'Hızın 2 saniye altında olması gerektiğini belirtin.' },
          { id: 2, type: 'Test Edilemez', text: 'Arayüz çok güzel olmalı.', suggestion: 'Tasarım standartlarına atıfta bulunun.' }
        ]
      });
    }, 3000); // 3 saniyelik simülasyon
  };

  return (
    <div className="reviewWrapper">
      <h1 className="reviewTitle">İnceleme Modu</h1>
      
      {!report ? (
        <div className="uploadContainer">
          <div className={`dropZone ${isAnalyzing ? 'analyzing' : ''}`}>
            {isAnalyzing ? (
              <div className="loader">
                <div className="spinner"></div>
                <p>Gereksinimler Analiz Ediliyor...</p>
              </div>
            ) : (
              <>
                <div className="uploadIcon">📄</div>
                <p className="uploadText">SRS dökümanınızı sürükleyin veya seçin</p>
                <span className="uploadHint">Sadece .docx formatı desteklenir</span>
                <input type="file" onChange={handleFileUpload} className="fileInput" accept=".docx" />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="reportContainer">
          {/* Görsel Rapor Paneli */}
          <div className="reportSummary">
            <div className="statCard">
              <span>Toplam Gereksinim</span>
              <strong>{report.totalRequirements}</strong>
            </div>
            <div className="statCard fr">
              <span>Fonksiyonel (FR)</span>
              <strong>{report.frCount}</strong>
            </div>
            <div className="statCard nfr">
              <span>Fonksiyonel Olmayan (NFR)</span>
              <strong>{report.nfrCount}</strong>
            </div>
          </div>

          <div className="issuesList">
            <h3 className="listTitle">Tespit Edilen Kalite Kusurları</h3>
            {report.issues.map(issue => (
              <div key={issue.id} className="issueItem">
                <div className="issueBadge">{issue.type}</div>
                <div className="issueContent">
                  <p className="originalText">"{issue.text}"</p>
                  <p className="suggestionText">💡 Öneri: {issue.suggestion}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setReport(null)} className="reUploadBtn">Yeni Dosya Yükle</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;