import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useStore } from './store';

// Components
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import TerminalView from './components/TerminalView';
import SettingsModal from './components/SettingsModal';
import ConnectionForm from './components/ConnectionForm';
import AuthModal from './components/AuthModal';

const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeTabRef = useRef(null);

  const {
    tabs,
    activeTabId,
    addTab,
    updateTab,
    removeTab,
    setActiveTab,
    connections,
    settings,
    loadConnections,
    loadSettings
  } = useStore();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('[App] Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('[App] Socket disconnected');
    });

    newSocket.on('auth-success', () => {
      console.log('[App] Auth success');
      setIsAuthenticated(true);
      setAuthError('');
      loadData();
    });

    newSocket.on('auth-failed', (error) => {
      console.log('[App] Auth failed:', error);
      setAuthError(error);
    });

    // Terminal created
    newSocket.on('terminal:created', (data) => {
      console.log('[App] Terminal created event:', data);
      const currentTabId = activeTabRef.current;
      if (currentTabId) {
        updateTab(currentTabId, { sessionId: data.sessionId });
      }
    });

    // Terminal data received
    newSocket.on('terminal:data', (data) => {
      window.dispatchEvent(new CustomEvent('terminal:data', { detail: data }));
    });

    // Terminal error
    newSocket.on('terminal:error', (data) => {
      console.error('[App] Terminal error:', data);
    });

    // SSH connected
    newSocket.on('ssh:connected', (data) => {
      console.log('[App] SSH connected:', data);
      const currentTabId = activeTabRef.current;
      if (currentTabId) {
        updateTab(currentTabId, { sessionId: data.sessionId, type: 'ssh' });
      }
    });

    // SSH data received
    newSocket.on('ssh:data', (data) => {
      window.dispatchEvent(new CustomEvent('ssh:data', { detail: data }));
    });

    // SSH error
    newSocket.on('ssh:error', (data) => {
      console.error('[App] SSH error:', data);
    });

    // SSH closed
    newSocket.on('ssh:closed', (data) => {
      console.log('[App] SSH closed:', data);
      const tab = tabs.find(t => t.sessionId === data.sessionId);
      if (tab) {
        removeTab(tab.id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load initial data
  const loadData = async () => {
    try {
      await Promise.all([
        loadConnections(),
        loadSettings()
      ]);
    } catch (error) {
      console.error('[App] Error loading data:', error);
    }
  };

  // Create new terminal tab
  const createTerminal = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: 'Terminal',
      type: 'local',
      sessionId: null
    };
    addTab(newTab);
    setActiveTab(newTabId);
    activeTabRef.current = newTabId;

    if (socket && isAuthenticated) {
      socket.emit('terminal:create', {
        cols: 80,
        rows: 24
      });
    }
  }, [socket, isAuthenticated, addTab, setActiveTab]);

  // Connect to SSH
  const connectSSH = useCallback(async (connection) => {
    console.log('[App] Connecting SSH:', connection.host);
    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: connection.name || connection.host,
      type: 'ssh',
      connectionId: connection._id,
      sessionId: null
    };
    addTab(newTab);
    setActiveTab(newTabId);
    activeTabRef.current = newTabId;

    if (socket && isAuthenticated) {
      socket.emit('ssh:connect', {
        host: connection.host,
        port: connection.port,
        username: connection.username,
        authType: connection.authType,
        password: connection.password,
        privateKey: connection.privateKey,
        cols: 80,
        rows: 24
      });
    }
  }, [socket, isAuthenticated, addTab, setActiveTab]);

  // Handle terminal input
  const handleTerminalInput = useCallback((sessionId, data) => {
    if (socket) {
      const tab = tabs.find(t => t.sessionId === sessionId);
      if (tab?.type === 'ssh') {
        socket.emit('ssh:input', { sessionId, data });
      } else {
        socket.emit('terminal:input', { sessionId, data });
      }
    }
  }, [socket, tabs]);

  // Handle terminal resize
  const handleTerminalResize = useCallback((sessionId, cols, rows) => {
    if (socket) {
      const tab = tabs.find(t => t.sessionId === sessionId);
      if (tab?.type === 'ssh') {
        socket.emit('ssh:resize', { sessionId, cols, rows });
      } else {
        socket.emit('terminal:resize', { sessionId, cols, rows });
      }
    }
  }, [socket, tabs]);

  // Close terminal
  const closeTerminal = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.sessionId && socket) {
      if (tab.type === 'ssh') {
        socket.emit('ssh:close', { sessionId: tab.sessionId });
      } else {
        socket.emit('terminal:close', { sessionId: tab.sessionId });
      }
    }
    removeTab(tabId);
  }, [socket, tabs, removeTab]);

  // Handle authentication
  const handleAuth = (password) => {
    if (socket) {
      socket.emit('auth', password);
    }
  };

  // Add new connection
  const handleAddConnection = () => {
    setEditingConnection(null);
    setShowConnectionForm(true);
  };

  // Edit connection
  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    setShowConnectionForm(true);
  };

  // Save connection
  const handleSaveConnection = async (connectionData) => {
    try {
      if (editingConnection) {
        await axios.put(`${BACKEND_URL}/api/connections/${editingConnection._id}`, connectionData);
      } else {
        await axios.post(`${BACKEND_URL}/api/connections`, connectionData);
      }
      await loadConnections();
      setShowConnectionForm(false);
      setEditingConnection(null);
    } catch (error) {
      console.error('[App] Error saving connection:', error);
    }
  };

  // Delete connection
  const handleDeleteConnection = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/connections/${id}`);
      await loadConnections();
    } catch (error) {
      console.error('[App] Error deleting connection:', error);
    }
  };

  if (!isAuthenticated) {
    return <AuthModal onAuth={handleAuth} error={authError} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-dark-950 text-dark-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <h1 className="text-base font-semibold text-dark-100">Terminus</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 text-sm text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          connections={connections}
          onConnect={connectSSH}
          onAddConnection={handleAddConnection}
          onEditConnection={handleEditConnection}
          onDeleteConnection={handleDeleteConnection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Terminal Area */}
        <div className="flex-1 flex flex-col bg-dark-950 overflow-hidden">
          {/* Tab Bar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={setActiveTab}
            onTabClose={closeTerminal}
            onNewTab={createTerminal}
          />

          {/* Terminal View */}
          <TerminalView
            tabs={tabs}
            activeTabId={activeTabId}
            onInput={handleTerminalInput}
            onResize={handleTerminalResize}
            settings={settings}
          />
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showConnectionForm && (
        <ConnectionForm
          connection={editingConnection}
          onSave={handleSaveConnection}
          onClose={() => {
            setShowConnectionForm(false);
            setEditingConnection(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
