function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) {
  return (
    <div className="flex bg-dark-900 border-b border-dark-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-dark-700 transition-colors min-w-0 ${
            tab.id === activeTabId
              ? 'bg-dark-950 text-dark-100 border-b-2 border-b-blue-600'
              : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
          }`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="text-xs">{tab.type === 'ssh' ? '🔒' : '🖥'}</span>
          <span className="truncate max-w-32">{tab.title}</span>
          <button
            className="ml-1 p-0.5 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        className="flex items-center justify-center px-3 py-2 text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
        onClick={onNewTab}
        title="New Terminal"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default TabBar;
