import { CONFIG } from '../config.js';

export async function createTicket(data) {
  const response = await fetch('/api/chamados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro interno no servidor: ${response.status}`);
  }

  return response.json();
}
