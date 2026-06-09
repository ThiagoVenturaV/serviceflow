export async function sendMessage(messages, variables = {}) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, variables }),
  });

  if (!response.ok) {
    let errMsg = 'Falha ao comunicar com a IA';
    try {
      const errData = await response.json();
      if (errData && errData.error) {
        errMsg = errData.error;
      }
    } catch {}
    throw new Error(errMsg);
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
