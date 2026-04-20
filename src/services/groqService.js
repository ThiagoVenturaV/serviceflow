export async function sendMessage(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('Falha ao comunicar com a IA');
  }

  const data = await response.json();
  return data.content || 'Desculpe, não consegui processar sua mensagem.';
}

export function extractCollectedData(text) {
  const match = text.match(/\[DADOS_COLETADOS\]([\s\S]*?)\[\/DADOS_COLETADOS\]/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export function cleanMessageText(text) {
  return text.replace(/\[DADOS_COLETADOS\][\s\S]*?\[\/DADOS_COLETADOS\]/g, '').trim();
}
