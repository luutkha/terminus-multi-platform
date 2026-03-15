import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useStore } from './store';

// Components
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import TerminalView from './components/TerminalView';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import ConnectionForm from './components/ConnectionForm';
import CommandModal from './components/CommandModal';
import AuthModal from './components/AuthModal';

const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showCommandForm, setShowCommandForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [editingCommand, setEditingCommand] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const activeTabRef = useRef(null);

  const {
    tabs,
    activeTabId,
    addTab,
    updateTab,
    removeTab,
    setActiveTab,
    connections,
    commands,
    settings,
    loadConnections,
    loadSettings,
    loadCommands,
    addCommand,
    updateCommand,
    deleteCommand
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
        updateTab(currentTabId, { sessionId: data.sessionId, type: 'ssh', connecting: false });
      }
      setConnectingId(null);
    });

    // SSH data received
    newSocket.on('ssh:data', (data) => {
      window.dispatchEvent(new CustomEvent('ssh:data', { detail: data }));
    });

    // SSH error
    newSocket.on('ssh:error', (data) => {
      console.error('[App] SSH error:', data);
      setConnectingId(null);
      // Find and update the connecting tab
      const connectingTab = tabs.find(t => t.connecting);
      if (connectingTab) {
        updateTab(connectingTab.id, { connecting: false });
      }
      setAlert({ type: 'error', message: data.error || 'Connection failed' });
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
        loadSettings(),
        loadCommands()
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

  // Open dashboard
  const openDashboard = useCallback(() => {
    const existingDashboard = tabs.find(t => t.type === 'dashboard');
    if (existingDashboard) {
      setActiveTab(existingDashboard.id);
    } else {
      const newTabId = `tab-${Date.now()}`;
      const newTab = {
        id: newTabId,
        title: 'Dashboard',
        type: 'dashboard',
        sessionId: null
      };
      addTab(newTab);
      setActiveTab(newTabId);
      activeTabRef.current = newTabId;
    }
  }, [tabs, addTab, setActiveTab]);

  // Connect to SSH
  const connectSSH = useCallback(async (connection) => {
    // Check if already connected to this server
    const existingTab = tabs.find(tab =>
      tab.type === 'ssh' &&
      tab.connectionId === connection._id &&
      tab.sessionId
    );

    if (existingTab) {
      // Show modal instead of blocking
      setDuplicateModal({
        connection,
        existingTabId: existingTab.id
      });
      return;
    }

    console.log('[App] Connecting SSH:', connection.host);
    setConnectingId(connection._id);

    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: connection.name || connection.host,
      type: 'ssh',
      connectionId: connection._id,
      sessionId: null,
      connecting: true
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
  }, [socket, isAuthenticated, addTab, setActiveTab, tabs]);

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

  // Add/Edit command
  const handleAddCommand = () => {
    setEditingCommand(null);
    setShowCommandForm(true);
  };

  const handleEditCommand = (command) => {
    setEditingCommand(command);
    setShowCommandForm(true);
  };

  const handleSaveCommand = async (commandData) => {
    try {
      if (editingCommand) {
        await updateCommand(editingCommand._id, commandData);
      } else {
        await addCommand(commandData);
      }
      setShowCommandForm(false);
      setEditingCommand(null);
    } catch (error) {
      console.error('[App] Error saving command:', error);
    }
  };

  const handleDeleteCommand = async (id) => {
    try {
      await deleteCommand(id);
    } catch (error) {
      console.error('[App] Error deleting command:', error);
    }
  };

  // Handle duplicate connection modal
  const handleGoToExisting = () => {
    if (duplicateModal) {
      setActiveTab(duplicateModal.existingTabId);
      setDuplicateModal(null);
    }
  };

  const handleOpenNewConnection = () => {
    if (duplicateModal) {
      const connection = duplicateModal.connection;
      setDuplicateModal(null);

      console.log('[App] Opening new connection:', connection.host);
      setConnectingId(connection._id);

      const newTabId = `tab-${Date.now()}`;
      const newTab = {
        id: newTabId,
        title: connection.name || connection.host,
        type: 'ssh',
        connectionId: connection._id,
        sessionId: null,
        connecting: true
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
    }
  };

  // Execute command in active SSH session
  const handleExecuteCommand = useCallback((command) => {
    const activeSSHTab = tabs.find(tab => tab.type === 'ssh' && tab.sessionId);
    if (!activeSSHTab) {
      setAlert({ type: 'warning', message: 'No active SSH connection. Connect to a server first.' });
      return;
    }

    if (socket && activeSSHTab.sessionId) {
      // Send the command with Enter
      socket.emit('ssh:input', { sessionId: activeSSHTab.sessionId, data: command.command + '\n' });
    }
  }, [socket, tabs]);

  // Render content based on active tab
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isDashboard = activeTab?.type === 'dashboard';

  if (!isAuthenticated) {
    return <AuthModal onAuth={handleAuth} error={authError} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-dark-950 text-dark-200 overflow-hidden">
      {/* Alert */}
      {alert && (
        <div className={`px-4 py-2 text-sm flex items-center justify-between ${
          alert.type === 'error' ? 'bg-red-600' :
          alert.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`}>
          <span className="text-white">{alert.message}</span>
          <button onClick={() => setAlert(null)} className="text-white hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <button
            onClick={openDashboard}
            className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center hover:from-blue-400 hover:to-blue-600 transition-all"
          >
            <span className="text-white font-bold text-sm">T</span>
          </button>
          <h1 className="text-base font-semibold text-dark-100">Terminus</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDashboard}
            className="px-3 py-1.5 text-sm text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded transition-colors"
          >
            Dashboard
          </button>
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
          commands={commands}
          onConnect={connectSSH}
          onAddConnection={handleAddConnection}
          onEditConnection={handleEditConnection}
          onDeleteConnection={handleDeleteConnection}
          onAddCommand={handleAddCommand}
          onEditCommand={handleEditCommand}
          onDeleteCommand={handleDeleteCommand}
          onExecuteCommand={handleExecuteCommand}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          connectingId={connectingId}
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

          {/* Content */}
          {isDashboard ? (
            <Dashboard onConnect={connectSSH} />
          ) : (
            <TerminalView
              tabs={tabs}
              activeTabId={activeTabId}
              onInput={handleTerminalInput}
              onResize={handleTerminalResize}
              settings={settings}
            />
          )}
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

      {showCommandForm && (
        <CommandModal
          command={editingCommand}
          onSave={handleSaveCommand}
          onClose={() => {
            setShowCommandForm(false);
            setEditingCommand(null);
          }}
        />
      )}

      {/* Duplicate Connection Modal */}
      {duplicateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDuplicateModal(null)}>
          <div className="bg-dark-900 rounded-lg w-full max-w-sm border border-dark-700" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Already Connected</h3>
              <p className="text-dark-400 text-sm mb-6">
                You are already connected to <span className="text-dark-200 font-medium">{duplicateModal.connection.name || duplicateModal.connection.host}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleGoToExisting}
                  className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded transition-colors"
                >
                  Go to Existing
                </button>
                <button
                  onClick={handleOpenNewConnection}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Open New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
