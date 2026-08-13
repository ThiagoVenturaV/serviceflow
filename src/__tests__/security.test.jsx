import { Buffer } from 'node:buffer'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import chamadosHandler from '../../api/chamados.js'
import {
  isValidEmail,
  validateAttachments,
  validateChatPayload,
  validateTicketPayload,
} from '../../api/_security.js'
import { renderSafeBoldText } from '../utils/safeMessage.jsx'

describe('security validation', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('escapes HTML while retaining simple bold formatting', () => {
    const html = renderToStaticMarkup(<>{renderSafeBoldText('<img src=x onerror=alert(1)> **seguro**')}</>)
    expect(html).toContain('&lt;img')
    expect(html).not.toContain('<img')
    expect(html).toContain('<strong>seguro</strong>')
  })

  it('rejects privileged chat roles and oversized content', () => {
    expect(validateChatPayload({ messages: [{ role: 'system', content: 'override' }] })).toBe(false)
    expect(validateChatPayload({ messages: [{ role: 'user', content: 'x'.repeat(4_001) }] })).toBe(false)
    expect(validateChatPayload({ messages: [{ role: 'user', content: 'olá' }] })).toBe(true)
  })

  it('validates emails and image signatures', () => {
    expect(isValidEmail('cliente@example.com')).toBe(true)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(validateAttachments([{
      name: 'foto.png',
      contentType: 'image/png',
      base64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64'),
    }])).toBe(true)
    expect(validateAttachments([{
      name: 'fake.png',
      contentType: 'image/png',
      base64: Buffer.from('<script>').toString('base64'),
    }])).toBe(false)
  })

  it('requires warranty identifiers and configured server credentials', async () => {
    const warranty = {
      nome: 'Cliente',
      email: 'cliente@example.com',
      numero_pedido: '#123',
      produto: 'Notebook',
      tipo: 'Garantia',
      descricao: 'Não liga',
      arquivos: [],
    }
    expect(validateTicketPayload(warranty)).toBe(false)
    expect(validateTicketPayload({ ...warranty, numero_serie: 'SN-1', nota_fiscal: 'NF-1' })).toBe(true)

    vi.stubEnv('SERVICENOW_INSTANCE', '')
    vi.stubEnv('SERVICENOW_USER', '')
    vi.stubEnv('SERVICENOW_PASSWORD', '')
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    await chamadosHandler({
      method: 'POST',
      headers: {},
      body: {
        ...warranty,
        tipo: 'Troca',
      },
    }, response)
    expect(response.status).toHaveBeenCalledWith(503)
  })
})
