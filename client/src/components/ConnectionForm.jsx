import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

function ConnectionForm({ connection, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    authType: 'password',
    password: '',
    privateKey: ''
  });
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        host: connection.host || '',
        port: connection.port || 22,
        username: connection.username || '',
        authType: connection.authType || 'password',
        password: '',
        privateKey: ''
      });
    }
  }, [connection]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.username) {
      setTestStatus({ success: false, message: 'Host and username are required' });
      return;
    }

    setTesting(true);
    setTestStatus(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/test-ssh`, {
        host: formData.host,
        port: formData.port,
        username: formData.username,
        authType: formData.authType,
        password: formData.password,
        privateKey: formData.privateKey
      });

      setTestStatus({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestStatus({
        success: false,
        message: error.response?.data?.error || error.message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-900 rounded-lg w-full max-w-md border border-dark-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <h3 className="text-lg font-semibold">
            {connection ? 'Edit Connection' : 'New Connection'}
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
                placeholder="My Server"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Host</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                placeholder="192.168.1.1 or example.com"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm text-dark-400 mb-1">Port</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-dark-400 mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-dark-400 mb-1">Authentication Type</label>
              <select
                className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
              >
                <option value="password">Password</option>
                <option value="key">SSH Key</option>
              </select>
            </div>

            {formData.authType === 'password' ? (
              <div className="mb-3">
                <label className="block text-sm text-dark-400 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600"
                  placeholder={connection ? '(unchanged)' : 'Password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            ) : (
              <div className="mb-3">
                <label className="block text-sm text-dark-400 mb-1">Private Key</label>
                <textarea
                  className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded text-dark-200 focus:outline-none focus:border-blue-600 font-mono text-xs"
                  rows={5}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  value={formData.privateKey}
                  onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                />
              </div>
            )}

            {/* Test Result */}
            {testStatus && (
              <div
                className={`px-3 py-2 rounded mb-3 text-sm ${
                  testStatus.success
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'
                }`}
              >
                {testStatus.message}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test'}
              </button>
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

export default ConnectionForm;
