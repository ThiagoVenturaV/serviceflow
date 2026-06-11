export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  const instance = process.env.SERVICENOW_INSTANCE || process.env.VITE_SERVICENOW_INSTANCE || 'https://sua-instancia.service-now.com';
  const user = process.env.SERVICENOW_USER || process.env.VITE_SERVICENOW_USER || 'usuario';
  const password = process.env.SERVICENOW_PASSWORD || process.env.VITE_SERVICENOW_PASSWORD || 'senha';

  // Trata atualizações de chamados (ações do Atendente/Agente)
  if (data.isUpdate) {
    if (instance && user && password && !instance.includes('sua-instancia')) {
      try {
        const updateEndpoint = `/api/x_2014456_servicef/chamados/chamados/${encodeURIComponent(data.protocolo)}`;
        const response = await fetch(`${instance}${updateEndpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
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
      } catch (error) {
        console.warn('Falha ao atualizar no ServiceNow, usando fallback de atualização local:', error.message);
      }
    }
    return res.status(200).json({ success: true, protocolo: data.protocolo, status: data.status });
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
        descricao: finalDescricao,
        nps: data.nps || '',
        foto: (data.arquivos && data.arquivos.length > 0) ? 'true' : 'false',
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
