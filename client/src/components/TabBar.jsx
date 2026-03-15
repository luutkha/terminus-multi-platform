import { useState } from 'react';

function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onNewTab, onTabRename }) {
  const [editingTabId, setEditingTabId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleDoubleClick = (e, tab) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditValue(tab.title);
  };

  const handleRenameSubmit = (tabId) => {
    if (editValue.trim()) {
      onTabRename(tabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  return (
    <div className="flex bg-[#0a0a0f]/80 border-b border-white/5 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer border-r border-white/5 transition-all min-w-0 relative ${
            tab.id === activeTabId
              ? 'tab-active text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
          } ${tab.connecting ? 'opacity-70' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          {/* Active indicator */}
          {tab.id === activeTabId && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink" />
          )}

          {tab.connecting ? (
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-neon-purple/30" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-purple animate-spin" />
            </div>
          ) : tab.type === 'ssh' ? (
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          ) : tab.type === 'dashboard' ? (
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {editingTabId === tab.id ? (
            <input
              type="text"
              className="bg-white/10 border border-neon-purple/50 rounded px-1 py-0.5 text-white text-sm w-28 outline-none"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRenameSubmit(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="truncate max-w-36"
              onDoubleClick={(e) => handleDoubleClick(e, tab)}
              title="Double-click to rename"
            >
              {tab.title}
            </span>
          )}

          {tab.connecting && (
            <span className="text-xs text-neon-purple animate-pulse">Connecting...</span>
          )}

          {/* Close button */}
          <button
            className="ml-1 p-1 rounded transition-all opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* New Tab Button */}
      <button
        className="flex items-center justify-center px-3 py-2.5 text-gray-500 hover:text-white hover:bg-white/[0.02] transition-all group border-l border-white/5"
        onClick={onNewTab}
        title="New Terminal"
      >
        <div className="w-5 h-5 rounded-md flex items-center justify-center border border-dashed border-white/10 group-hover:border-neon-purple/50 group-hover:bg-neon-purple/10 transition-all">
          <svg className="w-3 h-3 group-hover:text-neon-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>
    </div>
  );
}

export default TabBar;
