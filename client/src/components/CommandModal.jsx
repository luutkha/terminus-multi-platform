import { useState, useEffect } from 'react';
import { useStore } from '../store';

function CommandModal({ command, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    description: '',
    category: 'General',
    enabled: true
  });

  useEffect(() => {
    if (command) {
      setFormData({
        name: command.name || '',
        command: command.command || '',
        description: command.description || '',
        category: command.category || 'General',
        enabled: command.enabled !== false
      });
    }
  }, [command]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-900 rounded-lg w-full max-w-md border border-dark-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100">
            {command ? 'Edit Command' : 'New Command'}
          </h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                placeholder="System Info"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Command</label>
              <textarea
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600 font-mono text-sm"
                rows={3}
                placeholder="uname -a && uptime"
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Description</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                placeholder="Show system information"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="System">System</option>
                <option value="Network">Network</option>
                <option value="Service">Service</option>
                <option value="Docker">Docker</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-950 text-blue-600"
                />
                <span className="text-sm text-dark-300">Enabled</span>
              </label>
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

export default CommandModal;
