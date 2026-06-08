// GET /api/meus-chamados?email=cliente@email.com
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Parâmetro "email" obrigatório.' });
  }

  const instance = process.env.SERVICENOW_INSTANCE || process.env.VITE_SERVICENOW_INSTANCE;
  const user     = process.env.SERVICENOW_USER     || process.env.VITE_SERVICENOW_USER;
  const password = process.env.SERVICENOW_PASSWORD || process.env.VITE_SERVICENOW_PASSWORD;

  const endpoint = `/api/x_2014456_servicef/chamados/chamados?email=${encodeURIComponent(email)}`;

  try {
    const response = await fetch(`${instance}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
      },
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
