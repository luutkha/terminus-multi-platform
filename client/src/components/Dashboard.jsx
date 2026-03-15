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
    <div className="flex-1 bg-[#0a0a0f]/50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-500">Welcome back to Terminus</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Connections */}
          <div className="card-glass p-6 neon-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Connections</p>
                <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                  {stats.totalConnections}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="card-glass p-6 neon-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Sessions</p>
                <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                  {stats.activeSessions}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center relative">
                <svg className="w-7 h-7 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {stats.activeSessions > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Commands */}
          <div className="card-glass p-6 neon-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Quick Commands</p>
                <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  {stats.totalCommands}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Connections */}
          <div className="card-glass border border-white/10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-cyan" />
              <h2 className="text-lg font-semibold text-white">Recent Connections</h2>
            </div>
            <div className="p-4">
              {recentConnections.length > 0 ? (
                <div className="space-y-2">
                  {recentConnections.map((conn, index) => (
                    <div
                      key={conn._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group border border-transparent hover:border-white/5"
                      onClick={() => onConnect(conn)}
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{conn.name || conn.host}</p>
                          <p className="text-gray-500 text-xs">{conn.username}@{conn.host}:{conn.port}</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No connections yet</p>
                  <p className="text-gray-600 text-sm mt-1">Add a connection from the sidebar</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Commands */}
          <div className="card-glass border border-white/10 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-purple" />
              <h2 className="text-lg font-semibold text-white">Quick Commands</h2>
            </div>
            <div className="p-4">
              {commands.filter(c => c.enabled).length > 0 ? (
                <div className="space-y-2">
                  {commands.filter(c => c.enabled).slice(0, 5).map((cmd, index) => (
                    <div
                      key={cmd._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group border border-transparent hover:border-white/5"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{cmd.name}</p>
                          <p className="text-gray-500 text-xs font-mono">{cmd.command}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No commands configured</p>
                  <p className="text-gray-600 text-sm mt-1">Add commands from the sidebar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="card-glass border border-white/10 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon-yellow" />
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
              <kbd className="px-4 py-3 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-lg border border-neon-purple/30 text-white font-mono text-sm">
                Ctrl+T
              </kbd>
              <p className="text-gray-500 text-xs mt-3">New Terminal</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
              <kbd className="px-4 py-3 bg-gradient-to-r from-neon-red/20 to-neon-orange/20 rounded-lg border border-neon-red/30 text-white font-mono text-sm">
                Ctrl+W
              </kbd>
              <p className="text-gray-500 text-xs mt-3">Close Tab</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
              <kbd className="px-4 py-3 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 rounded-lg border border-neon-cyan/30 text-white font-mono text-sm">
                Ctrl+Tab
              </kbd>
              <p className="text-gray-500 text-xs mt-3">Next Tab</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
              <kbd className="px-4 py-3 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 rounded-lg border border-neon-green/30 text-white font-mono text-sm">
                Ctrl+Shift+Tab
              </kbd>
              <p className="text-gray-500 text-xs mt-3">Previous Tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
