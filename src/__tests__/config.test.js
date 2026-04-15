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

  it('deve ter a seção "groq" configurada', () => {
    expect(CONFIG).toHaveProperty('groq');
    expect(CONFIG.groq).toHaveProperty('apiKey');
    expect(CONFIG.groq).toHaveProperty('model');
    expect(typeof CONFIG.groq.model).toBe('string');
  });

  it('deve ter a seção "serviceNow" com instância e endpoint', () => {
    expect(CONFIG).toHaveProperty('serviceNow');
    expect(CONFIG.serviceNow).toHaveProperty('instance');
    expect(CONFIG.serviceNow).toHaveProperty('endpoint');
    expect(CONFIG.serviceNow).toHaveProperty('user');
    expect(CONFIG.serviceNow).toHaveProperty('password');
    expect(CONFIG.serviceNow.endpoint).toContain('/api/');
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
