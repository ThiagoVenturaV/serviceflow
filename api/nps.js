import {
  getServiceNowConfig,
  logUpstreamFailure,
  requestBodyWithinLimit,
} from './_security.js'

// POST /api/nps  — body: { protocolo, nota }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requestBodyWithinLimit(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  const { protocolo, nota } = req.body || {};

  if (!protocolo || nota === undefined || nota === null) {
    return res.status(400).json({ error: 'Parâmetros "protocolo" e "nota" obrigatórios.' });
  }

  if (typeof protocolo !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(protocolo)
      || typeof nota !== 'number' || !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({ error: 'A nota deve ser um número entre 1 e 5.' });
  }

  const serviceNow = getServiceNowConfig();
  if (!serviceNow) {
    return res.status(503).json({ error: 'Integração indisponível.' });
  }

  const endpoint = `/api/x_2014456_servicef/chamados/chamados/${encodeURIComponent(protocolo)}/nps`;

  try {
    const response = await fetch(`${serviceNow.instance}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serviceNow.authorization,
      },
      body: JSON.stringify({ nps: nota }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Falha na integração externa.' });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    logUpstreamFailure('nps', error);
    return res.status(502).json({ error: 'Falha na integração externa.' });
  }
}
