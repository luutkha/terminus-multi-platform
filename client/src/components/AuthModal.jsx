import { useEffect } from 'react';

function AuthModal({ onAuth, error }) {
  useEffect(() => {
    // Auto-connect on mount (no password required)
    onAuth('any');
  }, [onAuth]);

  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center">
      <div className="bg-dark-900 p-8 rounded-lg border border-dark-700 w-80">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Terminus</h2>
        <p className="text-dark-400 text-center text-sm mb-4">Connecting...</p>
        {error && (
          <p className="text-red-400 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
