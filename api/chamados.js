import {
  getServiceNowConfig,
  logUpstreamFailure,
  requestBodyWithinLimit,
  validateTicketPayload,
} from './_security.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requestBodyWithinLimit(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  const data = req.body;
  if (!validateTicketPayload(data)) {
    return res.status(400).json({ error: 'Dados do chamado inválidos.' });
  }
  const serviceNow = getServiceNowConfig();
  if (!serviceNow) {
    return res.status(503).json({ error: 'Integração indisponível.' });
  }

  // Trata atualizações de chamados (ações do Atendente/Agente)
  if (data.isUpdate) {
    try {
        const updateEndpoint = `/api/x_2014456_servicef/chamados/chamados/${encodeURIComponent(data.protocolo)}`;
        const response = await fetch(`${serviceNow.instance}${updateEndpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': serviceNow.authorization,
          },
          body: JSON.stringify({
            status: data.status,
            comentarios: data.comentarios || ''
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return res.status(200).json(result);
        }
        return res.status(502).json({ error: 'Falha na integração externa.' });
    } catch (error) {
      logUpstreamFailure('chamados:update', error);
      return res.status(502).json({ error: 'Falha na integração externa.' });
    }
  }

  const customEndpoint = '/api/x_2014456_servicef/chamados';

  let finalDescricao = data.descricao;
  if (data.tipo === 'Garantia') {
    const extraInfo = [];
    if (data.numero_serie) {
      extraInfo.push(`Número de Série: ${data.numero_serie}`);
    }
    if (data.nota_fiscal) {
      extraInfo.push(`Nota Fiscal: ${data.nota_fiscal}`);
    }
    if (extraInfo.length > 0) {
      finalDescricao = `${finalDescricao}\n\n--- Detalhes da Garantia ---\n${extraInfo.join('\n')}`;
    }
  }

  try {
    const response = await fetch(`${serviceNow.instance}${customEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serviceNow.authorization,
      },
      body: JSON.stringify({
        nome: data.nome,
        email: data.email,
        numero_pedido: data.numero_pedido,
        produto: data.produto,
        tipo: data.tipo,
        descricao: finalDescricao,
        nps: data.nps || '',
        foto: (data.arquivos && data.arquivos.length > 0) ? 'true' : 'false',
        arquivos: (data.arquivos || []).map(({ name, contentType, base64 }) => ({
          name,
          contentType,
          base64,
        }))
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Falha na integração externa.' });
    }

    const result = await response.json();
    return res.status(201).json(result);
  } catch (error) {
    logUpstreamFailure('chamados:create', error);
    return res.status(502).json({ error: 'Falha na integração externa.' });
  }
}
