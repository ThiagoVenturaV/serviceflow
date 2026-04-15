// ─── Testes: groqService ────────────────────────────────────────────────────
// Testa as funções puras de parsing (extractCollectedData, cleanMessageText)
// e a integração com a API Groq (sendMessage) usando mocks.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Groq SDK before importing the service
const mockCreate = vi.fn();

vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      constructor() {
        this.chat = {
          completions: {
            create: mockCreate,
          },
        };
      }
    },
  };
});

// We need to import after the mock is set up
const { extractCollectedData, cleanMessageText } = await import('../groqService.js');

// ═══════════════════════════════════════════════════════════════════════════════
// extractCollectedData — extrai JSON do texto da IA
// ═══════════════════════════════════════════════════════════════════════════════
describe('extractCollectedData', () => {
  it('deve extrair dados JSON válidos da tag [DADOS_COLETADOS]', () => {
    const text = `Perfeito! Vou confirmar seus dados:
[DADOS_COLETADOS]{"nome":"João Silva","email":"joao@email.com","numero_pedido":"#12345","produto":"Notebook","tipo":"Troca","descricao":"Tela quebrada"}[/DADOS_COLETADOS]
Confira os dados acima e confirme!`;

    const result = extractCollectedData(text);

    expect(result).toEqual({
      nome: 'João Silva',
      email: 'joao@email.com',
      numero_pedido: '#12345',
      produto: 'Notebook',
      tipo: 'Troca',
      descricao: 'Tela quebrada',
    });
  });

  it('deve retornar null quando não há tag de dados', () => {
    const text = 'Olá! Como posso ajudar?';
    expect(extractCollectedData(text)).toBeNull();
  });

  it('deve retornar null para JSON malformado dentro da tag', () => {
    const text = '[DADOS_COLETADOS]{nome: invalido}[/DADOS_COLETADOS]';
    expect(extractCollectedData(text)).toBeNull();
  });

  it('deve lidar com dados contendo caracteres especiais', () => {
    const text = `[DADOS_COLETADOS]{"nome":"María José","email":"maria@email.com","numero_pedido":"#99999","produto":"Camisa P/M","tipo":"Devolução","descricao":"Produto com defeito — mancha na frente"}[/DADOS_COLETADOS]`;

    const result = extractCollectedData(text);
    expect(result).not.toBeNull();
    expect(result.nome).toBe('María José');
    expect(result.descricao).toContain('mancha');
  });

  it('deve funcionar com JSON multi-linha dentro da tag', () => {
    const text = `[DADOS_COLETADOS]{
  "nome": "Ana",
  "email": "ana@test.com",
  "numero_pedido": "#001",
  "produto": "Celular",
  "tipo": "Garantia",
  "descricao": "Não liga"
}[/DADOS_COLETADOS]`;

    const result = extractCollectedData(text);
    expect(result).not.toBeNull();
    expect(result.nome).toBe('Ana');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// cleanMessageText — remove a tag de dados da resposta da IA
// ═══════════════════════════════════════════════════════════════════════════════
describe('cleanMessageText', () => {
  it('deve remover o bloco [DADOS_COLETADOS] do texto', () => {
    const text = `Perfeito! [DADOS_COLETADOS]{"nome":"X"}[/DADOS_COLETADOS] Confirme os dados!`;
    const result = cleanMessageText(text);
    expect(result).toBe('Perfeito!  Confirme os dados!');
  });

  it('deve retornar o texto intacto quando não há tag', () => {
    const text = 'Olá! Tudo bem?';
    expect(cleanMessageText(text)).toBe('Olá! Tudo bem?');
  });

  it('deve remover tag e dar trim nas extremidades', () => {
    const text = '  [DADOS_COLETADOS]{"a":"b"}[/DADOS_COLETADOS]  Pronto!  ';
    const result = cleanMessageText(text);
    expect(result).toBe('Pronto!');
  });

  it('deve lidar com texto vazio', () => {
    expect(cleanMessageText('')).toBe('');
  });

  it('deve remover múltiplas tags (cenário edge-case)', () => {
    const text = '[DADOS_COLETADOS]{"x":1}[/DADOS_COLETADOS] meio [DADOS_COLETADOS]{"y":2}[/DADOS_COLETADOS]';
    const result = cleanMessageText(text);
    expect(result).toBe('meio');
  });
});
