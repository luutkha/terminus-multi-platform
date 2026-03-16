import { useState, useEffect } from 'react';
import { useStore } from '../store';
import terminalThemes from '../styles/terminalThemes';
import CustomSelect from './CustomSelect';

function SettingsModal({ onClose }) {
  const { settings, updateSettings, availableShells, loadAvailableShells } = useStore();
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
    loadAvailableShells();
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    onClose();
  };

  const uiThemes = [
    { id: 'dark', name: 'Dark', color: '#1e1e1e' },
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'blue', name: 'Ocean', color: '#0ea5e9' },
    { id: 'green', name: 'Forest', color: '#22c55e' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
  ];

  const themeOptions = Object.entries(terminalThemes).map(([id, theme]) => ({
    id,
    name: theme.name,
    background: theme.background,
    foreground: theme.foreground,
    accent: theme.blue || theme.cyan || theme.magenta
  }));

  const fontFamilyOptions = [
    { value: 'Consolas, monospace', label: 'Consolas' },
    { value: 'Monaco, monospace', label: 'Monaco' },
    { value: "'Courier New', monospace", label: 'Courier New' },
    { value: 'Fira Code, monospace', label: 'Fira Code' },
    { value: "'Source Code Pro', monospace", label: 'Source Code Pro' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  ];

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
  ];

  const cursorStyleOptions = [
    { value: 'block', label: 'Block' },
    { value: 'underline', label: 'Underline' },
    { value: 'bar', label: 'Bar' },
  ];

  const scrollbackOptions = [
    { value: 5000, label: '5,000 lines' },
    { value: 10000, label: '10,000 lines' },
    { value: 25000, label: '25,000 lines' },
    { value: 50000, label: '50,000 lines' },
    { value: 100000, label: '100,000 lines' },
  ];

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#12121a] rounded-xl w-full max-w-2xl border border-white/10 shadow-2xl shadow-neon-purple/10 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit}>
            {/* Terminal Theme Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Terminal Theme
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, terminalTheme: theme.id })}
                    className={`p-2 rounded-xl border-2 transition-all ${
                      formData.terminalTheme === theme.id
                        ? 'border-neon-purple bg-white/5 shadow-neon-purple/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div
                      className="w-full h-10 rounded-lg mb-2 relative overflow-hidden"
                      style={{ backgroundColor: theme.background }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent || theme.foreground }} />
                        <div className="w-4 h-1 rounded" style={{ backgroundColor: theme.foreground, opacity: 0.6 }} />
                        <div className="w-3 h-1 rounded" style={{ backgroundColor: theme.foreground, opacity: 0.3 }} />
                      </div>
                      <div
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm"
                        style={{ backgroundColor: theme.foreground }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 block truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UI Theme Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                UI Theme Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {uiThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id, themeColor: theme.color })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.theme === theme.id
                        ? 'border-neon-purple bg-white/5 shadow-neon-purple/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg mb-2 shadow-lg"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-xs text-gray-400">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Font Size</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  value={formData.fontSize || 14}
                  onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) })}
                  min={10}
                  max={24}
                />
                <span className="text-sm text-white w-8 font-mono">{formData.fontSize || 14}px</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Font Family</label>
              <CustomSelect
                value={formData.fontFamily || 'Consolas, monospace'}
                onChange={(value) => setFormData({ ...formData, fontFamily: value })}
                options={fontFamilyOptions}
              />
            </div>

            {/* Font Weight */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Font Weight</label>
              <CustomSelect
                value={formData.fontWeight || 'normal'}
                onChange={(value) => setFormData({ ...formData, fontWeight: value })}
                options={fontWeightOptions}
              />
            </div>

            {/* Cursor Style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Cursor Style</label>
              <CustomSelect
                value={formData.cursorStyle || 'block'}
                onChange={(value) => setFormData({ ...formData, cursorStyle: value })}
                options={cursorStyleOptions}
              />
            </div>

            {/* Cursor Blink */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.cursorBlink !== false}
                  onChange={(e) => setFormData({ ...formData, cursorBlink: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/50 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Cursor Blink</span>
              </label>
            </div>

            {/* Default Shell */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Default Shell
              </label>
              {availableShells.length > 0 ? (
                <div className="relative">
                  <select
                    value={formData.defaultShell || ''}
                    onChange={(e) => setFormData({ ...formData, defaultShell: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-purple/50 appearance-none cursor-pointer"
                    style={{ color: '#fff' }}
                  >
                    <option value="" style={{ background: '#1a1a2e', color: '#9ca3af' }}>Auto-detect (System Default)</option>
                    {availableShells.map((shell) => (
                      <option key={shell.path} value={shell.path} style={{ background: '#1a1a2e', color: '#fff' }}>
                        {shell.name} ({shell.path})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 py-2">Loading available shells...</div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Choose the default shell for new local terminals. The system will detect available shells automatically.
              </p>
            </div>

            {/* Scrollback Buffer */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Scrollback Buffer</label>
              <CustomSelect
                value={formData.scrollback || 10000}
                onChange={(value) => setFormData({ ...formData, scrollback: value })}
                options={scrollbackOptions}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-lg hover:shadow-neon-purple/30 text-white rounded-xl transition-all font-medium">
                Save Changes
              </button>
              <button type="button" onClick={onClose} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20">
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
