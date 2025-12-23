import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Splash from './pages/Splash';
import MonofileApp from './components/MonofileApp';
import HowItWorks from './pages/HowItWorks';

type Route = 'landing' | 'auth' | 'splash' | 'app' | 'how-it-works';

// 6 hours in milliseconds
const SESSION_DURATION = 6 * 60 * 60 * 1000; 

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>('landing');

  const performLogout = () => {
      localStorage.removeItem('monofile_auth_token');
      localStorage.removeItem('monofile_session'); 
      setRoute('landing');
  };
  
  // Check if user is already "logged in" for this session and validity
  useEffect(() => {
    const sessionRaw = localStorage.getItem('monofile_auth_token');
    
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        const now = Date.now();
        
        // Check structure and expiry
        // Backward compatibility: If session is just "true" (boolean) or missing expiry, treat as expired to force update
        if (session && typeof session === 'object' && session.expiry && now < session.expiry) {
           setRoute('app');
        } else {
           performLogout();
        }
      } catch (e) {
        // Invalid or corrupted session data
        performLogout();
      }
    }
  }, []);

  const handleAuthSuccess = () => {
    const sessionData = {
      authenticated: true,
      expiry: Date.now() + SESSION_DURATION
    };
    localStorage.setItem('monofile_auth_token', JSON.stringify(sessionData));
    setRoute('splash');
  };

  const handleSplashComplete = () => {
    setRoute('app');
  };
  
  const handleLogout = () => {
      performLogout();
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-indigo-500/30">
      {route === 'landing' && <Landing onNavigate={(r) => setRoute(r as Route)} />}
      
      {route === 'how-it-works' && <HowItWorks onNavigate={(r) => setRoute(r as Route)} />}

      {route === 'auth' && <Auth onSuccess={handleAuthSuccess} />}
      
      {route === 'splash' && <Splash onComplete={handleSplashComplete} />}
      
      {route === 'app' && (
          <div className="relative">
              <nav className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-center z-50 pointer-events-none">
                   <button 
                    onClick={() => setRoute('landing')}
                    className="pointer-events-auto text-xs font-medium text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-2 group"
                   >
                       <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                       Home
                   </button>
                   
                   <button 
                    onClick={handleLogout}
                    className="pointer-events-auto text-xs font-medium text-zinc-600 hover:text-red-400 transition-colors"
                   >
                       Sign Out
                   </button>
              </nav>
              <MonofileApp />
          </div>
      )}
    </div>
  );
};

export default App;