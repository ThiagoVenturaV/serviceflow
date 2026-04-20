// ─── Testes: serviceNowService ──────────────────────────────────────────────
// Testa a função createTicket com mocks de fetch,
// cobrindo cenários de sucesso e erro na API ServiceNow.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTicket } from '../serviceNowService.js';

// ── Mock global fetch ───────────────────────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Dados de teste padrão
const MOCK_TICKET_DATA = {
  nome: 'Thiago Ventura',
  email: 'thiago@email.com',
  numero_pedido: '#54321',
  produto: 'Monitor 27"',
  tipo: 'Troca',
  descricao: 'Pixel morto no centro da tela',
  foto: 'https://exemplo.com/foto.jpg',
  nps: '10',
};

describe('createTicket', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('deve enviar POST com os dados corretos e retornar resultado', async () => {
    const mockResponse = { protocolo: 'SF-2026-00123' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createTicket(MOCK_TICKET_DATA);

    // Verifica que fetch foi chamado corretamente
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    // URL e método
    expect(url).toBe('/api/chamados');
    expect(options.method).toBe('POST');

    // Headers
    expect(options.headers['Content-Type']).toBe('application/json');
    // Auth is no longer on the frontend!
    expect(options.headers['Authorization']).toBeUndefined();

    // Body
    const body = JSON.parse(options.body);
    expect(body.nome).toBe(MOCK_TICKET_DATA.nome);
    expect(body.email).toBe(MOCK_TICKET_DATA.email);
    expect(body.numero_pedido).toBe(MOCK_TICKET_DATA.numero_pedido);
    expect(body.produto).toBe(MOCK_TICKET_DATA.produto);
    expect(body.tipo).toBe(MOCK_TICKET_DATA.tipo);
    expect(body.descricao).toBe(MOCK_TICKET_DATA.descricao);
    expect(body.foto).toBe(MOCK_TICKET_DATA.foto);
    expect(body.nps).toBe(MOCK_TICKET_DATA.nps);

    // Resultado
    expect(result).toEqual(mockResponse);
    expect(result.protocolo).toBe('SF-2026-00123');
  });

  it('deve lançar erro devolvido pelo nosso servidor Vercel API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'ServiceNow error 500' }),
    });

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('ServiceNow error 500');
  });

  it('deve lançar erro de servidor genérico se a resposta não tiver json de erro', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => { throw new Error('not json'); },
    });

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('Erro interno no servidor: 401');
  });

  it('deve lançar erro quando fetch rejeita (rede)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('Network error');
  });
});
