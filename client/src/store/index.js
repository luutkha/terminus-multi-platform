import { create } from 'zustand';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

export const useStore = create((set, get) => ({
  // Tabs state
  tabs: [],
  activeTabId: null,

  addTab: (tab) => set((state) => ({
    tabs: [...state.tabs, tab],
    activeTabId: tab.id
  })),

  removeTab: (tabId) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== tabId);
    let newActiveId = state.activeTabId;

    if (state.activeTabId === tabId) {
      const idx = state.tabs.findIndex(t => t.id === tabId);
      if (newTabs.length > 0) {
        newActiveId = newTabs[Math.max(0, idx - 1)]?.id || newTabs[0]?.id;
      } else {
        newActiveId = null;
      }
    }

    return { tabs: newTabs, activeTabId: newActiveId };
  }),

  updateTab: (tabId, updates) => set((state) => ({
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, ...updates } : t)
  })),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  // Connections state
  connections: [],

  loadConnections: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/connections`);
      set({ connections: response.data });
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  },

  // Commands state
  commands: [],

  loadCommands: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/commands`);
      set({ commands: response.data });
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  },

  addCommand: async (command) => {
    try {
      await axios.post(`${BACKEND_URL}/api/commands`, command);
      await get().loadCommands();
    } catch (error) {
      console.error('Error adding command:', error);
    }
  },

  deleteCommand: async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/commands/${id}`);
      await get().loadCommands();
    } catch (error) {
      console.error('Error deleting command:', error);
    }
  },

  // Settings state
  settings: {
    fontSize: 14,
    fontFamily: 'Consolas, monospace',
    theme: 'dark',
    scrollback: 10000
  },

  loadSettings: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      set({ settings: response.data });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/settings`, newSettings);
      set({ settings: response.data });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }
}));
