// ─── Testes: Speech-to-Text no ChatPage ────────────────────────────────────
// Verifica que o botão de microfone aparece, inicia/para o reconhecimento
// e injeta o transcript corretamente no campo de texto.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChatPage from '../pages/ChatPage.jsx';

// ── Mocks de serviços externos ──────────────────────────────────────────────
vi.mock('../services/groqService.js', () => ({
  sendMessage: vi.fn().mockResolvedValue('Resposta mock da IA.'),
  extractCollectedData: vi.fn().mockReturnValue(null),
  cleanMessageText: vi.fn((t) => t),
}));

vi.mock('../services/serviceNowService.js', () => ({
  createTicket: vi.fn().mockResolvedValue({ protocolo: 'SF-TEST-001' }),
}));

// Helper: pega a instância mais recente criada pelo componente
const getRecognition = () => globalThis.MockSpeechRecognition._lastInstance;

describe('ChatPage – Speech-to-Text (microfone)', () => {
  beforeEach(() => {
    // Reset o ponteiro de instância antes de cada teste
    globalThis.MockSpeechRecognition._lastInstance = null;
  });

  it('deve renderizar o botão de microfone no portal (tab overview)', () => {
    render(<ChatPage onBack={vi.fn()} />);
    // Overview é a tab padrão — deve ter o mic no portal
    const micBtn = screen.getByTitle('Falar por voz');
    expect(micBtn).toBeInTheDocument();
  });

  it('deve renderizar o botão de microfone no chat (tab chat)', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    const micBtns = screen.getAllByTitle('Falar por voz');
    expect(micBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('deve chamar recognition.start() ao clicar no botão de microfone', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    const micBtn = screen.getAllByTitle('Falar por voz')[0];
    fireEvent.click(micBtn);

    const recognition = getRecognition();
    expect(recognition.start).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar título "Parar gravação" enquanto está ouvindo', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);

    expect(screen.getAllByTitle('Parar gravação').length).toBeGreaterThanOrEqual(1);
  });

  it('deve chamar recognition.stop() ao clicar novamente enquanto ouvindo', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    // Iniciar
    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);
    const recognition = getRecognition();

    // Parar
    fireEvent.click(screen.getAllByTitle('Parar gravação')[0]);

    expect(recognition.stop).toHaveBeenCalledTimes(1);
  });

  it('deve injetar o transcript no campo de texto após onresult', async () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    // Enviar algo antes para que messages.length seja > 1 e evitar o auto-send do useEffect
    const initialTextarea = document.getElementById('chat-input');
    fireEvent.change(initialTextarea, { target: { value: 'Iniciando chat' } });
    fireEvent.click(document.getElementById('send-btn'));

    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);
    const recognition = getRecognition();

    act(() => {
      recognition.onresult({
        results: [[{ transcript: 'meu produto chegou com defeito' }]],
      });
    });

    await vi.waitFor(() => {
      const textarea = document.getElementById('chat-input');
      expect(textarea.value).toBe('meu produto chegou com defeito');
    });
  });

  it('deve acrescentar ao texto existente se o textarea já tiver conteúdo', async () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    const textarea = document.getElementById('chat-input');
    // Para evitar auto-send, testamos que ao digitar com a tab chat aberta e message.length == 1
    // Wait, o auto-send também vai atirar no 'Olá,'.
    // Então vamos enviar primeiro para messages.length > 1.
    fireEvent.change(textarea, { target: { value: 'Pular' } });
    fireEvent.click(document.getElementById('send-btn'));

    // Agora digitamos "Olá,"
    fireEvent.change(textarea, { target: { value: 'Olá,' } });

    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);
    const recognition = getRecognition();

    act(() => {
      recognition.onresult({
        results: [[{ transcript: 'preciso de ajuda' }]],
      });
    });

    await vi.waitFor(() => {
      const textareaAfter = document.getElementById('chat-input');
      expect(textareaAfter.value).toBe('Olá, preciso de ajuda');
    });
  });

  it('deve voltar ao estado "não ouvindo" após o evento onend', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);
    const recognition = getRecognition();

    expect(screen.getAllByTitle('Parar gravação').length).toBeGreaterThanOrEqual(1);

    act(() => { recognition.onend(); });

    expect(screen.getAllByTitle('Falar por voz').length).toBeGreaterThanOrEqual(1);
  });

  it('deve voltar ao estado "não ouvindo" após um erro de reconhecimento', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const chatBtn = screen.getByText('Assistente de IA');
    fireEvent.click(chatBtn);

    fireEvent.click(screen.getAllByTitle('Falar por voz')[0]);
    const recognition = getRecognition();

    act(() => { recognition.onerror({ error: 'network' }); });

    expect(screen.getAllByTitle('Falar por voz').length).toBeGreaterThanOrEqual(1);
  });

  it('deve configurar o reconhecimento com lang pt-BR', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const recognition = getRecognition();
    expect(recognition.lang).toBe('pt-BR');
  });

  it('deve configurar continuous como false', () => {
    render(<ChatPage onBack={vi.fn()} />);
    const recognition = getRecognition();
    expect(recognition.continuous).toBe(false);
  });
});
