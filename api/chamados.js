export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  const instance = process.env.VITE_SERVICENOW_INSTANCE || 'https://sua-instancia.service-now.com';
  const user = process.env.VITE_SERVICENOW_USER || 'usuario';
  const password = process.env.VITE_SERVICENOW_PASSWORD || 'senha';

  const customEndpoint = '/api/x_2014456_servicef/chamados';

  try {
    const response = await fetch(`${instance}${customEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
      },
      body: JSON.stringify({
        nome: data.nome,
        email: data.email,
        numero_pedido: data.numero_pedido,
        produto: data.produto,
        tipo: data.tipo,
        descricao: data.descricao,
        nps: data.nps || '',
        foto: data.foto || '',
        arquivos: data.arquivos || []
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `ServiceNow error ${response.status}: ${errorText}` });
    }

    const result = await response.json();
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
