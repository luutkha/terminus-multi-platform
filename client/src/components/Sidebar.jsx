import { useState, useEffect } from 'react';

function Sidebar({
  connections,
  commands,
  commandGroups,
  onConnect,
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  onAddCommand,
  onEditCommand,
  onDeleteCommand,
  onExecuteCommand,
  onAddCommandGroup,
  onEditCommandGroup,
  onDeleteCommandGroup,
  collapsed,
  onToggleCollapse,
  connectingId
}) {
  const [activeSection, setActiveSection] = useState('connections');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuType, setContextMenuType] = useState(null);

  // Toggle group expand/collapse
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
    setContextMenuType(type);
  };

  // Handle adding new command group from the header
  const handleAddGroupFromHeader = (e) => {
    e.stopPropagation();
    onAddCommandGroup();
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

  // Get custom groups sorted by order
  const sortedGroups = [...commandGroups].sort((a, b) => a.order - b.order);

  // Separate uncategorized commands from custom groups
  const uncategorizedCommands = groupedCommands['General'] || [];
  const customGroupNames = sortedGroups.map(g => g.name);
  const otherCategories = Object.keys(groupedCommands).filter(cat => !customGroupNames.includes(cat));

  if (collapsed) {
    return (
      <div className="w-14 bg-[#0a0a0f]/80 backdrop-blur-sm border-r border-white/5 flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all group relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#12121a] text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            Expand
          </span>
        </button>

        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <button
          onClick={() => { setActiveSection('connections'); onToggleCollapse(); }}
          className={`p-2.5 rounded-lg transition-all ${activeSection === 'connections' ? 'text-neon-purple bg-neon-purple/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          title="SSH Connections"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => { setActiveSection('commands'); onToggleCollapse(); }}
          className={`p-2.5 rounded-lg transition-all ${activeSection === 'commands' ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          title="Quick Commands"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-72 bg-[#0a0a0f]/80 backdrop-blur-sm border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Explorer</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* SSH Connections */}
          <div className="mb-2">
            <div
              className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between group"
              onClick={() => setActiveSection(activeSection === 'connections' ? null : 'connections')}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                SSH ({connections.length})
              </span>
              <svg className={`w-3 h-3 transition-transform ${activeSection === 'connections' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {activeSection === 'connections' && (
              <div className="animate-slide-up">
                {connections.map((conn) => (
                  <div
                    key={conn._id}
                    className={`connection-item mx-2 px-3 py-2.5 flex items-center gap-3 cursor-pointer rounded-lg transition-all group ${
                      connectingId === conn._id ? 'opacity-50' : 'hover:bg-white/5'
                    }`}
                    onClick={() => onConnect(conn)}
                    onContextMenu={(e) => handleContextMenu(e, conn, 'connection')}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      connectingId === conn._id
                        ? 'bg-neon-purple/20'
                        : 'bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 group-hover:from-neon-purple/30 group-hover:to-neon-cyan/30'
                    }`}>
                      {connectingId === conn._id ? (
                        <svg className="w-4 h-4 animate-spin text-neon-purple" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate text-gray-200 group-hover:text-white transition-colors">
                        {conn.name || conn.host}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {conn.username}@{conn.host}:{conn.port}
                      </div>
                    </div>

                    {/* Status dot */}
                    {connectingId === conn._id && (
                      <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                    )}
                  </div>
                ))}

                {/* Add Connection Button */}
                <div
                  className="mx-2 mt-1 px-3 py-2.5 flex items-center gap-3 cursor-pointer text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all group border border-dashed border-white/10 hover:border-white/20"
                  onClick={onAddConnection}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-neon-purple/20 transition-all">
                    <svg className="w-4 h-4 group-hover:text-neon-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:text-white transition-colors">Add Connection</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Commands */}
          <div className="border-t border-white/5 pt-2">
            <div
              className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between group"
              onClick={() => setActiveSection(activeSection === 'commands' ? null : 'commands')}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Commands ({commands.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddGroupFromHeader}
                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Add Group"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCommand();
                  }}
                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Add Command"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {activeSection === 'commands' && (
              <div className="animate-slide-up">
                {/* Custom Groups */}
                {sortedGroups.map((group) => {
                  const groupCommands = groupedCommands[group.name] || [];
                  return (
                    <div key={group._id}>
                      <div
                        className="px-4 py-1.5 text-[10px] text-gray-600 uppercase font-medium tracking-wider flex items-center gap-2 cursor-pointer hover:bg-white/5"
                        onClick={() => toggleGroup(group._id)}
                        onContextMenu={(e) => handleContextMenu(e, group, 'commandGroup')}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span>{group.name}</span>
                        <span className="text-gray-500 text-[9px]">({groupCommands.length})</span>
                        <svg className={`w-3 h-3 ml-auto transition-transform ${expandedGroups.has(group._id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {expandedGroups.has(group._id) && groupCommands.map((cmd) => (
                        <div
                          key={cmd._id}
                          className={`mx-2 px-3 py-2 flex items-center gap-3 cursor-pointer rounded-lg transition-all group ${
                            !cmd.enabled ? 'opacity-40' : 'hover:bg-white/5'
                          }`}
                          onClick={() => cmd.enabled && onExecuteCommand && onExecuteCommand(cmd)}
                          onContextMenu={(e) => handleContextMenu(e, cmd, 'command')}
                        >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                            !cmd.enabled ? 'bg-white/5' : 'bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 group-hover:from-neon-pink/30 group-hover:to-neon-purple/30'
                          }`}>
                            <svg className={`w-3.5 h-3.5 ${!cmd.enabled ? 'text-gray-600' : 'text-neon-pink'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm truncate ${!cmd.enabled ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'}`}>
                              {cmd.name}
                            </div>
                            {cmd.description && (
                              <div className="text-[11px] text-gray-600 truncate">{cmd.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Uncategorized/General commands */}
                {uncategorizedCommands.length > 0 && (
                  <div key="uncategorized">
                    <div
                      className="px-4 py-1.5 text-[10px] text-gray-600 uppercase font-medium tracking-wider flex items-center gap-2 cursor-pointer hover:bg-white/5"
                      onClick={() => toggleGroup('uncategorized')}
                    >
                      <span className="w-1 h-1 rounded-full bg-neon-cyan/50" />
                      Uncategorized
                      <span className="text-gray-500 text-[9px]">({uncategorizedCommands.length})</span>
                      <svg className={`w-3 h-3 ml-auto transition-transform ${expandedGroups.has('uncategorized') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {expandedGroups.has('uncategorized') && uncategorizedCommands.map((cmd) => (
                      <div
                        key={cmd._id}
                        className={`mx-2 px-3 py-2 flex items-center gap-3 cursor-pointer rounded-lg transition-all group ${
                          !cmd.enabled ? 'opacity-40' : 'hover:bg-white/5'
                        }`}
                        onClick={() => cmd.enabled && onExecuteCommand && onExecuteCommand(cmd)}
                        onContextMenu={(e) => handleContextMenu(e, cmd, 'command')}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                          !cmd.enabled ? 'bg-white/5' : 'bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 group-hover:from-neon-pink/30 group-hover:to-neon-purple/30'
                        }`}>
                          <svg className={`w-3.5 h-3.5 ${!cmd.enabled ? 'text-gray-600' : 'text-neon-pink'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${!cmd.enabled ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'}`}>
                            {cmd.name}
                          </div>
                          {cmd.description && (
                            <div className="text-[11px] text-gray-600 truncate">{cmd.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other categories not in custom groups */}
                {otherCategories.map((category) => (
                  <div key={category}>
                    <div
                      className="px-4 py-1.5 text-[10px] text-gray-600 uppercase font-medium tracking-wider flex items-center gap-2 cursor-pointer hover:bg-white/5"
                      onClick={() => toggleGroup(`cat-${category}`)}
                    >
                      <span className="w-1 h-1 rounded-full bg-neon-cyan/50" />
                      {category}
                      <span className="text-gray-500 text-[9px]">({groupedCommands[category]?.length || 0})</span>
                      <svg className={`w-3 h-3 ml-auto transition-transform ${expandedGroups.has(`cat-${category}`) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {expandedGroups.has(`cat-${category}`) && groupedCommands[category].map((cmd) => (
                      <div
                        key={cmd._id}
                        className={`mx-2 px-3 py-2 flex items-center gap-3 cursor-pointer rounded-lg transition-all group ${
                          !cmd.enabled ? 'opacity-40' : 'hover:bg-white/5'
                        }`}
                        onClick={() => cmd.enabled && onExecuteCommand && onExecuteCommand(cmd)}
                        onContextMenu={(e) => handleContextMenu(e, cmd, 'command')}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                          !cmd.enabled ? 'bg-white/5' : 'bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 group-hover:from-neon-pink/30 group-hover:to-neon-purple/30'
                        }`}>
                          <svg className={`w-3.5 h-3.5 ${!cmd.enabled ? 'text-gray-600' : 'text-neon-pink'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${!cmd.enabled ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'}`}>
                            {cmd.name}
                          </div>
                          {cmd.description && (
                            <div className="text-[11px] text-gray-600 truncate">{cmd.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {commands.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No commands yet</p>
                    <p className="text-gray-600 text-xs mt-1">Click + to add one</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1a1a25]/95 backdrop-blur-xl border border-white/10 rounded-xl py-1.5 min-w-44 z-50 shadow-2xl shadow-black/50 animate-scale-in overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenuType === 'connection' && (
            <>
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                onClick={() => {
                  onConnect(contextMenu.item);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Connect
              </button>
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                onClick={() => {
                  onEditConnection(contextMenu.item);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <div className="my-1 border-t border-white/5" />
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-neon-red/10 transition-colors flex items-center gap-3 text-neon-red"
                onClick={() => {
                  onDeleteConnection(contextMenu.item._id);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          )}
          {contextMenuType === 'command' && (
            <>
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                onClick={() => {
                  onEditCommand(contextMenu.item);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <div className="my-1 border-t border-white/5" />
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-neon-red/10 transition-colors flex items-center gap-3 text-neon-red"
                onClick={() => {
                  onDeleteCommand(contextMenu.item._id);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          )}
          {contextMenuType === 'commandGroup' && (
            <>
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                onClick={() => {
                  onEditCommandGroup(contextMenu.item);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Group
              </button>
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                onClick={() => {
                  onAddCommand();
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Command
              </button>
              <div className="my-1 border-t border-white/5" />
              <button
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-neon-red/10 transition-colors flex items-center gap-3 text-neon-red"
                onClick={() => {
                  onDeleteCommandGroup(contextMenu.item._id);
                  handleCloseContextMenu();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Group
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Sidebar;
