import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chamadosHandler from '../../api/chamados.js';
import meusChamadosHandler from '../../api/meus_chamados.js';

// Setup global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Response Helper
function createMockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Warranty Flow Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    
    // Setup environment variables so ServiceNow fetch runs
    process.env.SERVICENOW_INSTANCE = 'https://dev284468.service-now.com';
    process.env.SERVICENOW_USER = 'admin';
    process.env.SERVICENOW_PASSWORD = 'password';
  });

  afterEach(() => {
    delete process.env.SERVICENOW_INSTANCE;
    delete process.env.SERVICENOW_USER;
    delete process.env.SERVICENOW_PASSWORD;
  });

  describe('api/chamados.js (Creation/Write)', () => {
    it('should append serial number and invoice to description for Garantia tickets', async () => {
      const req = {
        method: 'POST',
        body: {
          nome: 'Test Client',
          email: 'test@email.com',
          numero_pedido: '#12345',
          produto: 'Test Product',
          tipo: 'Garantia',
          descricao: 'It stopped working',
          numero_serie: 'SN-WARRANTY-123',
          nota_fiscal: 'NF-98765'
        }
      };
      
      const res = createMockRes();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ protocolo: 'SF-10020' })
      });

      await chamadosHandler(req, res);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      
      expect(url).toContain('/api/x_2014456_servicef/chamados');
      expect(options.method).toBe('POST');
      
      const body = JSON.parse(options.body);
      expect(body.tipo).toBe('Garantia');
      expect(body.descricao).toBe(
        'It stopped working\n\n--- Detalhes da Garantia ---\nNúmero de Série: SN-WARRANTY-123\nNota Fiscal: NF-98765'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should NOT append warranty details for non-Garantia tickets', async () => {
      const req = {
        method: 'POST',
        body: {
          nome: 'Test Client',
          email: 'test@email.com',
          numero_pedido: '#12345',
          produto: 'Test Product',
          tipo: 'Troca',
          descricao: 'Wrong size',
          numero_serie: 'SN-123',
          nota_fiscal: 'NF-456'
        }
      };
      
      const res = createMockRes();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ protocolo: 'SF-10021' })
      });

      await chamadosHandler(req, res);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.tipo).toBe('Troca');
      expect(body.descricao).toBe('Wrong size'); // remains unchanged
    });
  });

  describe('api/meus_chamados.js (Retrieval/Read)', () => {
    it('should parse serial number and invoice from description for Garantia tickets', async () => {
      const req = {
        method: 'GET',
        query: { email: 'test@email.com' }
      };
      
      const res = createMockRes();
      
      const rawServiceNowResponse = {
        result: [
          {
            protocolo: 'SF-10020',
            nome_do_cliente: 'Test Client',
            email_do_cliente: 'test@email.com',
            produto: 'Test Product',
            tipo: 'Garantia',
            descricao: 'It stopped working\n\n--- Detalhes da Garantia ---\nNúmero de Série: SN-WARRANTY-123\nNota Fiscal: NF-98765'
          },
          {
            protocolo: 'SF-10021',
            nome_do_cliente: 'Test Client',
            email_do_cliente: 'test@email.com',
            produto: 'Test Product 2',
            tipo: 'Troca',
            descricao: 'Wrong size'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => rawServiceNowResponse
      });

      await meusChamadosHandler(req, res);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      
      const returnedBody = res.json.mock.calls[0][0];
      
      // Ticket 0: Garantia (should be parsed and cleaned)
      const ticket0 = returnedBody.result[0];
      expect(ticket0.numero_serie).toBe('SN-WARRANTY-123');
      expect(ticket0.nota_fiscal).toBe('NF-98765');
      expect(ticket0.descricao).toBe('It stopped working');
      
      // Ticket 1: Troca (should not be touched)
      const ticket1 = returnedBody.result[1];
      expect(ticket1.numero_serie).toBeUndefined();
      expect(ticket1.nota_fiscal).toBeUndefined();
      expect(ticket1.descricao).toBe('Wrong size');
    });
  });
});
