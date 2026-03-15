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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-900 rounded-lg w-full max-w-md border border-dark-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-dark-400 mb-1">Font Size</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.fontSize || 14}
                onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) })}
                min={8}
                max={32}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-dark-400 mb-1">Font Family</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.fontFamily || 'Consolas, monospace'}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-dark-400 mb-1">Theme</label>
              <select
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.theme || 'dark'}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-dark-400 mb-1">Scrollback Buffer</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.scrollback || 10000}
                onChange={(e) => setFormData({ ...formData, scrollback: parseInt(e.target.value) })}
                min={1000}
                max={100000}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                Save
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded transition-colors">
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
