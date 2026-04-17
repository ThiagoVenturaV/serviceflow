import { useState, useRef, useEffect } from 'react';
import { sendMessage, extractCollectedData, cleanMessageText } from '../services/groqService.js';
import { createTicket } from '../services/serviceNowService.js';
import { CONFIG } from '../config.js';
import './ChatPage.css';

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  text: `Olá! Sou ${CONFIG.brand.aiName}, sua assistente de atendimento. 😊\n\nEstou aqui para te ajudar com qualquer solicitação pós-venda — trocas, devoluções, garantias ou reclamações.\n\nPor onde começamos? Me conta o que está acontecendo!`,
  timestamp: new Date(),
};

const PLACEHOLDER_SUGGESTIONS = [
  "Digite sua mensagem...",
  "Quero fazer uma devolução...",
  "Meu pedido veio com defeito...",
  "Preciso acionar a garantia...",
  "Qual o status do meu pedido?",
  "Recebi o produto errado..."
];

export default function ChatPage({ onBack }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null); // null | 'pending' | 'success' | 'error'
  const [protocol, setProtocol] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [portalInput, setPortalInput] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // ── Speech Recognition Initialization ──────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setHasSpeechSupport(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (activeTabRef.current === 'overview') {
        setPortalInput(prev => prev ? `${prev} ${transcript}` : transcript);
      } else {
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error('SpeechRecognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => { recognition.abort(); };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ── Placeholder rotation ─────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (!input && !isLoading) {
      interval = setInterval(() => {
        setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length);
      }, 3500);
    } else {
      setPlaceholderIndex(0);
    }
    return () => clearInterval(interval);
  }, [input, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text, extra = {}) => {
    const msg = { id: Date.now(), role, text, timestamp: new Date(), ...extra };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      history.push({ role: 'user', content: userText });

      const aiResponse = await sendMessage(history);
      const data = extractCollectedData(aiResponse);
      const displayText = cleanMessageText(aiResponse);

      if (data) {
        setPendingData(data);
        setShowConfirm(true);
      }

      addMessage('assistant', displayText || aiResponse);
    } catch (err) {
      addMessage('assistant', '❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleConfirmTicket = async () => {
    setShowConfirm(false);
    setTicketStatus('pending');
    addMessage('assistant', '⏳ Aguarde um momento, estou abrindo seu chamado...');

    try {
      const result = await createTicket(pendingData);
      const proto = result?.protocolo || result?.result?.protocolo || `SF-${Date.now()}`;
      setProtocol(proto);
      setTicketStatus('success');
      setCollectedData(pendingData);
      addMessage('assistant', `✅ Perfeito! Seu chamado foi aberto com sucesso!\n\n📋 **Protocolo: ${proto}**\n\nGuarde esse número — você pode usá-lo para acompanhar o status. Enviaremos atualizações no email ${pendingData.email}. Posso ajudar com mais alguma coisa?`, { isProtocol: true, protocol: proto });
    } catch (err) {
      setTicketStatus('error');
      addMessage('assistant', `❌ Não foi possível abrir o chamado no momento. Por favor, tente novamente em alguns instantes.\n\nErro: ${err.message}`);
    }

    setPendingData(null);
  };

  const handleCancelTicket = () => {
    setShowConfirm(false);
    addMessage('assistant', 'Tudo bem! Posso fazer alguma correção nos dados? Me diga o que precisar ajustar.');
    setPendingData(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startChatWithMessage = (initialMsg) => {
    setActiveTab('chat');
    if (initialMsg) {
       // Mock the user typing it
       setTimeout(() => {
         // This is a simplified way to trigger send.
         setInput(initialMsg);
       }, 50);
    }
  };

  // When input is set from portal, trigger send if in chat
  useEffect(() => {
    if (activeTab === 'chat' && input && messages.length === 1 && input !== '') {
      handleSend();
    }
  }, [activeTab, input]);

  const handlePortalSubmit = () => {
    if (portalInput.trim()) {
      startChatWithMessage(portalInput);
      setPortalInput('');
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setCollectedData(null);
    setTicketStatus(null);
    setProtocol(null);
    setShowConfirm(false);
    setPendingData(null);
  };

  const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine || '&nbsp;' }} />;
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar (Desktop Only) */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
           <img src="/logoServiceFlow.png" alt="ServiceFlow Logo" className="logo-mark" />
           <span className="sidebar-logo-text">{CONFIG.brand.name}</span>
        </div>
        
        <nav className="sidebar-nav">
           <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
             <span className="material-symbols-outlined nav-icon">dashboard</span> Visão Geral
           </button>
           <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
             <span className="material-symbols-outlined nav-icon">smart_toy</span> Assistente de IA
           </button>
           <button className="nav-item">
             <span className="material-symbols-outlined nav-icon">confirmation_number</span> Meus Casos
           </button>
           <button className="nav-item">
             <span className="material-symbols-outlined nav-icon">star</span> Feedback
           </button>
        </nav>

        <div className="sidebar-footer">
           <button className="nav-item"><span className="material-symbols-outlined nav-icon">help</span> Ajuda</button>
           <button className="nav-item btn-logout" onClick={onBack} title="Voltar (Sair)"><span className="material-symbols-outlined nav-icon">logout</span> Sair</button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="chat-page">
        {activeTab === 'overview' ? (
           <div className="portal-overview">
             <div className="portal-header-top">
                <button className="btn-icon mobile-back-btn" onClick={onBack} title="Sair">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2>Portal de Entrada</h2>
             </div>
             
             <div className="portal-content">
               <h1>Olá! Precisa de ajuda com um pedido?</h1>
               <p className="portal-subtitle">Estamos aqui para garantir que sua experiência seja perfeita. Selecione uma opção abaixo para começar.</p>
               
               <div className="portal-quick-actions">
                 <button className="quick-card" onClick={() => startChatWithMessage('Problema com produto')}>
                   <span className="material-symbols-outlined card-icon">error</span>
                   <h3>Problema com produto</h3>
                   <p>Relate defeitos ou itens faltantes em sua entrega.</p>
                 </button>
                 <button className="quick-card" onClick={() => startChatWithMessage('Solicitar troca')}>
                   <span className="material-symbols-outlined card-icon">swap_horiz</span>
                   <h3>Solicitar troca</h3>
                   <p>Não serviu? Troque seu produto de forma simples.</p>
                 </button>
                 <button className="quick-card" onClick={() => startChatWithMessage('Solicitar reembolso')}>
                   <span className="material-symbols-outlined card-icon">payments</span>
                   <h3>Solicitar reembolso</h3>
                   <p>Peça a devolução do valor pago em sua conta.</p>
                 </button>
                 <button className="quick-card" onClick={() => startChatWithMessage('Acompanhar protocolo')}>
                   <span className="material-symbols-outlined card-icon">search</span>
                   <h3>Acompanhar protocolo</h3>
                   <p>Veja o status de solicitações já realizadas.</p>
                 </button>
               </div>

               <div className="portal-ai-section">
                 <h3>Fale com nossa Inteligência Artificial</h3>
                 <p className="portal-ai-desc">Dúvidas rápidas sobre prazos, entregas ou políticas? Nossa IA resolve em segundos.</p>
                 
                 <div className="chat-input-area portal-chat-input">
                    <div className="input-wrapper">
                      {hasSpeechSupport && (
                        <button
                          className={`mic-btn ${isListening ? 'mic-active' : ''}`}
                          onClick={toggleListening}
                          title={isListening ? 'Parar gravação' : 'Falar por voz'}
                          type="button"
                        >
                          <span className="material-symbols-outlined">
                            {isListening ? 'mic' : 'mic_none'}
                          </span>
                        </button>
                      )}
                      <textarea
                        className="chat-input"
                        placeholder="Digite sua mensagem para a Sofia..."
                        value={portalInput}
                        onChange={(e) => setPortalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePortalSubmit(); }
                        }}
                        rows={1}
                      />
                      <button className="send-btn" onClick={handlePortalSubmit} disabled={!portalInput.trim()}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </div>
                    <p className="input-hint">Enter para enviar · Shift+Enter para nova linha</p>
                 </div>
               </div>
             </div>
           </div>
        ) : (
          <div className="chat-centered-container">
            {/* Chat Header */}
            <header className="chat-header">
              <div className="chat-header-left">
                <button className="btn-icon mobile-back-btn" onClick={() => setActiveTab('overview')} title="Voltar ao Portal">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="ai-avatar">
                  <span className="material-symbols-outlined ai-avatar-icon" style={{ fontSize: '1.25rem' }}>auto_awesome</span>
                  <span className="ai-avatar-pulse" />
                </div>
                <div className="ai-info">
                  <h2 className="ai-name">{CONFIG.brand.aiName}</h2>
                  <p className="ai-status">
                    {isLoading ? (
                      <span className="status-thinking">pensando<span className="dots" /></span>
                    ) : (
                      <span className="status-online">● online agora</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="chat-header-right">
                {ticketStatus === 'success' && (
                  <div className="protocol-badge">
                    <span className="material-symbols-outlined protocol-icon" style={{ fontSize: '1.1rem' }}>confirmation_number</span>
                    <span>{protocol}</span>
                  </div>
                )}
                <button className="btn-icon" onClick={resetChat} title="Nova conversa">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="msg-avatar"><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>auto_awesome</span></div>
                  )}
                  <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'} ${msg.isProtocol ? 'protocol-bubble' : ''}`}>
                    <div className="message-text">{renderText(msg.text)}</div>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-row assistant-row">
                  <div className="msg-avatar"><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>auto_awesome</span></div>
                  <div className="message-bubble assistant-bubble typing-bubble">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {/* Confirm Dialog */}
              {showConfirm && pendingData && (
                <div className="confirm-card">
                  <div className="confirm-header">
                    <span className="material-symbols-outlined confirm-icon">list_alt</span>
                    <h3>Confirme seus dados</h3>
                  </div>
                  <div className="confirm-fields">
                    {Object.entries(pendingData).map(([key, val]) => (
                      <div key={key} className="confirm-field">
                        <span className="confirm-label">{key.replace('_', ' ')}</span>
                        <span className="confirm-value">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="confirm-actions">
                    <button className="btn-cancel" onClick={handleCancelTicket}>Corrigir</button>
                    <button className="btn-confirm" onClick={handleConfirmTicket}>Abrir Chamado ✓</button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <div className="input-wrapper">
                {hasSpeechSupport && (
                  <button
                    id="mic-btn"
                    className={`mic-btn ${isListening ? 'mic-active' : ''}`}
                    onClick={toggleListening}
                    title={isListening ? 'Parar gravação' : 'Falar por voz'}
                    type="button"
                    disabled={isLoading || ticketStatus === 'pending'}
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
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || ticketStatus === 'pending'}
                  rows={1}
                />
                <button
                  id="send-btn"
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="input-hint">Enter para enviar · Shift+Enter para nova linha</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navbar */}
      <nav className="mobile-bottom-nav">
         <button className={`bottom-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
           <span className="material-symbols-outlined">dashboard</span>
           <span>Visão Geral</span>
         </button>
         <button className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
           <span className="material-symbols-outlined">smart_toy</span>
           <span>Chat</span>
         </button>
         <button className="bottom-nav-item">
           <span className="material-symbols-outlined">confirmation_number</span>
           <span>Meus Casos</span>
         </button>
         <button className="bottom-nav-item" onClick={onBack}>
           <span className="material-symbols-outlined">logout</span>
           <span>Sair</span>
         </button>
      </nav>
    </div>
  );
}
