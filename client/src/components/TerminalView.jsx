import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import 'xterm/css/xterm.css';
import terminalThemes from '../styles/terminalThemes';

// Store terminals globally
const terminals = new Map();

// Get all active tab IDs
const getActiveTabIds = (tabs) => new Set(tabs.map(t => t.id));

// Default theme
const defaultTheme = terminalThemes.defaultDark;

function TerminalView({ tabs, activeTabId, onInput, onResize, settings }) {
  const containerRef = useRef(null);
  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeTabIdsRef = useRef(new Set());
  const settingsRef = useRef(settings);
  const clipboardAddonRef = useRef(null);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Get terminal theme based on settings
  const getTerminalTheme = useCallback(() => {
    const themeName = settingsRef.current?.terminalTheme || 'defaultDark';
    return terminalThemes[themeName] || defaultTheme;
  }, []);

  // Copy function
  const copySelection = useCallback(() => {
    const terminalObj = terminals.get(activeTab?.id);
    if (terminalObj?.terminal?.hasSelection()) {
      const selection = terminalObj.terminal.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
        return true;
      }
    }
    return false;
  }, [activeTab]);

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

    const theme = getTerminalTheme();
    const fontSize = settingsRef.current?.fontSize || 14;
    const fontFamily = settingsRef.current?.fontFamily || 'Consolas, monospace';
    const cursorBlink = settingsRef.current?.cursorBlink !== false;
    const scrollback = settingsRef.current?.scrollback || 10000;

    const term = new Terminal({
      fontSize,
      fontFamily,
      theme,
      cursorBlink,
      cursorStyle: settingsRef.current?.cursorStyle || 'block',
      scrollback,
      allowTransparency: false,
      convertEol: true,
      copyOnSelect: true,
      macOptionIsMeta: false,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);

    // Load clipboard addon for copy/paste support
    const clipboardAddon = new ClipboardAddon();
    term.loadAddon(clipboardAddon);
    clipboardAddonRef.current = clipboardAddon;

    terminals.set(tabId, { terminal: term, fitAddon: fit, clipboardAddon, sessionId: null });

    return terminals.get(tabId);
  }, [getTerminalTheme]);

  // Set up terminal when activeTab changes
  useEffect(() => {
    if (!activeTab || !containerRef.current) {
      return;
    }

    // Get or create terminal
    const terminalObj = createTerminalForTab(activeTab.id);
    const { terminal, fitAddon, clipboardAddon } = terminalObj;

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

    // Apply theme in case it changed
    const theme = getTerminalTheme();
    terminal.options.theme = theme;
    terminal.options.fontSize = settingsRef.current?.fontSize || 14;
    terminal.options.fontFamily = settingsRef.current?.fontFamily || 'Consolas, monospace';
    terminal.options.cursorBlink = settingsRef.current?.cursorBlink !== false;
    terminal.options.cursorStyle = settingsRef.current?.cursorStyle || 'block';

    // Store clipboard addon reference
    clipboardAddonRef.current = clipboardAddon;

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

  }, [activeTabId, activeTab, createTerminalForTab, getTerminalTheme]);

  // Handle input and session changes
  useEffect(() => {
    if (!activeTab || !terminals.has(activeTab.id)) return;

    const terminalObj = terminals.get(activeTab.id);
    const { terminal } = terminalObj;

    // Only clear if this is a completely new session
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

  // Handle keyboard shortcuts for copy
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+C or Ctrl+Shift+Ins - Copy
      if ((e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.shiftKey && e.key === 'Insert')) {
        e.preventDefault();
        const terminalObj = terminals.get(activeTab?.id);
        if (terminalObj?.terminal?.hasSelection()) {
          const selection = terminalObj.terminal.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Listen for terminal data
  useEffect(() => {
    const handleTerminalData = (event) => {
      const { sessionId: incomingSessionId, data } = event.detail;
      if (!activeTab || incomingSessionId !== activeTab.sessionId) return;

      if (!activeTabIdsRef.current.has(activeTab.id)) return;

      const terminalObj = terminals.get(activeTab.id);
      if (terminalObj) {
        terminalObj.terminal.write(data);
      }
    };

    const handleSSHData = (event) => {
      const { sessionId: incomingSessionId, data } = event.detail;
      if (!activeTab || incomingSessionId !== activeTab.sessionId) return;

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
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-gray-500 text-lg font-medium mb-2">
            No terminal open
          </div>
          <div className="text-gray-600 text-sm">
            Click the + button to create a new terminal
          </div>
        </div>
      </div>
    );
  }

  const theme = getTerminalTheme();

  return (
    <div className="flex-1 p-1 overflow-hidden" style={{ backgroundColor: theme.background }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default TerminalView;
