// ─── Testes: config.js ──────────────────────────────────────────────────────
// Valida que o objeto CONFIG tem a estrutura esperada,
// prevenindo quebras quando alguém modifica a configuração.

import { describe, it, expect } from 'vitest';
import { CONFIG } from '../config.js';

describe('CONFIG', () => {
  it('deve ter a seção "brand" com todas as chaves obrigatórias', () => {
    expect(CONFIG).toHaveProperty('brand');
    expect(CONFIG.brand).toHaveProperty('name');
    expect(CONFIG.brand).toHaveProperty('aiName');
    expect(CONFIG.brand).toHaveProperty('primaryColor');
    expect(typeof CONFIG.brand.name).toBe('string');
    expect(typeof CONFIG.brand.aiName).toBe('string');
  });

  it('deve ter a seção "api" configurada com os endpoints locais', () => {
    expect(CONFIG).toHaveProperty('api');
    expect(CONFIG.api).toHaveProperty('chat');
    expect(CONFIG.api).toHaveProperty('chamados');
    expect(CONFIG.api.chat).toBe('/api/chat');
    expect(CONFIG.api.chamados).toBe('/api/chamados');
  });

  it('o brand.name não deve estar vazio', () => {
    expect(CONFIG.brand.name.trim().length).toBeGreaterThan(0);
  });

  it('o aiName não deve estar vazio', () => {
    expect(CONFIG.brand.aiName.trim().length).toBeGreaterThan(0);
  });

  it('primaryColor deve ser um hexadecimal válido', () => {
    expect(CONFIG.brand.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
