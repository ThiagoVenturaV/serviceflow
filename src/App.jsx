import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ChatPage from './pages/ChatPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfUsePage from './pages/TermsOfUsePage.jsx';
import './App.css';

const SESSION_KEY = 'sf_user';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'chat' | 'privacy' | 'terms'
  const [user, setUser] = useState(null); // { email, chamados[] }

  // Recupera sessão do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch { /* ignora */ }
  }, []);

  const navigateTo = (target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStartChat = () => {
    // Se já está logado, vai direto pro chat; senão, vai pro login
    if (user) {
      navigateTo('chat');
    } else {
      navigateTo('login');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    } catch { /* ignora */ }
    navigateTo('chat');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch { /* ignora */ }
    navigateTo('landing');
  };

  return (
    <div className="app-root">
      {page === 'landing' ? (
        <LandingPage
          onStartChat={handleStartChat}
          onNavigate={navigateTo}
        />
      ) : page === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onContinueAsGuest={() => {
            setUser(null);
            navigateTo('chat');
          }}
        />
      ) : page === 'chat' ? (
        <div className="chat-container">
          <ChatPage
            onBack={handleLogout}
            user={user}
          />
        </div>
      ) : page === 'privacy' ? (
        <PrivacyPolicyPage
          onBack={() => navigateTo('landing')}
          onNavigate={navigateTo}
        />
      ) : page === 'terms' ? (
        <TermsOfUsePage
          onBack={() => navigateTo('landing')}
          onNavigate={navigateTo}
        />
      ) : null}
      <SpeedInsights />
    </div>
  );
}
