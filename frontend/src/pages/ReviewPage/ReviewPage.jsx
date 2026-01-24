import React, { useState } from "react";
import "./ReviewPage.css";

const ReviewPage = () => {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Simüle edilmiş analiz verileri
  const analysisData = {
    stats: { total: 15, fr: 10, nfr: 5, issues: 4 },
    requirements: [
      {
        id: "REQ-001",
        type: "FR",
        text: "Sistem, kullanıcı giriş yaptıktan sonra verileri hızlıca getirmelidir.",
        status: "warning",
        issue: "Belirsizlik: 'Hızlıca' ifadesi ölçülebilir bir değer değildir.",
        suggestion: "2 saniye altında olacak şekilde güncelleyin."
      },
      {
        id: "REQ-002",
        type: "NFR",
        text: "Veritabanı bağlantısı TLS 1.3 protokolü ile şifrelenmelidir.",
        status: "success",
        issue: null
      },
      {
        id: "REQ-003",
        type: "FR",
        text: "Arayüz tasarımı kullanıcıyı mutlu edecek düzeyde olmalıdır.",
        status: "error",
        issue: "Test Edilemez: Duygusal ifadeler test kriteri olamaz.",
        suggestion: "Tasarım rehberindeki (UI Guide v2) standartlara atıfta bulunun."
      }
    ]
  };

  return (
    <div className="reviewContainer">
      {/* Üst Bar */}
      <header className="reviewHeader">
        <button className="backBtn" onClick={() => window.history.back()}>← Geri</button>
        <h2 className="headerTitle">İnceleme Raporu</h2>
        <div className="headerActions">
          <button className="actionBtn secondary">Raporu İndir (.pdf)</button>
          <button className="actionBtn primary">Dökümanı Kaydet</button>
        </div>
      </header>

      <div className="reviewLayout">
        {/* SOL: Analiz Özet Paneli */}
        <aside className="reviewSummary">
          <div className="summaryCard">
            <h3>Analiz Özeti</h3>
            <div className="statGrid">
              <div className="statItem"><span>Toplam</span><strong>{analysisData.stats.total}</strong></div>
              <div className="statItem fr"><span>FR</span><strong>{analysisData.stats.total}</strong></div>
              <div className="statItem nfr"><span>NFR</span><strong>{analysisData.stats.nfr}</strong></div>
              <div className="statItem error"><span>Kusur</span><strong>{analysisData.stats.issues}</strong></div>
            </div>
          </div>

          <div className="filterBox">
            <h4>Filtrele</h4>
            <div className="filterOption"><input type="checkbox" defaultChecked /> Sadece Kusurluları Göster</div>
            <div className="filterOption"><input type="checkbox" defaultChecked /> FR / NFR Ayrımı Yap</div>
          </div>
        </aside>

        {/* ORTA: Gereksinim Listesi */}
        <main className="resultsArea">
          {analysisData.requirements.map((req) => (
            <div 
              key={req.id} 
              className={`reqCard ${req.status} ${selectedIssue === req.id ? 'selected' : ''}`}
              onClick={() => setSelectedIssue(req.id)}
            >
              <div className="reqMeta">
                <span className="reqId">{req.id}</span>
                <span className={`reqBadge ${req.type.toLowerCase()}`}>{req.type}</span>
              </div>
              <p className="reqText">{req.text}</p>
              {req.issue && (
                <div className="issueAlert">
                  <strong>⚠️ Tespit Edilen Kusur:</strong> {req.issue}
                </div>
              )}
            </div>
          ))}
        </main>

        {/* SAĞ: Öneri Paneli */}
        <aside className="suggestionPanel">
          <h3>İyileştirme Önerisi</h3>
          {selectedIssue ? (
            <div className="suggestionContent">
              <p className="suggestionIntro">Seçili gereksinim için AI önerisi:</p>
              <div className="suggestionBox">
                {analysisData.requirements.find(r => r.id === selectedIssue)?.suggestion || "Bu gereksinim standartlara uygundur."}
              </div>
              <button className="applySuggestionBtn">Öneriyi Uygula</button>
            </div>
          ) : (
            <p className="noSelection">Detayları görmek için bir gereksinim seçin.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ReviewPage;