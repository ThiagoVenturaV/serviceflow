import {
  getServiceNowConfig,
  isDemoMode,
  isValidEmail,
  logUpstreamFailure,
} from './_security.js'

// GET /api/meus-chamados?email=cliente@email.com
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Parâmetro "email" obrigatório.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const serviceNow = getServiceNowConfig();

  const endpoint = `/api/x_2014456_servicef/chamados/chamados?email=${encodeURIComponent(normalizedEmail)}`;

  if (serviceNow) {
    try {
      const response = await fetch(`${serviceNow.instance}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': serviceNow.authorization,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        let tickets = [];
        let path = '';
        if (result && Array.isArray(result)) {
          tickets = result;
          path = 'direct';
        } else if (result && result.result && Array.isArray(result.result)) {
          tickets = result.result;
          path = 'result';
        } else if (result && result.result && result.result.result && Array.isArray(result.result.result)) {
          tickets = result.result.result;
          path = 'result.result';
        }

        const mappedTickets = tickets.map(t => {
          if (t && t.tipo === 'Garantia' && t.descricao) {
            const matchSerie = t.descricao.match(/Número de Série:\s*([^\n\r]+)/i);
            const matchNota = t.descricao.match(/Nota Fiscal:\s*([^\n\r]+)/i);
            if (matchSerie) t.numero_serie = matchSerie[1].trim();
            if (matchNota) t.nota_fiscal = matchNota[1].trim();
            t.descricao = t.descricao.split('\n\n--- Detalhes da Garantia ---')[0];
          }
          return t;
        });

        if (path === 'direct') {
          return res.status(200).json(mappedTickets);
        } else if (path === 'result') {
          result.result = mappedTickets;
          return res.status(200).json(result);
        } else if (path === 'result.result') {
          result.result.result = mappedTickets;
          return res.status(200).json(result);
        } else {
          return res.status(200).json(result);
        }
      }
      return res.status(502).json({ error: 'Falha na integração externa.' });
    } catch (error) {
      logUpstreamFailure('meus_chamados', error);
      return res.status(502).json({ error: 'Falha na integração externa.' });
    }
  }

  if (!isDemoMode()) {
    return res.status(503).json({ error: 'Integração indisponível.' });
  }

  // Fallback de dados para desenvolvimento offline e suíte de testes
  const isAgent = normalizedEmail.includes('atendente') || normalizedEmail.includes('admin') || normalizedEmail.includes('supervisor');

  const mockTickets = [
    {
      protocolo: 'SF-1738923091',
      number: 'SF-1738923091',
      nome_do_cliente: 'Pedro Santos',
      email: 'cliente.pedro@gmail.com',
      produto: 'iPhone 15 Pro Max',
      tipo: 'Troca',
      status: '1',
      state: 'Novo',
      descricao: 'O aparelho veio com a tela trincada no canto superior esquerdo.',
      data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: 'EDX-RJ'
    },
    {
      protocolo: 'SF-1738923092',
      number: 'SF-1738923092',
      nome_do_cliente: 'Maria Oliveira',
      email: 'cliente.maria@gmail.com',
      produto: 'MacBook Air M3',
      tipo: 'Garantia',
      status: '2',
      state: 'Em andamento',
      descricao: 'O teclado parou de funcionar na fileira numérica superior. Exige reparo da placa lógica.',
      data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'EDX-PE',
      numero_serie: 'SN-MCB3829102',
      nota_fiscal: 'NF-982738'
    },
    {
      protocolo: 'SF-1738923093',
      number: 'SF-1738923093',
      nome_do_cliente: 'João Silva',
      email: 'cliente.joao@gmail.com',
      produto: 'PlayStation 5',
      tipo: 'Reembolso',
      status: '6',
      state: 'Resolvido',
      descricao: 'Solicito o cancelamento da compra e estorno do valor por arrependimento.',
      data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'EDX-MG'
    }
  ];

  if (isAgent) {
    return res.status(200).json(mockTickets);
  } else {
    const filtered = mockTickets.filter(t => t.email === normalizedEmail);
    return res.status(200).json(filtered);
  }
}
