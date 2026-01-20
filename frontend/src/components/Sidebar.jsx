import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/' },
    { name: 'Yazım Modu (Authoring)', icon: '✍️', path: '/authoring' },
    { name: 'İnceleme Modu (Review)', icon: '🔍', path: '/review' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-slate-700 text-blue-400">
        IDAS AI
      </div>
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className="w-full flex items-center px-6 py-4 hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500"
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-700 text-sm text-slate-400">
        v2.0 - HAVELSAN & IEEE
      </div>
    </aside>
  );
};

export default Sidebar;