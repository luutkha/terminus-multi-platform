import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { useStore } from '../store';

function CommandModal({ command, onSave, onClose }) {
  const commandGroups = useStore(state => state.commandGroups);

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

  const defaultOptions = [
    { value: 'General', label: 'General' },
    { value: 'System', label: 'System' },
    { value: 'Network', label: 'Network' },
    { value: 'Service', label: 'Service' },
    { value: 'Docker', label: 'Docker' },
  ];

  const categoryOptions = [
    ...defaultOptions,
    ...commandGroups.map(g => ({ value: g.name, label: g.name }))
  ];

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#12121a] rounded-xl w-full max-w-md border border-white/10 shadow-2xl shadow-neon-pink/10 animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {command ? 'Edit Command' : 'New Command'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input
                type="text"
                className="input-neon w-full"
                placeholder="System Info"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Command (one per line)</label>
              <textarea
                className="input-neon w-full font-mono text-sm h-32 resize-none"
                placeholder={"cd /var/log\nls -la"}
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <input
                type="text"
                className="input-neon w-full"
                placeholder="Show system information"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <CustomSelect
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                options={categoryOptions}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-neon-pink focus:ring-neon-pink/50 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Enabled</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-lg hover:shadow-neon-pink/30 text-white rounded-xl transition-all font-medium">
                Save
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

export default CommandModal;
