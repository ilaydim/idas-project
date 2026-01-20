import React, { useState } from 'react';
import { SRS_TEMPLATES } from '../../utils/templates';

const AuthoringPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('HAVELSAN'); // [cite: 23, 318]
  const [activeSection, setActiveSection] = useState(SRS_TEMPLATES.HAVELSAN.sections[0].id);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navbar: Mod Değiştirici ve Kaydetme */}
      <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-blue-600">IDAS Authoring</span>
          <select 
            className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="HAVELSAN text-xs">HAVELSAN Template [cite: 38]</option>
            <option value="IEEE">IEEE 830 Standard</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button className="text-sm font-medium text-slate-500 hover:text-slate-800">Taslak Olarak Kaydet</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
            Dışa Aktar (.docx) [cite: 95]
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL: Bölüm Navigasyonu */}
        <aside className="w-64 border-right border-slate-100 bg-slate-50/50 overflow-y-auto p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bölümler [cite: 184]</p>
          <nav className="space-y-1">
            {SRS_TEMPLATES[selectedTemplate].sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                  activeSection === section.id 
                  ? 'bg-white shadow-sm text-blue-600 font-bold border border-slate-100' 
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* ORTA: Metin Editörü */}
        <main className="flex-1 bg-white overflow-y-auto flex justify-center p-8">
          <div className="w-full max-w-3xl">
            <textarea
              className="w-full h-full min-h-[500px] text-lg text-slate-800 placeholder-slate-300 border-none focus:ring-0 leading-relaxed resize-none"
              placeholder="Gereksinimlerinizi buraya yazmaya başlayın..."
            />
          </div>
        </main>

        {/* SAĞ: AI Destek Paneli */}
        <aside className="w-80 border-l border-slate-100 bg-white p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-slate-800 text-sm italic">AI Asistanı Önerileri [cite: 90, 196]</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 group">
              <p className="text-xs font-bold text-purple-700 mb-2">✨ Taslak Gereksinim Önerisi [cite: 186]</p>
              <p className="text-sm text-slate-700 italic">"Sistem, kimlik doğrulaması yapılmış kullanıcıların profil bilgilerini 2 saniye içinde güncelleyebilmelidir."</p>
              <button className="mt-3 text-[10px] font-bold text-purple-600 hover:underline uppercase tracking-wider">Metne Ekle</button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-2">⚠️ Terminoloji Uyarısı [cite: 185]</p>
              <p className="text-sm text-slate-700 italic">'Veritabanı' yerine HAVELSAN standardı olan 'VTBS' terimini kullanmayı düşünün[cite: 242].</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuthoringPage;