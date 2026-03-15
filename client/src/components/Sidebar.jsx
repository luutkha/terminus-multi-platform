import { useState } from 'react';

function Sidebar({
  connections,
  commands,
  onConnect,
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  onAddCommand,
  onEditCommand,
  onDeleteCommand,
  onExecuteCommand,
  collapsed,
  onToggleCollapse,
  connectingId
}) {
  const [activeSection, setActiveSection] = useState('connections');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuType, setContextMenuType] = useState(null);

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
    setContextMenuType(type);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuType(null);
  };

  // Group commands by category
  const groupedCommands = commands.reduce((acc, cmd) => {
    const category = cmd.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {});

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
                    className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-dark-800 transition-colors group ${
                      connectingId === conn._id ? 'opacity-50' : ''
                    }`}
                    onClick={() => onConnect(conn)}
                    onContextMenu={(e) => handleContextMenu(e, conn, 'connection')}
                  >
                    {connectingId === conn._id ? (
                      <svg className="w-4 h-4 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                    <span className="text-sm truncate text-dark-200">{conn.name || conn.host}</span>
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
              className="px-4 py-1 text-xs font-semibold uppercase text-dark-400 cursor-pointer hover:bg-dark-800 flex items-center justify-between"
              onClick={() => setActiveSection('commands')}
            >
              <span>Quick Commands ({commands.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCommand();
                }}
                className="p-1 hover:bg-dark-700 rounded"
                title="Add Command"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {activeSection === 'commands' && (
              <div className="py-1">
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category}>
                    <div className="px-4 py-1 text-xs text-dark-500 uppercase">{category}</div>
                    {cmds.map((cmd) => (
                      <div
                        key={cmd._id}
                        className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-dark-800 transition-colors group ${
                          !cmd.enabled ? 'opacity-50' : ''
                        }`}
                        onClick={() => cmd.enabled && onExecuteCommand && onExecuteCommand(cmd)}
                        onContextMenu={(e) => handleContextMenu(e, cmd, 'command')}
                      >
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate text-dark-200">{cmd.name}</div>
                          {cmd.description && (
                            <div className="text-xs text-dark-500 truncate">{cmd.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {commands.length === 0 && (
                  <div className="px-4 py-4 text-center text-dark-500 text-sm">
                    No commands yet. Click + to add one.
                  </div>
                )}
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
            {contextMenuType === 'connection' && (
              <>
                <button
                  className="w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors text-dark-200"
                  onClick={() => {
                    onConnect(contextMenu.item);
                    handleCloseContextMenu();
                  }}
                >
                  Connect
                </button>
                <button
                  className="w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors text-dark-200"
                  onClick={() => {
                    onEditConnection(contextMenu.item);
                    handleCloseContextMenu();
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-dark-700 transition-colors"
                  onClick={() => {
                    onDeleteConnection(contextMenu.item._id);
                    handleCloseContextMenu();
                  }}
                >
                  Delete
                </button>
              </>
            )}
            {contextMenuType === 'command' && (
              <>
                <button
                  className="w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors text-dark-200"
                  onClick={() => {
                    onEditCommand(contextMenu.item);
                    handleCloseContextMenu();
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-dark-700 transition-colors"
                  onClick={() => {
                    onDeleteCommand(contextMenu.item._id);
                    handleCloseContextMenu();
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Sidebar;
