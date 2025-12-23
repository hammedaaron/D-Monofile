import React, { useEffect } from 'react';

interface SplashProps {
  onComplete: () => void;
}

const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <div className="animate-fade-in-up text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 text-gradient-animate">
          MONOFILE
        </h1>
        <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full mb-8 animate-pulse"></div>
        <p className="text-sm text-zinc-500 font-medium tracking-[0.3em] uppercase animate-pulse">
          Powered by HAMSTAR
        </p>
      </div>
    </div>
  );
};

export default Splash;