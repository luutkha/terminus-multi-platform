import { useEffect, useState } from 'react';

function AuthModal({ onAuth, error }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Auto-connect on mount (no password required)
    onAuth('any');

    // Animate dots
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);

    return () => clearInterval(interval);
  }, [onAuth]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 text-center animate-scale-in">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan p-[2px]">
            <div className="w-full h-full bg-[#0a0a0f] rounded-2xl flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
                T
              </span>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan blur-xl opacity-50 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
            TERMINUS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 mb-8 text-sm font-medium tracking-wider uppercase">
          Next-Gen Terminal Manager
        </p>

        {/* Loading state */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-gray-400 text-sm font-medium">
            Connecting<span className="inline-block w-12 text-left">{dots}</span>
          </p>
        </div>

        {error && (
          <div className="mt-6 px-4 py-2 bg-neon-red/20 border border-neon-red/30 rounded-lg">
            <p className="text-neon-red text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
