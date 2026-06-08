// POST /api/nps  — body: { protocolo, nota }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { protocolo, nota } = req.body;

  if (!protocolo || nota === undefined || nota === null) {
    return res.status(400).json({ error: 'Parâmetros "protocolo" e "nota" obrigatórios.' });
  }

  if (typeof nota !== 'number' || nota < 1 || nota > 5) {
    return res.status(400).json({ error: 'A nota deve ser um número entre 1 e 5.' });
  }

  const instance = process.env.SERVICENOW_INSTANCE || process.env.VITE_SERVICENOW_INSTANCE;
  const user     = process.env.SERVICENOW_USER     || process.env.VITE_SERVICENOW_USER;
  const password = process.env.SERVICENOW_PASSWORD || process.env.VITE_SERVICENOW_PASSWORD;

  const endpoint = `/api/x_2014456_servicef/chamados/chamados/${encodeURIComponent(protocolo)}/nps`;

  try {
    const response = await fetch(`${instance}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
      },
      body: JSON.stringify({ nps: nota }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `ServiceNow error ${response.status}: ${errorText}` });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
