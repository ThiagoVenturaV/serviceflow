import { CONFIG } from '../config.js';

export async function createTicket(data) {
  const { instance, endpoint, user, password } = CONFIG.serviceNow;

  const response = await fetch(`${instance}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${user}:${password}`),
    },
    body: JSON.stringify({
      nome: data.nome,
      email: data.email,
      numero_pedido: data.numero_pedido,
      produto: data.produto,
      tipo: data.tipo,
      descricao: data.descricao,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ServiceNow error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  return result;
}
