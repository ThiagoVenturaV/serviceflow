import { useState, useRef, useEffect, useCallback } from 'react';
import {
  sendMessage,
  extractCollectedData,
  cleanMessageText,
} from '../services/groqService.js';
import { createTicket } from '../services/serviceNowService.js';
import { CONFIG } from '../config.js';
import NPSModal from '../components/NPSModal.jsx';
import HelpPage from './HelpPage.jsx';
import MyCasesPage from './MyCasesPage.jsx';
import './ChatPage.css';

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  text: `Olá! Sou ${CONFIG.brand.aiName}, sua assistente de atendimento. 😊\n\nEstou aqui para te ajudar com qualquer solicitação pós-venda — trocas, devoluções, garantias ou reclamações.\n\nPor onde começamos? Me conta o que está acontecendo!`,
  timestamp: new Date(),
};

const PLACEHOLDER_SUGGESTIONS = [
  'Digite sua mensagem...',
  'Quero fazer uma devolução...',
  'Meu pedido veio com defeito...',
  'Preciso acionar a garantia...',
  'Qual o status do meu pedido?',
  'Recebi o produto errado...',
];

export default function ChatPage({ onBack, user }) {
  const permissions = user?.permissions || {
    canRead: true,
    canWrite: false,
    canCreate: true,
    canDelete: false,
    roles: ['sf_cliente']
  };
  const roles = (permissions.roles || ['sf_cliente']).map(r => r.includes('.') ? r.split('.').pop() : r);

  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_chat_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    const welcomeText = user?.nome
      ? `Olá {nome}! Que bom ver você por aqui. 😊\n\nComo posso te ajudar hoje? Você gostaria de acompanhar o andamento das suas solicitações em aberto ou prefere abrir um novo chamado?`
      : `Olá! Sou ${CONFIG.brand.aiName}, sua assistente de atendimento. 😊\n\nEstou aqui para te ajudar com qualquer solicitação pós-venda — trocas, devoluções, garantias ou reclamações.\n\nPor onde começamos? Me conta o que está acontecendo!`;
    return [{ id: 1, role: 'assistant', text: welcomeText, timestamp: new Date() }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null); // null | 'pending' | 'success' | 'error'
  const [protocol, setProtocol] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (!user || !user.email) return 'overview';
    if (roles.includes('sf_admin')) return 'dashboard';
    if (roles.includes('sf_atendente')) return 'queue';
    if (roles.includes('sf_cliente')) return 'mycases';
    return 'overview';
  });
  const [portalInput, setPortalInput] = useState('');
  const [attachments, setAttachments] = useState([]); // Array of { id, name, type, base64 }
  const [showNPS, setShowNPS] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clientVars, setClientVars] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_client_vars');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          nome: parsed.nome || user?.nome || '',
          email: user?.email || parsed.email || '',
          numero_pedido: parsed.numero_pedido || '',
          protocolo: parsed.protocolo || ''
        };
      }
    } catch {}
    return {
      nome: user?.nome || '',
      email: user?.email || '',
      numero_pedido: '',
      protocolo: ''
    };
  });

  const [queueTickets, setQueueTickets] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [expandedQueueId, setExpandedQueueId] = useState(null);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  const fetchQueue = useCallback(async () => {
    if (!user?.email) return;
    setQueueLoading(true);
    try {
      const res = await fetch(`/api/meus_chamados?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      let list = [];
      if (data) {
        if (Array.isArray(data)) list = data;
        else if (data.result) {
          if (Array.isArray(data.result)) list = data.result;
          else if (data.result.result && Array.isArray(data.result.result)) list = data.result.result;
        }
      }
      setQueueTickets(list);
    } catch (err) {
      console.error('Erro ao buscar fila de chamados:', err);
    } finally {
      setQueueLoading(false);
    }
  }, [user]);

  const handleUpdateTicketStatus = async (protocolo, status) => {
    try {
      const res = await fetch('/api/chamados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocolo,
          status,
          isUpdate: true,
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao atualizar o chamado.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar chamado: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue' || activeTab === 'dashboard') {
      fetchQueue();
    }
  }, [activeTab, fetchQueue]);

  // Salva mensagens sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('sf_chat_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Salva variáveis sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('sf_client_vars', JSON.stringify(clientVars));
    } catch {}
  }, [clientVars]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const portalInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputValueRef = useRef('');
  const portalInputValueRef = useRef('');
  const speechContextRef = useRef({ tab: 'overview', baseText: '' });
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isAutoSending = useRef(false);

  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);

  useEffect(() => {
    portalInputValueRef.current = portalInput;
  }, [portalInput]);

  const resizeTextarea = (textarea) => {
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    resizeTextarea(inputRef.current);
  }, [input]);

  useEffect(() => {
    resizeTextarea(portalInputRef.current);
  }, [portalInput]);

  const getTranscriptFromEvent = (event) => {
    if (!event?.results?.length) return '';

    return Array.from(event.results)
      .map((result) => result?.[0]?.transcript || '')
      .join(' ')
      .trim();
  };

  // ── Speech Recognition Initialization ──────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setHasSpeechSupport(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      speechContextRef.current = {
        tab: activeTabRef.current,
        baseText:
          activeTabRef.current === 'overview'
            ? portalInputValueRef.current
            : inputValueRef.current,
      };
    };

    recognition.onresult = (event) => {
      const transcript = getTranscriptFromEvent(event);
      if (!transcript) return;

      const { tab, baseText } = speechContextRef.current;
      const nextText = baseText ? `${baseText} ${transcript}` : transcript;

      if (tab === 'overview') {
        setPortalInput(nextText);
      } else {
        setInput(nextText);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error('SpeechRecognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = (targetTab = activeTabRef.current) => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      speechContextRef.current = {
        tab: targetTab,
        baseText:
          targetTab === 'overview'
            ? portalInputValueRef.current
            : inputValueRef.current,
      };

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start SpeechRecognition:', error);
      }
    }
  };

  // ── Placeholder rotation ─────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (!input && !isLoading) {
      interval = setInterval(() => {
        setPlaceholderIndex(
          (prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length,
        );
      }, 3500);
    } else {
      setPlaceholderIndex(0);
    }
    return () => clearInterval(interval);
  }, [input, isLoading]);

  // ── File Handlers ─────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (attachments.length + files.length > 3) {
      alert('Você pode anexar no máximo 3 imagens.');
      return;
    }

    const newAttachments = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`O arquivo ${file.name} não é uma imagem válida.`);
        continue;
      }

      // Basic size check (roughly 2MB per file to stay safe with Vercel 4.5MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert(
          `A imagem ${file.name} é muito grande. Limite de 2MB por arquivo.`,
        );
        continue;
      }

      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        base64: base64,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text, extra = {}) => {
    const msg = { id: Date.now(), role, text, timestamp: new Date(), ...extra };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    const currentAttachments = [...attachments];
    setPendingAttachments(currentAttachments);
    setAttachments([]);

    // Extrai e salva as variáveis antes da chamada
    const currentVars = extractAndSaveVars(userText);

    // Mostra o texto original no chat do usuário para boa experiência visual
    addMessage('user', userText, { attachments: currentAttachments });
    setIsLoading(true);

    try {
      // Cria histórico com mensagens de usuário ofuscadas (redacted)
      const history = messages.map((m) => ({
        role: m.role,
        content: m.role === 'user' ? redactTextWithVars(m.text, currentVars) : m.text,
      }));
      history.push({ role: 'user', content: redactTextWithVars(userText, currentVars) });

      const requestVars = {
        ...currentVars,
        isEDX: false,
        role: roles.includes('sf_admin') ? 'supervisor' : roles.includes('sf_atendente') ? 'atendente' : 'cliente',
        roles: roles,
        canRead: permissions.canRead,
        canWrite: permissions.canWrite
      };

      // Envia histórico ofuscado + dicionário de variáveis para o back-end
      const aiResponse = await sendMessage(history, requestVars);
      const data = extractCollectedData(aiResponse);
      const displayText = cleanMessageText(aiResponse);

      if (data) {
        // Resolve placeholders no JSON mapeado antes de abrir a confirmação
        const resolvedData = resolveDataPlaceholders(data, currentVars);
        setPendingData(resolvedData);
        setShowConfirm(true);
      } else {
        setPendingAttachments([]);
      }

      addMessage('assistant', displayText || aiResponse);
    } catch (err) {
      addMessage(
        'assistant',
        '❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.',
      );
      console.error(err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleConfirmTicket = async () => {
    setShowConfirm(false);
    setTicketStatus('pending');
    addMessage(
      'assistant',
      '⏳ Aguarde um momento, estou abrindo seu chamado...',
    );

    try {
      const result = await createTicket({
        ...pendingData,
        arquivos: pendingAttachments.map((a) => ({
          name: a.name,
          contentType: a.type,
          base64: a.base64.split(',')[1], // Extract just the base64 part
        })),
      });
      const proto =
        result?.protocolo || result?.result?.protocolo || `SF-${Date.now()}`;
      setProtocol(proto);
      setTicketStatus('success');
      setCollectedData(pendingData);

      // Persiste protocolo no localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('sf_protocols') || '[]');
        stored.unshift({ protocolo: proto, email: pendingData.email, data: new Date().toISOString(), produto: pendingData.produto, tipo: pendingData.tipo });
        localStorage.setItem('sf_protocols', JSON.stringify(stored.slice(0, 20)));
      } catch { /* ignora erros de storage */ }

      addMessage(
        'assistant',
        `✅ Perfeito! Seu chamado foi aberto com sucesso!\n\n📋 **Protocolo: ${proto}**\n\nGuarde esse número — você pode usá-lo para acompanhar o status. Enviaremos atualizações no email ${pendingData.email}. Posso ajudar com mais alguma coisa?`,
        { isProtocol: true, protocol: proto },
      );

      // Exibe NPS após 1.5s para não sobrepor a mensagem de sucesso
      setTimeout(() => setShowNPS(true), 1500);
    } catch (err) {
      setTicketStatus('error');
      addMessage(
        'assistant',
        `❌ Não foi possível abrir o chamado no momento. Por favor, tente novamente em alguns instantes.\n\nErro: ${err.message}`,
      );
    }

    setPendingData(null);
    setPendingAttachments([]);
  };

  const handleCancelTicket = () => {
    setShowConfirm(false);
    // Restore attachments to the input area so user can re-attach or modify
    setAttachments(pendingAttachments);
    addMessage(
      'assistant',
      'Tudo bem! Posso fazer alguma correção nos dados? Me diga o que precisar ajustar.',
    );
    setPendingData(null);
    setPendingAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startChatWithMessage = useCallback((initialMsg) => {
    setActiveTab('chat');
    if (initialMsg) {
      isAutoSending.current = true;
      setInput(initialMsg);
    }
  }, []);

  // When input is set from portal, trigger send if in chat
  useEffect(() => {
    if (
      activeTab === 'chat' &&
      input &&
      input !== '' &&
      isAutoSending.current
    ) {
      isAutoSending.current = false;
      handleSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, input]);

  const handlePortalSubmit = () => {
    if (portalInput.trim()) {
      startChatWithMessage(portalInput);
      setPortalInput('');
    }
  };

  const resetChat = () => {
    const welcomeText = user?.nome
      ? `Olá {nome}! Que bom ver você por aqui. 😊\n\nComo posso te ajudar hoje? Você gostaria de acompanhar o andamento das suas solicitações em aberto ou prefere abrir um novo chamado?`
      : `Olá! Sou ${CONFIG.brand.aiName}, sua assistente de atendimento. 😊\n\nEstou aqui para te ajudar com qualquer solicitação pós-venda — trocas, devoluções, garantias ou reclamações.\n\nPor onde começamos? Me conta o que está acontecendo!`;

    setMessages([{ id: Date.now(), role: 'assistant', text: welcomeText, timestamp: new Date() }]);
    setInput('');
    setCollectedData(null);
    setTicketStatus(null);
    setProtocol(null);
    setShowConfirm(false);
    setPendingData(null);
    setShowNPS(false);
    setClientVars({
      nome: user?.nome || '',
      email: user?.email || '',
      numero_pedido: '',
      protocolo: ''
    });
    try {
      localStorage.removeItem('sf_chat_messages');
      localStorage.removeItem('sf_client_vars');
    } catch {}
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const rehydrateText = (text) => {
    if (!text) return '';
    let res = text;
    res = res.replace(/\{(?:variables\.)?nome\}/g, clientVars.nome || '{nome}');
    res = res.replace(/\{(?:variables\.)?email\}/g, clientVars.email || '{email}');
    res = res.replace(/\{(?:variables\.)?numero_pedido\}/g, clientVars.numero_pedido || '{numero_pedido}');
    res = res.replace(/\{(?:variables\.)?protocolo\}/g, clientVars.protocolo || '{protocolo}');
    return res;
  };

  const renderText = (text) => {
    const rehydrated = rehydrateText(text);
    return rehydrated.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p key={i} dangerouslySetInnerHTML={{ __html: boldLine || '&nbsp;' }} />
      );
    });
  };

  const extractAndSaveVars = (text) => {
    const updatedVars = { ...clientVars };
    let normalized = text;

    // 1. Normalizador de e-mail conversacional (th arroba gmail . com -> th@gmail.com)
    normalized = normalized
      .replace(/\s*(?:arroba|@)\s*/gi, '@')
      .replace(/\s*(?:ponto|\.)\s*/gi, '.')
      .replace(/\s+/g, ' ');

    // 2. Extração de Email por Regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
    const emailMatch = normalized.match(emailRegex);
    if (emailMatch) {
      updatedVars.email = emailMatch[0].toLowerCase();
    }

    // 3. Extração de Número de Pedido por Regex (ex: #12345 ou similar)
    const pedidoRegex = /#\d+/gi;
    const pedidoMatch = normalized.match(pedidoRegex);
    if (pedidoMatch) {
      updatedVars.numero_pedido = pedidoMatch[0];
    }

    // 4. Extração de Protocolo por Regex (ex: SF-XXXXXXXXXX ou similar)
    const protoRegex = /\bSF-\d+\b/gi;
    const protoMatch = normalized.match(protoRegex);
    if (protoMatch) {
      updatedVars.protocolo = protoMatch[0];
    }

    // 5. Extração baseada em padrões proativos de nome na mensagem do usuário
    const nameIntroRegex = /(?:meu\s+nome\s+é|meu\s+nome\s+eh|eu\s+sou|me\s+chamo|chamo-me)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+){1,4})/i;
    const nameIntroMatch = text.match(nameIntroRegex);
    if (nameIntroMatch && nameIntroMatch[1]) {
      updatedVars.nome = nameIntroMatch[1].trim();
    }

    // 6. Extração baseada no contexto da última pergunta do Assistente (IA)
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length > 0) {
      const lastAssistantMsg = assistantMessages[assistantMessages.length - 1].text.toLowerCase();

      // Se a IA perguntou o nome completo do cliente
      if (lastAssistantMsg.includes('nome completo') || lastAssistantMsg.includes('seu nome')) {
        let nameCandidate = text;
        const cleanupPrefixes = [
          /meu\s+nome\s+é\s+/gi,
          /meu\s+nome\s+eh\s+/gi,
          /eu\s+sou\s+/gi,
          /chamo-me\s+/gi,
          /me\s+chamo\s+/gi
        ];
        for (const regex of cleanupPrefixes) {
          nameCandidate = nameCandidate.replace(regex, '');
        }
        nameCandidate = nameCandidate.trim();
        // Evita salvar strings muito longas ou com muitas palavras como nome
        if (nameCandidate.length > 0 && nameCandidate.split(/\s+/).length <= 5) {
          updatedVars.nome = nameCandidate;
        }
      }
    }

    setClientVars(updatedVars);
    return updatedVars;
  };

  const redactTextWithVars = (text, vars) => {
    if (!text) return '';
    let res = text;

    // Normalizador de e-mail conversacional antes de aplicar redação
    res = res
      .replace(/\s*(?:arroba|@)\s*/gi, '@')
      .replace(/\s*(?:ponto|\.)\s*/gi, '.')
      .replace(/\s+/g, ' ');

    if (vars.email) {
      const escapedEmail = vars.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      res = res.replace(new RegExp(escapedEmail, 'gi'), '{email}');
    }
    if (vars.nome) {
      const escapedNome = vars.nome.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      res = res.replace(new RegExp(escapedNome, 'gi'), '{nome}');
    }
    if (vars.numero_pedido) {
      const escapedPedido = vars.numero_pedido.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      res = res.replace(new RegExp(escapedPedido, 'gi'), '{numero_pedido}');
    }
    if (vars.protocolo) {
      const escapedProto = vars.protocolo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      res = res.replace(new RegExp(escapedProto, 'gi'), '{protocolo}');
    }
    return res;
  };

  const resolveDataPlaceholders = (dataObj, vars) => {
    if (!dataObj) return null;
    const resolved = { ...dataObj };
    for (const key in resolved) {
      if (typeof resolved[key] === 'string') {
        let val = resolved[key];
        val = val.replace(/\{(?:variables\.)?nome\}/gi, vars.nome || '');
        val = val.replace(/\{(?:variables\.)?email\}/gi, vars.email || '');
        val = val.replace(/\{(?:variables\.)?numero_pedido\}/gi, vars.numero_pedido || '');
        val = val.replace(/\{(?:variables\.)?protocolo\}/gi, vars.protocolo || '');
        resolved[key] = val;
      }
    }
    return resolved;
  };

  // Dashboard Calculations
  const totalQueueTickets = queueTickets.length;
  
  // Calculate regional counts
  let countRJ = 0;
  let countPE = 0;
  let countMG = 0;
  let countOther = 0;

  // Track SLA and TMA
  let metSlaCount = 0;
  let totalSlaCount = 0;
  let totalTmaMinutes = 0;
  let tmaCount = 0;

  queueTickets.forEach(t => {
    // Location check
    const loc = (t.location || '').toUpperCase();
    if (loc.includes('RJ') || loc.includes('RIO')) {
      countRJ++;
    } else if (loc.includes('PE') || loc.includes('RECIFE')) {
      countPE++;
    } else if (loc.includes('MG') || loc.includes('BELO')) {
      countMG++;
    } else {
      countOther++;
    }

    // SLA check: if made_sla is undefined or "true", it met SLA.
    // If it's explicitly "false" or false, it missed SLA.
    if (t.made_sla === 'false' || t.made_sla === false) {
      // missed
    } else {
      metSlaCount++;
    }
    totalSlaCount++;

    // TMA calculation
    const createdTime = new Date(t.data);
    if (!isNaN(createdTime.getTime())) {
      const now = new Date();
      const diffMs = now - createdTime;
      const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      totalTmaMinutes += Math.min(1440, diffMins); // cap at 24 hours for open ticket TMA representation
      tmaCount++;
    }
  });

  const pctRJ = totalQueueTickets > 0 ? Math.round((countRJ / totalQueueTickets) * 100) : 0;
  const pctPE = totalQueueTickets > 0 ? Math.round((countPE / totalQueueTickets) * 100) : 0;
  const pctMG = totalQueueTickets > 0 ? Math.round((countMG / totalQueueTickets) * 100) : 0;
  const pctOther = totalQueueTickets > 0 ? Math.round((countOther / totalQueueTickets) * 100) : 0;

  const slaPercentage = totalSlaCount > 0 ? ((metSlaCount / totalSlaCount) * 100).toFixed(1) : '100.0';
  
  // Calculate average TMA in minutes
  const calculatedTma = tmaCount > 0 ? Math.round(totalTmaMinutes / tmaCount) : 0;
  let tmaText = '18.4 min'; // Fallback
  if (calculatedTma > 0) {
    if (calculatedTma < 60) {
      tmaText = `${calculatedTma} min`;
    } else {
      const hours = Math.floor(calculatedTma / 60);
      const mins = calculatedTma % 60;
      tmaText = `${hours}h ${mins}m`;
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Modals */}
      {showNPS && protocol && (
        <NPSModal
          protocolo={protocol}
          onSubmit={() => setShowNPS(false)}
          onClose={() => setShowNPS(false)}
        />
      )}


      {/* Sidebar Overlay (Mobile Only) */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Animated sidebar shimmer — decorative */}
        <div className="sidebar-animated-bg" aria-hidden="true" />
        <div className="sidebar-header" onClick={onBack} style={{ cursor: 'pointer' }} title="Voltar para a Home">
          <img
            src="/logoServiceFlow.png"
            alt="ServiceFlow Logo"
            className="logo-mark"
          />
          <span className="sidebar-logo-text">{CONFIG.brand.name}</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined nav-icon">
              dashboard
            </span>{' '}
            Visão Geral
          </button>
          <button
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined nav-icon">
              smart_toy
            </span>{' '}
            Assistente de IA
          </button>

          {roles.includes('sf_cliente') && (
            <button
              className={`nav-item ${activeTab === 'mycases' ? 'active' : ''}`}
              onClick={() => { setActiveTab('mycases'); setSidebarOpen(false); }}
            >
              <span className="material-symbols-outlined nav-icon">
                confirmation_number
              </span>{' '}
              Meus Chamados
            </button>
          )}

          {(roles.includes('sf_atendente') || roles.includes('sf_admin')) && (
            <button
              className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => { setActiveTab('queue'); setSidebarOpen(false); }}
            >
              <span className="material-symbols-outlined nav-icon">
                assignment
              </span>{' '}
              Fila de Chamados
            </button>
          )}

          {roles.includes('sf_admin') && (
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            >
              <span className="material-symbols-outlined nav-icon">
                monitoring
              </span>{' '}
              Dashboard
            </button>
          )}

          <button
            className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => { setActiveTab('help'); setSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined nav-icon">help</span>{' '}
            Ajuda
          </button>
        </nav>

        <div className="sidebar-footer">
          {user?.email && (
            <div className="sidebar-user-info">
              <span className="material-symbols-outlined sidebar-user-icon">account_circle</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
          )}
          <button
            className="nav-item btn-logout"
            onClick={() => { onBack(); setSidebarOpen(false); }}
            title="Voltar (Sair)"
          >
            <span className="material-symbols-outlined nav-icon">logout</span>{' '}
            Sair
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="chat-page">
        {activeTab === 'overview' ? (
          <div className="portal-overview">
            <div className="portal-header-top">
              <button
                className="btn-icon mobile-menu-toggle-btn"
                onClick={() => setSidebarOpen(true)}
                title="Abrir menu"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2>Portal de Entrada</h2>
            </div>

            <div className="portal-content">
              <h1>Olá! Precisa de ajuda com um pedido?</h1>
              <p className="portal-subtitle">
                Estamos aqui para garantir que sua experiência seja perfeita.
                Selecione uma opção abaixo para começar.
              </p>

              <div className="portal-quick-actions">
                <button
                  className="quick-card"
                  onClick={() => startChatWithMessage('Problema com produto')}
                >
                  <span className="material-symbols-outlined card-icon">
                    error
                  </span>
                  <h3>Problema com produto</h3>
                  <p>Relate defeitos ou itens faltantes em sua entrega.</p>
                </button>
                <button
                  className="quick-card"
                  onClick={() => startChatWithMessage('Solicitar troca')}
                >
                  <span className="material-symbols-outlined card-icon">
                    swap_horiz
                  </span>
                  <h3>Solicitar troca</h3>
                  <p>Não serviu? Troque seu produto de forma simples.</p>
                </button>
                <button
                  className="quick-card"
                  onClick={() => startChatWithMessage('Solicitar reembolso')}
                >
                  <span className="material-symbols-outlined card-icon">
                    payments
                  </span>
                  <h3>Solicitar reembolso</h3>
                  <p>Peça a devolução do valor pago em sua conta.</p>
                </button>
                <button
                  className="quick-card"
                  onClick={() => startChatWithMessage('Acompanhar protocolo')}
                >
                  <span className="material-symbols-outlined card-icon">
                    search
                  </span>
                  <h3>Acompanhar protocolo</h3>
                  <p>Veja o status de solicitações já realizadas.</p>
                </button>
              </div>

              <div className="portal-ai-section">
                <h3>Fale com nossa Inteligência Artificial</h3>
                <p className="portal-ai-desc">
                  Dúvidas rápidas sobre prazos, entregas ou políticas? Nossa IA
                  resolve em segundos.
                </p>

                <div className="chat-input-area portal-chat-input">
                  <div className="input-wrapper">
                    {hasSpeechSupport && (
                      <button
                        className={`mic-btn ${isListening ? 'mic-active' : ''}`}
                        onClick={() => toggleListening('overview')}
                        title={isListening ? 'Parar gravação' : 'Falar por voz'}
                        type="button"
                      >
                        <span className="material-symbols-outlined">
                          {isListening ? 'mic' : 'mic_none'}
                        </span>
                      </button>
                    )}
                    <textarea
                      ref={portalInputRef}
                      className="chat-input"
                      placeholder="Digite sua mensagem para a Sofia..."
                      value={portalInput}
                      onChange={(e) => {
                        setPortalInput(e.target.value);
                        resizeTextarea(e.target);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePortalSubmit();
                        }
                      }}
                      rows={1}
                    />
                    <button
                      className="send-btn"
                      onClick={handlePortalSubmit}
                      disabled={!portalInput.trim()}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <p className="input-hint">
                    Enter para enviar · Shift+Enter para nova linha
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'mycases' ? (
          <MyCasesPage
            userEmail={user?.email || ''}
            onNewChat={() => startChatWithMessage('Quero abrir um novo chamado')}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        ) : activeTab === 'queue' ? (
          <div className="mycases-root">
            <div className="mycases-header">
              <div className="mycases-header-title">
                <button className="btn-icon mobile-menu-toggle-btn" onClick={() => setSidebarOpen(true)} style={{ marginRight: '0.75rem', background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }} title="Abrir menu">
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <span className="material-symbols-outlined mycases-header-icon">assignment</span>
                <div>
                  <h2>Fila Geral de Chamados</h2>
                  <p className="mycases-email">Módulo de Atendimento — Roles: {roles.join(', ')}</p>
                </div>
              </div>
              <button className="mycases-btn-new" onClick={fetchQueue} title="Atualizar Fila">
                <span className="material-symbols-outlined">refresh</span>
                Atualizar
              </button>
            </div>

            {queueLoading ? (
              <div className="mycases-loading">
                <div className="mycases-spinner" />
                <p>Carregando chamados da fila...</p>
              </div>
            ) : queueTickets.length === 0 ? (
              <div className="mycases-empty">
                <span className="material-symbols-outlined mycases-empty-icon" style={{ fontSize: '3rem' }}>assignment_late</span>
                <h3>Nenhum chamado pendente na fila</h3>
                <p>Bom trabalho! Todos os chamados do ServiceNow foram atendidos.</p>
              </div>
            ) : (
              <div className="mycases-list">
                {queueTickets.map((t) => {
                  const id = t.protocolo || t.number || Math.random();
                  const isExpanded = expandedQueueId === id;
                  return (
                    <div key={id} className={`case-card ${isExpanded ? 'case-card--expanded' : ''}`} onClick={() => setExpandedQueueId(isExpanded ? null : id)}>
                      <div className="case-card-main">
                        <div className="case-icon-wrap">
                          <span className="material-symbols-outlined case-icon">support_agent</span>
                        </div>
                        <div className="case-info">
                          <div className="case-info-top">
                            <span className="case-protocol">{t.protocolo || t.number}</span>
                            <span className={`case-status-badge ${['6', 'Resolvido', 'Resolved', 'Work in Progress (Resolved)'].includes(t.status) ? 'status-resolved' : ['2', 'Em andamento', 'Work in Progress'].includes(t.status) ? 'status-inprogress' : 'status-new'}`}>
                              {['6', 'Resolvido', 'Resolved'].includes(t.status) ? 'Resolvido' : ['2', 'Em andamento', 'Work in Progress'].includes(t.status) ? 'Em andamento' : 'Novo'}
                            </span>
                          </div>
                          <p className="case-produto"><strong>Cliente:</strong> {t.nome_do_cliente || t.email} | <strong>Produto:</strong> {t.produto}</p>
                          <p className="case-date">{t.tipo} | {t.data ? new Date(t.data).toLocaleDateString('pt-BR') : 'Sem data'}</p>
                        </div>
                        <span className={`material-symbols-outlined case-chevron ${isExpanded ? 'case-chevron--open' : ''}`}>expand_more</span>
                      </div>

                      {isExpanded && (
                        <div className="case-details" onClick={(e) => e.stopPropagation()}>
                          <div className="case-details-inner" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', padding: '0 0.5rem 1rem' }}>
                            <div className="case-detail-item case-detail-full">
                              <span className="case-detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Descrição do Chamado</span>
                              <span className="case-detail-value" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--on-surface)' }}>{t.descricao}</span>
                            </div>
                            {t.numero_serie && (
                              <div className="case-detail-item">
                                <span className="case-detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Número de Série</span>
                                <span className="case-detail-value" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--on-surface)' }}>{t.numero_serie}</span>
                              </div>
                            )}
                            {t.nota_fiscal && (
                              <div className="case-detail-item">
                                <span className="case-detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Nota Fiscal</span>
                                <span className="case-detail-value" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--on-surface)' }}>{t.nota_fiscal}</span>
                              </div>
                            )}
                            
                            {permissions.canWrite ? (
                              <div className="case-actions-section" style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--outline-variant)', paddingTop: '0.75rem' }}>
                                <span className="case-detail-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ações de Atendimento (ACL: canWrite)</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button 
                                    className="mycases-btn-new" 
                                    style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', padding: '0.375rem 0.75rem', fontSize: '0.85rem' }}
                                    onClick={async () => {
                                      setUpdatingTicketId(id);
                                      await handleUpdateTicketStatus(t.protocolo, '2');
                                      await fetchQueue();
                                      setUpdatingTicketId(null);
                                    }}
                                    disabled={updatingTicketId === id}
                                  >
                                    Marcar Em Andamento
                                  </button>
                                  <button 
                                    className="mycases-btn-new"
                                    style={{ background: 'var(--primary)', color: 'white', padding: '0.375rem 0.75rem', fontSize: '0.85rem' }}
                                    onClick={async () => {
                                      setUpdatingTicketId(id);
                                      await handleUpdateTicketStatus(t.protocolo, '6');
                                      await fetchQueue();
                                      setUpdatingTicketId(null);
                                    }}
                                    disabled={updatingTicketId === id}
                                  >
                                    Resolver Chamado
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                                🔒 Apenas leitura (Permissão bloqueada pelas ACLs do ServiceNow).
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="mycases-root">
            <div className="mycases-header">
              <div className="mycases-header-title">
                <button className="btn-icon mobile-menu-toggle-btn" onClick={() => setSidebarOpen(true)} style={{ marginRight: '0.75rem', background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }} title="Abrir menu">
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <span className="material-symbols-outlined mycases-header-icon">monitoring</span>
                <div>
                  <h2>Painel Operacional (Supervisor)</h2>
                  <p className="mycases-email">Dashboard Geral de SLA e Atendimento (Real-time ServiceNow)</p>
                </div>
              </div>
              <button className="mycases-btn-new" onClick={fetchQueue} title="Atualizar Painel" disabled={queueLoading}>
                <span className="material-symbols-outlined">refresh</span>
                Atualizar
              </button>
            </div>

            {queueLoading ? (
              <div className="mycases-loading">
                <div className="mycases-spinner" />
                <p>Calculando métricas em tempo real com o ServiceNow...</p>
              </div>
            ) : (
              <div className="portal-content" style={{ padding: '1.5rem 0 3rem' }}>
                <div className="portal-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', margin: 0, padding: 0, overflowX: 'visible', scrollSnapType: 'none' }}>
                  <div className="quick-card" style={{ flex: 'none' }}>
                    <span className="material-symbols-outlined card-icon">hourglass_empty</span>
                    <h3>{slaPercentage}%</h3>
                    <p>SLA de Resolução Dentro do Prazo</p>
                  </div>
                  <div className="quick-card" style={{ flex: 'none' }}>
                    <span className="material-symbols-outlined card-icon">bolt</span>
                    <h3>{tmaText}</h3>
                    <p>Tempo Médio de Atendimento (TMA)</p>
                  </div>
                  <div className="quick-card" style={{ flex: 'none' }}>
                    <span className="material-symbols-outlined card-icon">assignment_turned_in</span>
                    <h3>{totalQueueTickets}</h3>
                    <p>Total de Chamados na Fila</p>
                  </div>
                </div>

                <div className="portal-ai-section" style={{ textAlign: 'left', marginTop: '1.5rem', padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Distribuição de Chamados por Filial Regional</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span><strong>ServiceFlow - RJ (Rio de Janeiro)</strong></span>
                        <span>{countRJ} chamados ({pctRJ}%)</span>
                      </div>
                      <div style={{ background: 'var(--surface-container-high)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary)', width: `${pctRJ}%`, height: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span><strong>ServiceFlow - PE (Recife)</strong></span>
                        <span>{countPE} chamados ({pctPE}%)</span>
                      </div>
                      <div style={{ background: 'var(--surface-container-high)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary-dim, var(--primary))', width: `${pctPE}%`, height: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span><strong>ServiceFlow - MG (Belo Horizonte)</strong></span>
                        <span>{countMG} chamados ({pctMG}%)</span>
                      </div>
                      <div style={{ background: 'var(--surface-container-high)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--outline)', width: `${pctMG}%`, height: '100%' }} />
                      </div>
                    </div>

                    {countOther > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          <span><strong>Outras Localidades</strong></span>
                          <span>{countOther} chamados ({pctOther}%)</span>
                        </div>
                        <div style={{ background: 'var(--surface-container-high)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ background: 'var(--outline-variant)', width: `${pctOther}%`, height: '100%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'help' ? (
          <HelpPage
            userRoles={roles}
            onOpenChat={startChatWithMessage}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="chat-centered-container">
            {/* Chat Header */}
            <header className="chat-header">
              <div className="chat-header-left">
                <button
                  className="btn-icon mobile-menu-toggle-btn"
                  onClick={() => setSidebarOpen(true)}
                  title="Abrir menu"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="ai-avatar">
                  <span
                    className="material-symbols-outlined ai-avatar-icon"
                    style={{ fontSize: '1.25rem' }}
                  >
                    auto_awesome
                  </span>
                  <span className="ai-avatar-pulse" />
                </div>
                <div className="ai-info">
                  <h2 className="ai-name">{CONFIG.brand.aiName}</h2>
                  <p className="ai-status">
                    {isLoading ? (
                      <span className="status-thinking">
                        pensando
                        <span className="dots" />
                      </span>
                    ) : (
                      <span className="status-online">● online agora</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="chat-header-right">
                {ticketStatus === 'success' && (
                  <div className="protocol-badge">
                    <span
                      className="material-symbols-outlined protocol-icon"
                      style={{ fontSize: '1.1rem' }}
                    >
                      confirmation_number
                    </span>
                    <span>{protocol}</span>
                  </div>
                )}
                <button
                  className="btn-icon"
                  onClick={resetChat}
                  title="Nova conversa"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="msg-avatar">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '1rem' }}
                      >
                        auto_awesome
                      </span>
                    </div>
                  )}
                  <div
                    className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'} ${msg.isProtocol ? 'protocol-bubble' : ''}`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="message-attachments">
                        {msg.attachments.map((att, i) => (
                          <img
                            key={i}
                            src={att.base64}
                            alt={att.name}
                            className="bubble-attachment"
                            onClick={() => window.open(att.base64, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    <div className="message-text">{renderText(msg.text)}</div>
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-row assistant-row">
                  <div className="msg-avatar">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '1rem' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <div className="message-bubble assistant-bubble typing-bubble">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {/* Confirm Dialog */}
              {showConfirm && pendingData && (
                <div className="confirm-card">
                  <div className="confirm-header">
                    <span className="material-symbols-outlined confirm-icon">
                      list_alt
                    </span>
                    <h3>Confirme seus dados</h3>
                  </div>
                  <div className="confirm-fields">
                    {Object.entries(pendingData).map(([key, val]) => (
                      <div key={key} className="confirm-field">
                        <span className="confirm-label">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="confirm-value">{val}</span>
                      </div>
                    ))}
                    {pendingAttachments.length > 0 && (
                      <div className="confirm-field">
                        <span className="confirm-label">fotos anexadas</span>
                        <div className="confirm-attachments-preview">
                          {pendingAttachments.map((att, i) => (
                            <img key={i} src={att.base64} alt={att.name} className="confirm-thumb" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="confirm-actions">
                    <button className="btn-cancel" onClick={handleCancelTicket}>
                      Corrigir
                    </button>
                    <button
                      className="btn-confirm"
                      onClick={handleConfirmTicket}
                    >
                      Abrir Chamado ✓
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  {attachments.map((att) => (
                    <div key={att.id} className="attachment-card">
                      <img src={att.base64} alt="preview" />
                      <button
                        className="remove-att"
                        onClick={() => removeAttachment(att.id)}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="input-wrapper">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Anexar imagem (máx 3)"
                  disabled={
                    isLoading ||
                    ticketStatus === 'pending' ||
                    attachments.length >= 3
                  }
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                {hasSpeechSupport && (
                  <button
                    id="mic-btn"
                    className={`mic-btn ${isListening ? 'mic-active' : ''}`}
                    onClick={() => toggleListening('chat')}
                    title={isListening ? 'Parar gravação' : 'Falar por voz'}
                    type="button"
                    disabled={ticketStatus === 'pending'}
                  >
                    <span className="material-symbols-outlined">
                      {isListening ? 'mic' : 'mic_none'}
                    </span>
                  </button>
                )}
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  className="chat-input"
                  placeholder={PLACEHOLDER_SUGGESTIONS[placeholderIndex]}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    resizeTextarea(e.target);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || ticketStatus === 'pending'}
                  rows={1}
                />
                <button
                  id="send-btn"
                  className="send-btn"
                  onClick={handleSend}
                  disabled={
                    (!input.trim() && attachments.length === 0) || isLoading
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="input-hint">
                Enter para enviar · Shift+Enter para nova linha
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
