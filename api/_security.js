import { Buffer } from 'node:buffer'
import { env } from 'node:process'

const MAX_REQUEST_BYTES = 4 * 1024 * 1024
const MAX_ATTACHMENT_BYTES = 900 * 1024
const ALLOWED_TICKET_TYPES = new Set(['Troca', 'Devolução', 'Garantia', 'Reclamação'])
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function getServiceNowConfig() {
  const instance = env.SERVICENOW_INSTANCE
  const user = env.SERVICENOW_USER
  const password = env.SERVICENOW_PASSWORD
  if (!instance || !user || !password) return null

  try {
    const url = new URL(instance)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return {
      instance: url.origin,
      authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
    }
  } catch {
    return null
  }
}

export function getGroqApiKey() {
  return env.GROQ_API_KEY || null
}

export function isDemoMode() {
  return env.SERVICEFLOW_DEMO_MODE === 'true'
}

export function requestBodyWithinLimit(req) {
  const declaredLength = Number(req.headers?.['content-length'])
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) return false
  try {
    return Buffer.byteLength(JSON.stringify(req.body ?? {}), 'utf8') <= MAX_REQUEST_BYTES
  } catch {
    return false
  }
}

export function isValidEmail(value) {
  return typeof value === 'string'
    && value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function boundedString(value, maxLength, minLength = 1) {
  return typeof value === 'string'
    && value.trim().length >= minLength
    && value.length <= maxLength
}

function hasExpectedSignature(bytes, contentType) {
  if (contentType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (contentType === 'image/png') {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    return bytes.length >= png.length && png.every((byte, index) => bytes[index] === byte)
  }
  if (contentType === 'image/webp') {
    return bytes.length >= 12
      && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
      && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  return false
}

export function validateAttachments(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length > 3) return false
  return attachments.every((attachment) => {
    if (!attachment || !boundedString(attachment.name, 255)) return false
    if (!ALLOWED_IMAGE_TYPES.has(attachment.contentType)) return false
    if (typeof attachment.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(attachment.base64)) {
      return false
    }
    if (attachment.base64.length % 4 !== 0) return false
    const bytes = Buffer.from(attachment.base64, 'base64')
    return bytes.length > 0
      && bytes.length <= MAX_ATTACHMENT_BYTES
      && bytes.toString('base64') === attachment.base64
      && hasExpectedSignature(bytes, attachment.contentType)
  })
}

export function validateTicketPayload(data) {
  if (!data || typeof data !== 'object') return false
  if (data.isUpdate) {
    return boundedString(data.protocolo, 100)
      && ['2', '3'].includes(String(data.status))
      && (data.comentarios === undefined || boundedString(data.comentarios, 2_000, 0))
  }
  const validCreation = boundedString(data.nome, 200)
    && isValidEmail(data.email)
    && boundedString(data.numero_pedido, 100)
    && boundedString(data.produto, 300)
    && ALLOWED_TICKET_TYPES.has(data.tipo)
    && boundedString(data.descricao, 4_000)
    && (data.numero_serie === undefined || data.numero_serie === null || boundedString(data.numero_serie, 200))
    && (data.nota_fiscal === undefined || data.nota_fiscal === null || boundedString(data.nota_fiscal, 200))
    && validateAttachments(data.arquivos)
  if (!validCreation) return false
  return data.tipo !== 'Garantia'
    || (boundedString(data.numero_serie, 200) && boundedString(data.nota_fiscal, 200))
}

export function validateChatPayload(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 30) {
    return false
  }
  let totalLength = 0
  for (const message of body.messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || !boundedString(message.content, 4_000)) {
      return false
    }
    totalLength += message.content.length
  }
  if (totalLength > 20_000) return false
  if (body.variables !== undefined && (
    body.variables === null
    || typeof body.variables !== 'object'
    || Array.isArray(body.variables)
  )) {
    return false
  }
  return Object.values(body.variables || {}).every(
    (value) => typeof value === 'string' && value.length <= 500,
  )
}

export function logUpstreamFailure(scope, error) {
  console.error(`[${scope}] upstream request failed`, {
    type: error?.name || 'Error',
  })
}
