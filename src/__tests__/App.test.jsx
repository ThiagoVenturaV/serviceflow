// ─── Testes: App.jsx ────────────────────────────────────────────────────────
// Testa a navegação principal entre LandingPage e ChatPage,
// garantindo que o state de "page" funciona corretamente.

import { describe, it, expect, vi } from 'vitest';
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
  it('deve renderizar a LandingPage por padrão', () => {
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-page')).not.toBeInTheDocument();
  });

  it('deve navegar para o ChatPage ao clicar "Iniciar Chat"', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('start-chat-btn'));

    expect(screen.getByTestId('chat-page')).toBeInTheDocument();
    expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
  });

  it('deve voltar para a LandingPage ao clicar "Voltar"', () => {
    render(<App />);

    // Navega para o chat
    fireEvent.click(screen.getByTestId('start-chat-btn'));
    expect(screen.getByTestId('chat-page')).toBeInTheDocument();

    // Volta para landing
    fireEvent.click(screen.getByTestId('back-btn'));
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-page')).not.toBeInTheDocument();
  });
});
