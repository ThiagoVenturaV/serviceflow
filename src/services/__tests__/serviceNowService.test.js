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
    expect(url).toContain('service-now.com');
    expect(url).toContain('/api/serviceflow/chamados');
    expect(options.method).toBe('POST');

    // Headers
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['Authorization']).toMatch(/^Basic /);

    // Body
    const body = JSON.parse(options.body);
    expect(body.nome).toBe(MOCK_TICKET_DATA.nome);
    expect(body.email).toBe(MOCK_TICKET_DATA.email);
    expect(body.numero_pedido).toBe(MOCK_TICKET_DATA.numero_pedido);
    expect(body.produto).toBe(MOCK_TICKET_DATA.produto);
    expect(body.tipo).toBe(MOCK_TICKET_DATA.tipo);
    expect(body.descricao).toBe(MOCK_TICKET_DATA.descricao);

    // Resultado
    expect(result).toEqual(mockResponse);
    expect(result.protocolo).toBe('SF-2026-00123');
  });

  it('deve usar autenticação Basic (base64)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ protocolo: 'SF-TEST' }),
    });

    await createTicket(MOCK_TICKET_DATA);

    const [, options] = mockFetch.mock.calls[0];
    const authHeader = options.headers['Authorization'];

    // Deve ser "Basic <base64>"
    expect(authHeader).toMatch(/^Basic [A-Za-z0-9+/=]+$/);
  });

  it('deve lançar erro quando a API retorna status não-OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('ServiceNow error 500');
  });

  it('deve lançar erro quando a API retorna 401 (não autorizado)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('ServiceNow error 401');
  });

  it('deve lançar erro quando fetch rejeita (rede)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(createTicket(MOCK_TICKET_DATA)).rejects.toThrow('Network error');
  });
});
