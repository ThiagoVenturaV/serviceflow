import Groq from 'groq-sdk';
import {
  getGroqApiKey,
  getServiceNowConfig,
  isValidEmail,
  logUpstreamFailure,
  requestBodyWithinLimit,
  validateChatPayload,
} from './_security.js';

async function callListarChamados(email) {
  const serviceNow = getServiceNowConfig();
  if (!serviceNow || !isValidEmail(email)) return { error: 'Consulta indisponível.' };

  const endpoint = `/api/x_2014456_servicef/chamados/chamados?email=${encodeURIComponent(email)}`;
  try {
    const res = await fetch(`${serviceNow.instance}${endpoint}`, {
      headers: {
        'Authorization': serviceNow.authorization,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return { error: `ServiceNow error ${res.status}` };
    const data = await res.json();
    if (data && data.result && Array.isArray(data.result)) {
      data.result = data.result.map(t => {
        if (t && t.tipo === 'Garantia' && t.descricao) {
          const matchSerie = t.descricao.match(/Número de Série:\s*([^\n\r]+)/i);
          const matchNota = t.descricao.match(/Nota Fiscal:\s*([^\n\r]+)/i);
          if (matchSerie) t.numero_serie = matchSerie[1].trim();
          if (matchNota) t.nota_fiscal = matchNota[1].trim();
          t.descricao = t.descricao.split('\n\n--- Detalhes da Garantia ---')[0];
        }
        return t;
      });
    }
    return data;
  } catch (err) {
    logUpstreamFailure('chat:listar_chamados', err);
    return { error: 'Consulta indisponível.' };
  }
}

async function callBuscarChamado(protocolo) {
  const serviceNow = getServiceNowConfig();
  if (!serviceNow || typeof protocolo !== 'string' || protocolo.length > 100) {
    return { error: 'Consulta indisponível.' };
  }

  const endpoint = `/api/x_2014456_servicef/chamados/chamados/${encodeURIComponent(protocolo)}`;
  try {
    const res = await fetch(`${serviceNow.instance}${endpoint}`, {
      headers: {
        'Authorization': serviceNow.authorization,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return { error: `ServiceNow error ${res.status}` };
    const data = await res.json();
    if (data && data.result) {
      const t = data.result;
      if (t && t.tipo === 'Garantia' && t.descricao) {
        const matchSerie = t.descricao.match(/Número de Série:\s*([^\n\r]+)/i);
        const matchNota = t.descricao.match(/Nota Fiscal:\s*([^\n\r]+)/i);
        if (matchSerie) t.numero_serie = matchSerie[1].trim();
        if (matchNota) t.nota_fiscal = matchNota[1].trim();
        t.descricao = t.descricao.split('\n\n--- Detalhes da Garantia ---')[0];
      }
    }
    return data;
  } catch (err) {
    logUpstreamFailure('chat:buscar_chamado', err);
    return { error: 'Consulta indisponível.' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requestBodyWithinLimit(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  if (!validateChatPayload(req.body)) {
    return res.status(400).json({ error: 'Mensagens inválidas.' });
  }
  const { messages, variables = {} } = req.body;
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'Integração de IA indisponível.' });
  }

  const groq = new Groq({
    apiKey,
  });

  const SYSTEM_PROMPT = `Você é Sofia, uma assistente virtual de atendimento da ServiceFlow.
Seu objetivo principal é coletar as informações necessárias para abrir um chamado no ServiceNow de forma natural e amigável.

VOCÊ PRECISA COLETAR EXATAMENTE:
1. nome - Nome completo do cliente
2. email - Email do cliente
3. numero_pedido - Número do pedido (formato: #XXXXX)
4. produto - Nome ou descrição do produto
5. tipo - Tipo de solicitação: "Troca", "Devolução", "Garantia" ou "Reclamação"
6. descricao - Descrição detalhada do problema

REGRAS DE UI POLICY (CAMPOS OBRIGATÓRIOS CONDICIONAIS):
- Se o campo 'tipo' for "Garantia", você DEVE obrigatoriamente coletar também:
  7. numero_serie - Número de série do produto
  8. nota_fiscal - Número da Nota Fiscal de compra
- Caso o 'tipo' seja outro, esses dois campos NÃO devem ser coletados.

FOTOS DO PRODUTO (IMPORTANTE):
- Nosso sistema SUPORTA envio de fotos do produto.
- Após coletar a descrição do problema, SEMPRE pergunte ao cliente se ele gostaria de enviar fotos do produto para ajudar na análise.
- Explique que ele pode anexar até 3 imagens usando o botão de clipe (📎) ao lado do campo de mensagem.
- Se o cliente disser que já anexou ou que vai anexar, registre "sim" no campo fotos_enviadas. Se não quiser enviar, registre "nao".
- Não bloqueie o fluxo por causa das fotos — se o cliente não quiser enviar, prossiga normalmente.

REGRAS DE CRIAÇÃO:
- Seja conversacional e empática, não robótica
- Colete uma ou duas informações por vez
- Quando tiver TODAS as informações obrigatórias (incluindo as condicionais de Garantia se for o caso) E a confirmação sobre fotos, responda APENAS com um JSON no formato:
  [DADOS_COLETADOS]{"nome":"{nome}","email":"{email}","numero_pedido":"{numero_pedido}","produto":"...","tipo":"...","descricao":"...","fotos_enviadas":"sim ou nao","numero_serie":"... (ou null se não aplicável)","nota_fiscal":"... (ou null se não aplicável)"}[/DADOS_COLETADOS]
  seguido de uma mensagem CURTA pedindo ao cliente para REVISAR os dados listados acima e clicar em "Abrir Chamado" para confirmar.
  ATENÇÃO: O chamado ainda NÃO foi aberto. NÃO diga que o caso foi registrado, enviado ou aberto. Apenas peça a confirmação dos dados.
- Confirme com o cliente antes de enviar
- Use linguagem em português do Brasil
- Nunca mencione "ServiceNow" ou "sistema interno"
- Trate reclamações com empatia redobrada

MASCARAMENTO DE DADOS SENSÍVEIS (PII):
- Por questões de privacidade, o nome, e-mail e número de pedido do cliente são mascarados antes de chegarem a você.
- Eles aparecerão nas mensagens como os placeholders exatos: "{nome}", "{email}" e "{numero_pedido}".
- IMPORTANTE: Se o cliente enviar uma mensagem contendo apenas "{nome}" (ou se a mensagem dele contiver esse placeholder), trate isso como se ele tivesse fornecido um Nome Completo perfeitamente válido e prossiga para a coleta dos outros dados!
- Se a mensagem contiver "{email}", trate como um e-mail válido.
- Se a mensagem contiver "{numero_pedido}", trate como um número de pedido válido.
- Ao responder, use esses placeholders para se referir a esses dados (ex: "Olá {nome}!", "Enviei um e-mail para {email}").

CONSULTA DE CHAMADOS EXISTENTES (TICKET LOOKUP):
- Você também pode consultar o status de chamados já abertos no ServiceNow usando as ferramentas (tools) disponibilizadas.
- Se o cliente perguntar sobre o status de uma solicitação, verificar chamado, saber "como está minha solicitação" ou similar:
  - IMPORTANTE: Se o e-mail do cliente já for conhecido (ou seja, se a variável {email} estiver disponível no contexto de "DADO JÁ COLETADO"), NÃO peça o e-mail ao cliente. Execute IMEDIATAMENTE a ferramenta 'listar_chamados_por_email' passando o e-mail conhecido (como "{email}").
  - Caso o e-mail não seja conhecido, peça a ele o e-mail ou o número do protocolo do chamado.
  - Se ele fornecer o e-mail, execute a ferramenta 'listar_chamados_por_email'.
  - Se ele fornecer o protocolo, execute a ferramenta 'buscar_chamado_por_protocolo'.
- Quando as ferramentas retornarem dados dos chamados, exiba o status de forma organizada e clara (Protocolo, Produto, Tipo, Status atual e Data de Criação).
- Lembre o cliente que ele também pode ver todo o seu histórico a qualquer momento clicando na aba "Meus Casos" no menu lateral.`;

  const tools = [
    {
      type: 'function',
      function: {
        name: 'listar_chamados_por_email',
        description: 'Lista todos os chamados de pós-venda associados a um determinado e-mail de cliente no ServiceNow.',
        parameters: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'O e-mail do cliente (ex: cliente@email.com).',
            },
          },
          required: ['email'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'buscar_chamado_por_protocolo',
        description: 'Busca os detalhes e o status de um chamado específico no ServiceNow usando o número do protocolo.',
        parameters: {
          type: 'object',
          properties: {
            protocolo: {
              type: 'string',
              description: 'O número do protocolo do chamado (ex: SF-XXXXXXXXXX).',
            },
          },
          required: ['protocolo'],
        },
      },
    },
  ];

  try {
    let finalPrompt = SYSTEM_PROMPT;
    if (variables.nome) {
      finalPrompt += `\n\n- DADO JÁ COLETADO: O nome do cliente já é conhecido e é "{nome}". NÃO peça o nome dele de novo!`;
    }
    if (variables.email) {
      finalPrompt += `\n\n- DADO JÁ COLETADO: O e-mail do cliente já é conhecido e é "{email}". NÃO peça o e-mail dele de novo!`;
    }
    if (variables.nome && variables.email) {
      finalPrompt += `\n- IMPORTANTE (USUÁRIO RECORRENTE): Como o usuário já está identificado como {nome} com e-mail {email}, dê as boas-vindas personalizadas na primeira interação dele ou quando for oportuno, e ofereça proativamente a opção de consultar o andamento das solicitações dele ou de prosseguir com uma nova abertura de chamado.`;
    }

    let formattedMessages = [
      { role: 'system', content: finalPrompt },
      ...messages,
    ];

    let response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: formattedMessages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1024,
    });

    let responseMessage = response.choices[0]?.message;

    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      formattedMessages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let toolResult;

        if (functionName === 'listar_chamados_por_email') {
          let email = isValidEmail(variables.email) ? variables.email : functionArgs.email;
          if (email && (email === '{email}' || email.includes('{email}'))) {
            email = variables.email || email;
          }
          toolResult = await callListarChamados(email);
        } else if (functionName === 'buscar_chamado_por_protocolo') {
          let protocolo = functionArgs.protocolo;
          if (protocolo && (protocolo === '{protocolo}' || protocolo.includes('{protocolo}'))) {
            protocolo = variables.protocolo || protocolo;
          }
          toolResult = await callBuscarChamado(protocolo);
        }

        formattedMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(toolResult),
        });
      }

      response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      responseMessage = response.choices[0]?.message;
    }

    const content = responseMessage?.content || 'Desculpe, não consegui processar sua mensagem.';
    return res.status(200).json({ content });
  } catch (error) {
    logUpstreamFailure('chat', error);
    return res.status(502).json({ error: 'Falha na integração de IA.' });
  }
}
