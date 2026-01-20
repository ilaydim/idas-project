import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sol Menü - Sabit */}
      <Sidebar />
      
      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;