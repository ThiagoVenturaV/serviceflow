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

  // Recupera e aplica configurações de tema/marca ao iniciar
  useEffect(() => {
    const root = document.documentElement;

    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `${r},${g},${b}`;
    };

    try {
      const storedBrand = localStorage.getItem('sf_brand_config');
      if (storedBrand) {
        const brand = JSON.parse(storedBrand);
        root.style.setProperty('--primary', brand.primary);
        root.style.setProperty('--primary-dim', brand.primary + 'cc');
        root.style.setProperty('--primary-rgb', hexToRgb(brand.primary));
        root.style.setProperty('--tertiary', brand.secondary);
        root.style.setProperty('--tertiary-rgb', hexToRgb(brand.secondary));

        if (brand.colorMode === 'light') {
          root.classList.add('light-theme');
          root.classList.remove('dark-theme');
        } else {
          root.classList.add('dark-theme');
          root.classList.remove('light-theme');
        }
        return;
      }
    } catch {}

    // Fallback: usar preferência do dispositivo
    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (systemPrefersLight) {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      const storedBrand = localStorage.getItem('sf_brand_config');
      if (storedBrand) return; // Não sobrescreve se houver config salva
      if (e.matches) {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      } else {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
      <div className="grain-overlay" aria-hidden="true" />
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
          onNavigate={navigateTo}
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
