import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ChatPage from './pages/ChatPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfUsePage from './pages/TermsOfUsePage.jsx';
import './App.css';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'chat' | 'privacy' | 'terms'

  const navigateTo = (target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-root">
      {page === 'landing' ? (
        <LandingPage
          onStartChat={() => navigateTo('chat')}
          onNavigate={navigateTo}
        />
      ) : page === 'chat' ? (
        <div className="chat-container">
          <ChatPage onBack={() => navigateTo('landing')} />
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
