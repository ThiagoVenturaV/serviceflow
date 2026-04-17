// ─── Testes: ChatPage.jsx ───────────────────────────────────────────────────
// Testa a renderização do dashboard, navegação entre abas,
// interações do chat e o portal de entrada.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '../ChatPage.jsx';

// Mock dos serviços
vi.mock('../../services/groqService.js', () => ({
  sendMessage: vi.fn().mockResolvedValue('Olá! Como posso ajudar?'),
  extractCollectedData: vi.fn().mockReturnValue(null),
  cleanMessageText: vi.fn((text) => text),
}));

vi.mock('../../services/serviceNowService.js', () => ({
  createTicket: vi.fn().mockResolvedValue({ protocolo: 'SF-2026-TEST' }),
}));

describe('ChatPage', () => {
  let onBack;

  beforeEach(() => {
    onBack = vi.fn();
    vi.clearAllMocks();
  });

  // ── Renderização ────────────────────────────────────────────────────────
  describe('Renderização', () => {
    it('deve renderizar o layout de dashboard', () => {
      render(<ChatPage onBack={onBack} />);
      // Sidebar com nome da marca
      expect(screen.getAllByText('ServiceFlow').length).toBeGreaterThan(0);
    });

    it('deve exibir o portal de entrada por padrão (aba overview)', () => {
      render(<ChatPage onBack={onBack} />);
      expect(screen.getByText(/Precisa de ajuda com um pedido/)).toBeInTheDocument();
    });

    it('deve renderizar as ações rápidas do portal', () => {
      render(<ChatPage onBack={onBack} />);
      expect(screen.getByText('Problema com produto')).toBeInTheDocument();
      expect(screen.getByText('Solicitar troca')).toBeInTheDocument();
      expect(screen.getByText('Solicitar reembolso')).toBeInTheDocument();
      expect(screen.getByText('Acompanhar protocolo')).toBeInTheDocument();
    });

    it('deve renderizar a sidebar com itens de navegação', () => {
      render(<ChatPage onBack={onBack} />);
      // Itens aparecem na sidebar E na bottom nav mobile
      expect(screen.getAllByText('Visão Geral').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Assistente de IA/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Meus Casos').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Navegação entre abas ────────────────────────────────────────────────
  describe('Navegação de Abas', () => {
    it('deve alternar para a aba de chat ao clicar em "Assistente de IA"', () => {
      render(<ChatPage onBack={onBack} />);

      // Clica no item da sidebar (pode haver duplicata na bottom nav)
      const chatButtons = screen.getAllByText('Assistente de IA');
      fireEvent.click(chatButtons[0]);

      // Deve mostrar o header do chat com nome da IA
      expect(screen.getByText('Sofia')).toBeInTheDocument();
    });

    it('deve mostrar mensagem inicial da IA no chat', () => {
      render(<ChatPage onBack={onBack} />);

      // Navega para o chat
      const chatButtons = screen.getAllByText('Assistente de IA');
      fireEvent.click(chatButtons[0]);

      expect(screen.getByText(/Sou Sofia/)).toBeInTheDocument();
    });
  });

  // ── Botão Sair ──────────────────────────────────────────────────────────
  describe('Botão Sair', () => {
    it('deve chamar onBack ao clicar no botão Sair da sidebar', () => {
      render(<ChatPage onBack={onBack} />);

      // O botão Sair na sidebar
      const sairButtons = screen.getAllByText('Sair');
      fireEvent.click(sairButtons[0]);

      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  // ── Portal: ações rápidas ──────────────────────────────────────────────
  describe('Ações Rápidas do Portal', () => {
    it('deve navegar para o chat ao clicar em "Problema com produto"', () => {
      render(<ChatPage onBack={onBack} />);

      const btn = screen.getByText('Problema com produto').closest('button');
      fireEvent.click(btn);

      // Deve ter mudado para a aba de chat
      expect(screen.getByText('Sofia')).toBeInTheDocument();
    });
  });

  // ── Chat: Input ─────────────────────────────────────────────────────────
  describe('Chat Input', () => {
    it('o botão enviar deve estar desabilitado com input vazio', () => {
      render(<ChatPage onBack={onBack} />);

      // Navega para o chat
      const chatButtons = screen.getAllByText('Assistente de IA');
      fireEvent.click(chatButtons[0]);

      const sendBtn = document.getElementById('send-btn');
      expect(sendBtn).toBeDisabled();
    });

    it('deve habilitar o botão enviar quando há texto', async () => {
      const user = userEvent.setup();
      render(<ChatPage onBack={onBack} />);

      // Navega para o chat
      const chatButtons = screen.getAllByText('Assistente de IA');
      fireEvent.click(chatButtons[0]);

      const input = document.getElementById('chat-input');
      await user.type(input, 'teste');

      const sendBtn = document.getElementById('send-btn');
      expect(sendBtn).not.toBeDisabled();
    });
  });

  // ── Mobile Bottom Nav ──────────────────────────────────────────────────
  describe('Mobile Bottom Nav', () => {
    it('deve renderizar a barra de navegação mobile', () => {
      render(<ChatPage onBack={onBack} />);
      // Verifica que existem itens de navegação na bottom nav mobile
      const chatNavItems = screen.getAllByText('Chat');
      expect(chatNavItems.length).toBeGreaterThan(0);
    });
  });
});
