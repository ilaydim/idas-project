import React, { useState, useRef, useEffect } from "react";
import { SRS_TEMPLATES } from "../../utils/templates";

const DownloadMenu = ({ selectedTemplate, content, revisionHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Menü dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (format) => {
    setIsOpen(false);
    const templateData = SRS_TEMPLATES[selectedTemplate];
    const docTitle = templateData.title;

    // --- İÇERİK BİRLEŞTİRME (Sıralı ve Temiz) ---
    let htmlContent = `
      <h1>${docTitle}</h1>
      <h3>Revision History</h3>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr><th>Version</th><th>Date</th><th>Author</th><th>Reason</th></tr>
        </thead>
        <tbody>
          ${revisionHistory.map(r => `
            <tr>
              <td>${r.version || "-"}</td>
              <td>${r.date || "-"}</td>
              <td>${r.name || "-"}</td>
              <td>${r.reason || "-"}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    templateData.sections.forEach(sec => {
      const text = content[sec.id] || "Bu bölüm henüz doldurulmamıştır.";
      htmlContent += `<h2>${sec.title}</h2><p style="white-space: pre-wrap;">${text}</p>`;
    });

    if (format === 'PDF') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>${docTitle}</title><style>body{font-family:sans-serif; padding:40px; line-height:1.6;}</style></head>
          <body>${htmlContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      // Word Dosyası Oluşturma (.doc)
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + htmlContent + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docTitle.replace(/\s+/g, '_')}.doc`;
      link.click();
    }
  };

  return (
    <div className="download-dropdown" ref={menuRef}>
      <button className="download-icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <span>📥</span> İndir
      </button>
      {isOpen && (
        <div className="download-menu-list">
          <div className="menu-item" onClick={() => handleExport('PDF')}>📄 PDF Olarak Kaydet</div>
          <div className="menu-item" onClick={() => handleExport('Word')}>📝 Word (.doc) İndir</div>
        </div>
      )}
    </div>
  );
};

export default DownloadMenu;