import Groq from 'groq-sdk';
import { CONFIG } from '../config.js';

const groq = new Groq({
  apiKey: CONFIG.groq.apiKey,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `Você é ${CONFIG.brand.aiName}, uma assistente virtual de atendimento da ${CONFIG.brand.name}.
Seu objetivo é coletar as informações necessárias para abrir um chamado no ServiceNow de forma natural e amigável.

VOCÊ PRECISA COLETAR EXATAMENTE:
1. nome - Nome completo do cliente
2. email - Email do cliente
3. numero_pedido - Número do pedido (formato: #XXXXX)
4. produto - Nome ou descrição do produto
5. tipo - Tipo de solicitação: "Troca", "Devolução", "Garantia" ou "Reclamação"
6. descricao - Descrição detalhada do problema

REGRAS:
- Seja conversacional e empática, não robótica
- Colete uma ou duas informações por vez
- Quando tiver TODAS as 6 informações, responda APENAS com um JSON no formato:
  [DADOS_COLETADOS]{"nome":"...","email":"...","numero_pedido":"...","produto":"...","tipo":"...","descricao":"..."}[/DADOS_COLETADOS]
  seguido de uma mensagem amigável de confirmação em português
- Confirme com o cliente antes de enviar
- Use linguagem em português do Brasil
- Nunca mencione "ServiceNow" ou "sistema interno"
- Trate reclamações com empatia redobrada`;

export async function sendMessage(messages) {
  const response = await groq.chat.completions.create({
    model: CONFIG.groq.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
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
