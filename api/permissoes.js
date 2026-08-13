import {
  getServiceNowConfig,
  isDemoMode,
  isValidEmail,
  logUpstreamFailure,
} from './_security.js'

// GET /api/permissoes?email=user@email.com
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Parâmetro "email" obrigatório.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Tenta obter do ServiceNow real se as credenciais estiverem configuradas
  const serviceNow = getServiceNowConfig();

  if (serviceNow) {
    try {
      // Endpoint customizado Scripted REST API no ServiceNow
      const endpoint = `/api/x_2014456_servicef/chamados/chamados/permissoes?email=${encodeURIComponent(normalizedEmail)}`;
      const response = await fetch(`${serviceNow.instance}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': serviceNow.authorization,
        },
      });

      if (response.ok) {
        const body = await response.json();
        // ServiceNow wraps custom response in 'result' property
        const permissions = body && body.result !== undefined ? body.result : body;
        return res.status(200).json(permissions);
      } else {
        return res.status(502).json({ error: 'Falha na integração externa.' });
      }
    } catch (error) {
      logUpstreamFailure('permissoes', error);
      return res.status(502).json({ error: 'Falha na integração externa.' });
    }
  }

  if (!isDemoMode()) {
    return res.status(503).json({ error: 'Integração indisponível.' });
  }

  // 2. Fallback de regras locais para desenvolvimento e testes automatizados offline
  let permissions = {
    canRead: true,
    canWrite: false,
    canCreate: true,
    canDelete: false,
    roles: ['sf_cliente']
  };

  if (normalizedEmail.includes('admin') || normalizedEmail.includes('supervisor')) {
    permissions = {
      canRead: true,
      canWrite: true,
      canCreate: true,
      canDelete: true,
      roles: ['sf_admin', 'sf_atendente', 'sf_usuario']
    };
  } else if (normalizedEmail.includes('atendente') || normalizedEmail.includes('agente')) {
    permissions = {
      canRead: true,
      canWrite: true,
      canCreate: true,
      canDelete: false,
      roles: ['sf_atendente', 'sf_usuario']
    };
  }

  return res.status(200).json(permissions);
}
