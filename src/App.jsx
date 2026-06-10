import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ChatPage from './pages/ChatPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfUsePage from './pages/TermsOfUsePage.jsx';
import { CONFIG } from './config.js';
import './App.css';

const SESSION_KEY = 'sf_user';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'chat' | 'privacy' | 'terms'
  const [user, setUser] = useState(null); // { email, chamados[] }

  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  // Controle de Consentimento de Cookies
  useEffect(() => {
    try {
      const consent = localStorage.getItem('sf_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setShowCookieConsent(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleCookieConsent = (accepted) => {
    try {
      localStorage.setItem('sf_cookie_consent', accepted ? 'accepted' : 'declined');
    } catch {}
    setShowCookieConsent(false);
  };

  // Ouvinte do PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      try {
        const dismissed = sessionStorage.getItem('sf_pwa_dismissed');
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      } catch {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Detector de PWA no iOS (iPhone/iPad)
  useEffect(() => {
    try {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      const isStandalone = window.navigator.standalone === true || 
                           window.matchMedia('(display-mode: standalone)').matches;
      
      if (isIOS && !isStandalone) {
        const dismissed = sessionStorage.getItem('sf_pwa_dismissed_ios');
        if (!dismissed) {
          const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    } catch {}
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Escolha do PWA: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissPWA = () => {
    try {
      sessionStorage.setItem('sf_pwa_dismissed', 'true');
    } catch {}
    setShowInstallPrompt(false);
  };

  // Recupera sessão do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch { /* ignora */ }
  }, []);

  const [brand, setBrand] = useState(() => {
    const defaultBrand = {
      primary: '#8B5CF6',
      secondary: '#e8e8e8ff',
      aiName: 'Sofia',
      colorMode: 'dark',
      logoUrl: ''
    };
    try {
      const stored = localStorage.getItem('sf_brand_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Mescla com os padrões para garantir que todas as propriedades existam
        return { ...defaultBrand, ...parsed };
      }
    } catch {}
    try {
      const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      return {
        ...defaultBrand,
        colorMode: systemPrefersLight ? 'light' : 'dark',
      };
    } catch {
      return defaultBrand;
    }
  });

  // Busca o branding real do ServiceNow na montagem do app
  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch('/api/branding');
        if (response.ok) {
          const data = await response.json();
          setBrand(prev => {
            const updated = {
              ...prev,
              primary: data.primaryColor || prev.primary || '#8B5CF6',
              aiName: data.aiName || prev.aiName || 'Sofia',
              logoUrl: data.logoUrl || prev.logoUrl || ''
            };
            return updated;
          });
        }
      } catch (err) {
        console.warn('Falha ao carregar branding do ServiceNow:', err);
      }
    }
    loadBranding();
  }, []);

  // Aplica configurações de tema/marca sempre que o estado "brand" mudar
  useEffect(() => {
    const root = document.documentElement;

    const hexToRgb = (hex) => {
      if (!hex || typeof hex !== 'string') return '139,92,246'; // Fallback roxo
      try {
        const h = hex.replace('#', '');
        if (h.length !== 6 && h.length !== 8) return '139,92,246';
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return '139,92,246';
        return `${r},${g},${b}`;
      } catch (err) {
        return '139,92,246'; // Fallback roxo
      }
    };

    const primary = brand?.primary || '#8B5CF6';
    const secondary = brand?.secondary || '#e8e8e8ff';

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-dim', primary + 'cc');
    root.style.setProperty('--primary-rgb', hexToRgb(primary));
    root.style.setProperty('--tertiary', secondary);
    root.style.setProperty('--tertiary-rgb', hexToRgb(secondary));

    const colorMode = brand?.colorMode || 'dark';
    if (colorMode === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    // Sincroniza a CONFIG global estática para os componentes que a importam
    CONFIG.brand.aiName = brand?.aiName || 'Sofia';
    CONFIG.brand.primaryColor = primary;
    if (brand?.logoUrl) {
      CONFIG.brand.logo = brand.logoUrl;
    }

    try {
      localStorage.setItem('sf_brand_config', JSON.stringify(brand));
    } catch {}
  }, [brand]);

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
          brand={brand}
          setBrand={setBrand}
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

      {showCookieConsent && (
        <div className="cookie-banner" role="dialog" aria-label="Consentimento de Cookies">
          <div className="banner-content">
            <span className="material-symbols-outlined banner-icon">cookie</span>
            <div className="banner-text">
              <h4>Nós valorizamos sua privacidade</h4>
              <p>Utilizamos cookies essenciais para otimizar sua navegação e integrar suas solicitações com o ServiceNow de forma segura.</p>
            </div>
          </div>
          <div className="banner-actions">
            <button className="banner-btn-secondary" onClick={() => handleCookieConsent(false)}>Recusar</button>
            <button className="banner-btn-primary" onClick={() => handleCookieConsent(true)}>Aceitar Todos</button>
          </div>
        </div>
      )}

      {showInstallPrompt && deferredPrompt && (
        <div className="pwa-banner" role="dialog" aria-label="Instalar Aplicativo">
          <div className="banner-content">
            <span className="material-symbols-outlined banner-icon">install_mobile</span>
            <div className="banner-text">
              <h4>Instalar ServiceFlow</h4>
              <p>Adicione o portal à sua tela inicial para receber notificações em tempo real e ter uma experiência totalmente otimizada.</p>
            </div>
          </div>
          <div className="banner-actions">
            <button className="banner-btn-secondary" onClick={handleDismissPWA}>Agora não</button>
            <button className="banner-btn-primary" onClick={handleInstallPWA}>Instalar App</button>
          </div>
        </div>
      )}

      {showIOSPrompt && (
        <div className="pwa-banner ios-banner" role="dialog" aria-label="Instalar no iOS">
          <div className="banner-content">
            <span className="material-symbols-outlined banner-icon">ios_share</span>
            <div className="banner-text">
              <h4>Instalar no iPhone / iPad</h4>
              <p>
                Toque no botão de compartilhar <span className="material-symbols-outlined inline-icon" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>ios_share</span> na barra do Safari e selecione <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
          </div>
          <div className="banner-actions">
            <button className="banner-btn-primary" onClick={() => {
              try {
                sessionStorage.setItem('sf_pwa_dismissed_ios', 'true');
              } catch {}
              setShowIOSPrompt(false);
            }}>Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
}
