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
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#12121a] rounded-xl w-full max-w-md border border-white/10 shadow-2xl shadow-neon-cyan/10 animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {connection ? 'Edit Connection' : 'New Connection'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input
                type="text"
                className="input-neon w-full"
                placeholder="My Server"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Host</label>
              <input
                type="text"
                className="input-neon w-full"
                placeholder="192.168.1.1 or example.com"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 mb-4">
              <div className="w-24">
                <label className="block text-sm text-gray-400 mb-2">Port</label>
                <input
                  type="number"
                  className="input-neon w-full text-center"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  className="input-neon w-full"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Authentication Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, authType: 'password' })}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    formData.authType === 'password'
                      ? 'border-neon-cyan bg-neon-cyan/10 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, authType: 'key' })}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    formData.authType === 'key'
                      ? 'border-neon-cyan bg-neon-cyan/10 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  SSH Key
                </button>
              </div>
            </div>

            {formData.authType === 'password' ? (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  className="input-neon w-full"
                  placeholder={connection ? '(unchanged)' : 'Password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Private Key</label>
                <textarea
                  className="input-neon w-full font-mono text-xs h-28 resize-none"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  value={formData.privateKey}
                  onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                />
              </div>
            )}

            {/* Test Result */}
            {testStatus && (
              <div
                className={`px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                    : 'bg-neon-red/10 border border-neon-red/30 text-neon-red'
                }`}
              >
                {testStatus.success ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {testStatus.message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Test
                  </>
                )}
              </button>
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue hover:shadow-lg hover:shadow-neon-cyan/30 text-white rounded-xl transition-all font-medium">
                Save
              </button>
              <button type="button" onClick={onClose} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20">
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
