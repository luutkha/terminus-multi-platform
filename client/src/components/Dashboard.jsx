import { useState, useEffect } from 'react';
import { useStore } from '../store';

function Dashboard({ onConnect }) {
  const { connections, commands, tabs } = useStore();
  const [stats, setStats] = useState({
    totalConnections: 0,
    activeSessions: 0,
    totalCommands: 0
  });

  useEffect(() => {
    setStats({
      totalConnections: connections.length,
      activeSessions: tabs.filter(t => t.sessionId).length,
      totalCommands: commands.length
    });
  }, [connections, tabs, commands]);

  const recentConnections = connections.slice(0, 5);

  return (
    <div className="flex-1 bg-dark-950 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-100 mb-2">Dashboard</h1>
          <p className="text-dark-400">Welcome to Terminus - Server Manager</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Connections</p>
                <p className="text-3xl font-bold text-dark-100 mt-1">{stats.totalConnections}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-dark-100 mt-1">{stats.activeSessions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Quick Commands</p>
                <p className="text-3xl font-bold text-dark-100 mt-1">{stats.totalCommands}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Connections */}
          <div className="bg-dark-900 rounded-xl border border-dark-700">
            <div className="px-6 py-4 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-dark-100">Recent Connections</h2>
            </div>
            <div className="p-4">
              {recentConnections.length > 0 ? (
                <div className="space-y-2">
                  {recentConnections.map((conn) => (
                    <div
                      key={conn._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800 hover:bg-dark-700 cursor-pointer transition-colors"
                      onClick={() => onConnect(conn)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-dark-100 font-medium">{conn.name || conn.host}</p>
                          <p className="text-dark-400 text-xs">{conn.username}@{conn.host}:{conn.port}</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <p>No connections yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Commands */}
          <div className="bg-dark-900 rounded-xl border border-dark-700">
            <div className="px-6 py-4 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-dark-100">Quick Commands</h2>
            </div>
            <div className="p-4">
              {commands.filter(c => c.enabled).length > 0 ? (
                <div className="space-y-2">
                  {commands.filter(c => c.enabled).slice(0, 5).map((cmd) => (
                    <div
                      key={cmd._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800 hover:bg-dark-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-dark-100 font-medium">{cmd.name}</p>
                          <p className="text-dark-400 text-xs">{cmd.description || cmd.command}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No commands configured</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-dark-900 rounded-xl border border-dark-700">
          <div className="px-6 py-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-dark-100">Keyboard Shortcuts</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <kbd className="px-3 py-2 bg-dark-800 rounded-lg border border-dark-600 text-dark-200 font-mono text-sm">Ctrl+T</kbd>
              <p className="text-dark-400 text-xs mt-2">New Terminal</p>
            </div>
            <div className="text-center">
              <kbd className="px-3 py-2 bg-dark-800 rounded-lg border border-dark-600 text-dark-200 font-mono text-sm">Ctrl+W</kbd>
              <p className="text-dark-400 text-xs mt-2">Close Tab</p>
            </div>
            <div className="text-center">
              <kbd className="px-3 py-2 bg-dark-800 rounded-lg border border-dark-600 text-dark-200 font-mono text-sm">Ctrl+Tab</kbd>
              <p className="text-dark-400 text-xs mt-2">Next Tab</p>
            </div>
            <div className="text-center">
              <kbd className="px-3 py-2 bg-dark-800 rounded-lg border border-dark-600 text-dark-200 font-mono text-sm">Ctrl+Shift+Tab</kbd>
              <p className="text-dark-400 text-xs mt-2">Previous Tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
