import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Örnek döküman verisi - Gerçek uygulamada API'den gelecek [cite: 594]
  const documents = [
    { id: 1, title: 'SRS_Project_Alpha', type: 'HAVELSAN', date: '20.01.2026' },
    { id: 2, title: 'IEEE_Standard_Doc', type: 'IEEE', date: '18.01.2026' },
    { id: 3, title: 'System_Requirements_v2', type: 'HAVELSAN', date: '15.01.2026' },
    { id: 4, title: 'Module_X_Specification', type: 'IEEE', date: '12.01.2026' },
  ];

  return (
    <div className="dashboardWrapper">
      <header className="dashboardHeader">
        <h1 className="dashboardTitle">Dashboard</h1>
      </header>
      
      {/* Mod Seçim Alanı */}
      <div className="pillButtonContainer">
        <button className="pillBtn authoring" onClick={() => navigate('/authoring')}>
          Yazım Modu (Authoring Mode) 
        </button>
        <button className="pillBtn review" onClick={() => navigate('/review')}>
          Düzenleme Modu (Review Mode) 
        </button>
      </div>

      {/* Son Dokümanlar Bölümü  */}
      <div className="contentSection">
        <h2 className="sectionTitle">Son Dokümanlar</h2>
        <div className="docGridContainer">
          <div className="docGrid">
            {documents.map((doc) => (
              <div key={doc.id} className="docCard group">
                <div className="docPreview">
                  <div className="docHeaderLine"></div>
                  <div className="docContentLines">
                    <div className="line long"></div>
                    <div className="line medium"></div>
                    <div className="line short"></div>
                  </div>
                  <div className="docTypeTag">{doc.type}</div>
                </div>
                <div className="docInfo">
                  <p className="docTitleText">{doc.title}</p>
                  <p className="docDateText">{doc.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;