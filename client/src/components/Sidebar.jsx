import { useState } from 'react';

function Sidebar({
  connections,
  onConnect,
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  collapsed,
  onToggleCollapse
}) {
  const [activeSection, setActiveSection] = useState('connections');
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, connection) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      connection
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-dark-900 border-r border-dark-700 flex flex-col items-center py-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <span className="text-xs font-semibold uppercase text-dark-400">Explorer</span>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* SSH Connections */}
          <div className="py-2">
            <div
              className="px-4 py-1 text-xs font-semibold uppercase text-dark-400 cursor-pointer hover:bg-dark-800"
              onClick={() => setActiveSection('connections')}
            >
              SSH Connections ({connections.length})
            </div>
            {activeSection === 'connections' && (
              <>
                {connections.map((conn) => (
                  <div
                    key={conn._id}
                    className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-dark-800 transition-colors"
                    onClick={() => onConnect(conn)}
                    onContextMenu={(e) => handleContextMenu(e, conn)}
                  >
                    <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm truncate">{conn.name || conn.host}</span>
                  </div>
                ))}
                <div
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer text-dark-400 hover:bg-dark-800 transition-colors"
                  onClick={onAddConnection}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm">Add Connection</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Commands */}
          <div className="py-2 border-t border-dark-700">
            <div
              className="px-4 py-1 text-xs font-semibold uppercase text-dark-400 cursor-pointer hover:bg-dark-800"
              onClick={() => setActiveSection('commands')}
            >
              Quick Commands
            </div>
            {activeSection === 'commands' && (
              <div className="py-1">
                <div className="px-4 py-2 text-sm cursor-pointer hover:bg-dark-800 transition-colors">
                  System Info
                </div>
                <div className="px-4 py-2 text-sm cursor-pointer hover:bg-dark-800 transition-colors">
                  Disk Usage
                </div>
                <div className="px-4 py-2 text-sm cursor-pointer hover:bg-dark-800 transition-colors">
                  Process List
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed bg-dark-800 border border-dark-600 rounded-lg py-1 min-w-40 z-50 shadow-xl"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors"
              onClick={() => {
                onConnect(contextMenu.connection);
                handleCloseContextMenu();
              }}
            >
              Connect
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors"
              onClick={() => {
                onEditConnection(contextMenu.connection);
                handleCloseContextMenu();
              }}
            >
              Edit
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-dark-700 transition-colors"
              onClick={() => {
                onDeleteConnection(contextMenu.connection._id);
                handleCloseContextMenu();
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default Sidebar;
