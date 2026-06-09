// ─── Testes: App.jsx ────────────────────────────────────────────────────────
// Testa a navegação principal entre LandingPage, LoginPage e ChatPage,
// garantindo que o state de "page" funciona corretamente.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App.jsx';

// Mock das páginas para isolar o teste do App
vi.mock('../pages/LandingPage.jsx', () => ({
  default: ({ onStartChat }) => (
    <div data-testid="landing-page">
      <button data-testid="start-chat-btn" onClick={onStartChat}>
        Iniciar Chat
      </button>
    </div>
  ),
}));

vi.mock('../pages/LoginPage.jsx', () => ({
  default: ({ onLogin }) => (
    <div data-testid="login-page">
      <button data-testid="login-btn" onClick={() => onLogin({ email: 'test@email.com' })}>
        Login
      </button>
    </div>
  ),
}));

vi.mock('../pages/ChatPage.jsx', () => ({
  default: ({ onBack }) => (
    <div data-testid="chat-page">
      <button data-testid="back-btn" onClick={onBack}>
        Voltar
      </button>
    </div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar a LandingPage por padrão', () => {
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-page')).not.toBeInTheDocument();
  });

  it('deve navegar para o LoginPage ao clicar "Iniciar Chat", e depois para o ChatPage após login', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('start-chat-btn'));
    expect(screen.getByTestId('login-page')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('login-btn'));
    expect(screen.getByTestId('chat-page')).toBeInTheDocument();
    expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
  });

  it('deve voltar para a LandingPage ao clicar "Voltar" a partir do ChatPage', () => {
    render(<App />);

    // Navega para o login
    fireEvent.click(screen.getByTestId('start-chat-btn'));
    // Faz login
    fireEvent.click(screen.getByTestId('login-btn'));
    expect(screen.getByTestId('chat-page')).toBeInTheDocument();

    // Volta para landing (logout)
    fireEvent.click(screen.getByTestId('back-btn'));
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-page')).not.toBeInTheDocument();
  });
});
