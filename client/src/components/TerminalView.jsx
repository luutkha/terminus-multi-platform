import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// Store terminals globally
const terminals = new Map();

// Get all active tab IDs
const getActiveTabIds = (tabs) => new Set(tabs.map(t => t.id));

function TerminalView({ tabs, activeTabId, onInput, onResize, settings }) {
  const containerRef = useRef(null);
  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeTabIdsRef = useRef(new Set());

  // Update active tab IDs whenever tabs change
  useEffect(() => {
    const newTabIds = getActiveTabIds(tabs);

    // Clean up closed tabs
    terminals.forEach((_, tabId) => {
      if (!newTabIds.has(tabId)) {
        const terminalObj = terminals.get(tabId);
        if (terminalObj) {
          if (terminalObj.inputDisposable) {
            terminalObj.inputDisposable.dispose();
          }
          terminalObj.terminal.dispose();
          terminals.delete(tabId);
          // Remove container
          const container = document.getElementById(`terminal-${tabId}`);
          if (container) {
            container.remove();
          }
        }
      }
    });

    activeTabIdsRef.current = newTabIds;
  }, [tabs]);

  // Create terminal for a tab
  const createTerminalForTab = useCallback((tabId) => {
    if (terminals.has(tabId)) {
      return terminals.get(tabId);
    }

    const term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        cursorAccent: '#1e1e1e'
      },
      cursorBlink: true,
      scrollback: 10000
    });

    const fit = new FitAddon();
    term.loadAddon(fit);

    terminals.set(tabId, { terminal: term, fitAddon: fit, sessionId: null });

    return terminals.get(tabId);
  }, []);

  // Set up terminal when activeTab changes
  useEffect(() => {
    if (!activeTab || !containerRef.current) {
      return;
    }

    // Get or create terminal
    const terminalObj = createTerminalForTab(activeTab.id);
    const { terminal, fitAddon } = terminalObj;

    // Get or create container
    let container = document.getElementById(`terminal-${activeTab.id}`);
    if (!container) {
      container = document.createElement('div');
      container.id = `terminal-${activeTab.id}`;
      container.style.width = '100%';
      container.style.height = '100%';
      containerRef.current.appendChild(container);
    }

    // Open terminal if not opened
    if (!terminal.element) {
      terminal.open(container);
      fitAddon.fit();
    }

    // Show this terminal, hide others
    terminals.forEach((obj, id) => {
      const el = document.getElementById(`terminal-${id}`);
      if (el) {
        el.style.display = id === activeTab.id ? 'block' : 'none';
      }
    });

    // Refresh and fit terminal when becoming active
    terminal.refresh(0, terminal.rows - 1);
    fitAddon.fit();

  }, [activeTabId, activeTab, createTerminalForTab]);

  // Handle input and session changes
  useEffect(() => {
    if (!activeTab || !terminals.has(activeTab.id)) return;

    const terminalObj = terminals.get(activeTab.id);
    const { terminal } = terminalObj;

    // Only clear if this is a completely new session (never had a session before)
    const isNewSession = !terminalObj.sessionId && activeTab.sessionId;
    if (isNewSession) {
      terminal.clear();
    }

    // Update sessionId
    terminalObj.sessionId = activeTab.sessionId;

    // Dispose old input handler if exists
    if (terminalObj.inputDisposable) {
      terminalObj.inputDisposable.dispose();
    }

    // Set up input handler
    const inputHandler = (data) => {
      if (activeTab.sessionId) {
        onInput(activeTab.sessionId, data);
      }
    };

    // Store the disposable for cleanup
    const inputDisposable = terminal.onData(inputHandler);
    terminalObj.inputHandler = inputHandler;
    terminalObj.inputDisposable = inputDisposable;

    // Resize if we have a session
    if (activeTab.sessionId) {
      setTimeout(() => {
        const { fitAddon } = terminalObj;
        fitAddon.fit();
        onResize(activeTab.sessionId, terminal.cols, terminal.rows);
      }, 100);
    }

    // Cleanup
    return () => {
      if (terminalObj.inputDisposable) {
        terminalObj.inputDisposable.dispose();
      }
    };

  }, [activeTab?.id, activeTab?.sessionId, onInput, onResize]);

  // Listen for terminal data
  useEffect(() => {
    const handleTerminalData = (event) => {
      const { sessionId: incomingSessionId, data } = event.detail;
      if (!activeTab || incomingSessionId !== activeTab.sessionId) return;

      // Check if tab is still active
      if (!activeTabIdsRef.current.has(activeTab.id)) return;

      const terminalObj = terminals.get(activeTab.id);
      if (terminalObj) {
        terminalObj.terminal.write(data);
      }
    };

    const handleSSHData = (event) => {
      const { sessionId: incomingSessionId, data } = event.detail;
      if (!activeTab || incomingSessionId !== activeTab.sessionId) return;

      // Check if tab is still active
      if (!activeTabIdsRef.current.has(activeTab.id)) return;

      const terminalObj = terminals.get(activeTab.id);
      if (terminalObj) {
        terminalObj.terminal.write(data);
      }
    };

    window.addEventListener('terminal:data', handleTerminalData);
    window.addEventListener('ssh:data', handleSSHData);

    return () => {
      window.removeEventListener('terminal:data', handleTerminalData);
      window.removeEventListener('ssh:data', handleSSHData);
    };
  }, [activeTab?.sessionId, activeTab?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminals.forEach(({ terminal }) => {
        terminal.dispose();
      });
      terminals.clear();
    };
  }, []);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="text-4xl mb-4">🖥</div>
          <div className="text-dark-400">
            No terminal open. Click + to create a new terminal.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 bg-dark-950 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default TerminalView;
