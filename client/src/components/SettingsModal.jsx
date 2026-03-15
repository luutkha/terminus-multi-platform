import { useState, useEffect } from 'react';
import { useStore } from '../store';

function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    onClose();
  };

  const themes = [
    { id: 'dark', name: 'Dark', color: '#1e1e1e' },
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'blue', name: 'Ocean Blue', color: '#0ea5e9' },
    { id: 'green', name: 'Forest Green', color: '#22c55e' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-900 rounded-lg w-full max-w-lg border border-dark-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100">Settings</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Theme Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-300 mb-3">Theme Color</label>
              <div className="grid grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id, themeColor: theme.color })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.theme === theme.id
                        ? 'border-blue-500 bg-dark-800'
                        : 'border-dark-700 hover:border-dark-600 bg-dark-800'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-xs text-dark-300">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-300 mb-2">Font Size</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  value={formData.fontSize || 14}
                  onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) })}
                  min={10}
                  max={24}
                />
                <span className="text-sm text-dark-300 w-8">{formData.fontSize || 14}px</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-300 mb-2">Font Family</label>
              <select
                className="w-full px-4 py-2 bg-dark-950 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.fontFamily || 'Consolas, monospace'}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
              >
                <option value="Consolas, monospace">Consolas</option>
                <option value="Monaco, monospace">Monaco</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Fira Code, monospace">Fira Code</option>
                <option value="'Source Code Pro', monospace">Source Code Pro</option>
              </select>
            </div>

            {/* Font Weight */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-300 mb-2">Font Weight</label>
              <select
                className="w-full px-4 py-2 bg-dark-950 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.fontWeight || 'normal'}
                onChange={(e) => setFormData({ ...formData, fontWeight: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            {/* Cursor Style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-300 mb-2">Cursor Style</label>
              <select
                className="w-full px-4 py-2 bg-dark-950 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.cursorStyle || 'block'}
                onChange={(e) => setFormData({ ...formData, cursorStyle: e.target.value })}
              >
                <option value="block">Block</option>
                <option value="underline">Underline</option>
                <option value="bar">Bar</option>
              </select>
            </div>

            {/* Cursor Blink */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cursorBlink !== false}
                  onChange={(e) => setFormData({ ...formData, cursorBlink: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-950 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-dark-300">Cursor Blink</span>
              </label>
            </div>

            {/* Scrollback Buffer */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-300 mb-2">Scrollback Buffer</label>
              <select
                className="w-full px-4 py-2 bg-dark-950 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.scrollback || 10000}
                onChange={(e) => setFormData({ ...formData, scrollback: parseInt(e.target.value) })}
              >
                <option value={5000}>5,000 lines</option>
                <option value={10000}>10,000 lines</option>
                <option value={25000}>25,000 lines</option>
                <option value={50000}>50,000 lines</option>
                <option value={100000}>100,000 lines</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                Save
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
