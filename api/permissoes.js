// GET /api/permissoes?email=user@email.com
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Parâmetro "email" obrigatório.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Tenta obter do ServiceNow real se as credenciais estiverem configuradas
  const instance = process.env.SERVICENOW_INSTANCE || process.env.VITE_SERVICENOW_INSTANCE;
  const user     = process.env.SERVICENOW_USER     || process.env.VITE_SERVICENOW_USER;
  const password = process.env.SERVICENOW_PASSWORD || process.env.VITE_SERVICENOW_PASSWORD;

  if (instance && user && password) {
    try {
      // Endpoint customizado Scripted REST API no ServiceNow
      const endpoint = `/api/x_2014456_servicef/chamados/chamados/permissoes?email=${encodeURIComponent(normalizedEmail)}`;
      const response = await fetch(`${instance}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Espera retornar: { canRead, canWrite, canCreate, canDelete, roles }
        return res.status(200).json(result);
      }
    } catch (error) {
      console.warn('Falha ao conectar com o ServiceNow, usando fallback de permissões locais:', error.message);
    }
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
