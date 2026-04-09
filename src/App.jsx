import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ChatPage from './pages/ChatPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import './App.css';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'chat'

  return (
    <div className="app-root">
      {page === 'landing' ? (
        <LandingPage onStartChat={() => setPage('chat')} />
      ) : (
        <div className="chat-container">
          <ChatPage onBack={() => setPage('landing')} />
        </div>
      )}
      <SpeedInsights />
    </div>
  );
}
