import { useState } from 'react';
import './HelpPage.css';

const FAQ = [
  {
    q: 'Como acompanho o status do meu chamado?',
    a: 'Após abrir um chamado, você recebe um número de protocolo. Você pode consultá-lo acessando a aba "Meus Casos" ou informando o protocolo diretamente para a Sofia no chat.',
    icon: 'search',
  },
  {
    q: 'Quanto tempo leva para meu chamado ser resolvido?',
    a: 'O prazo varia conforme o tipo de solicitação: Trocas e devoluções: até 7 dias úteis. Garantia: até 15 dias úteis. Reclamações: até 3 dias úteis para retorno inicial.',
    icon: 'schedule',
  },
  {
    q: 'Posso enviar fotos do produto com defeito?',
    a: 'Sim! Durante a conversa com a Sofia, você pode anexar até 3 imagens usando o ícone de clipe 📎 ao lado do campo de mensagem. Isso agiliza muito a análise do seu caso.',
    icon: 'attach_file',
  },
  {
    q: 'Como funciona o processo de devolução?',
    a: 'Após a aprovação do chamado, você receberá as instruções de envio por e-mail. O reembolso é processado em até 5 dias úteis após recebermos o produto.',
    icon: 'undo',
  },
  {
    q: 'Posso abrir mais de um chamado?',
    a: 'Sim, cada problema deve ter seu próprio chamado para melhor rastreamento. Basta iniciar uma nova conversa com a Sofia pelo botão "Novo Chamado".',
    icon: 'add_circle',
  },
  {
    q: 'O que fazer se meu problema não estiver resolvido?',
    a: 'Você pode reabrir o chamado informando o número de protocolo à Sofia, ou entrar em contato diretamente pelo nosso e-mail de suporte escalado.',
    icon: 'support_agent',
  },
  {
    q: '🔒 [Procedimento Interno] Manual de Tratamento de Crises de Atendimento',
    a: 'Em caso de instabilidade no sistema ou atrasos em massa na entrega, acione o gerente da regional. Para tickets de Garantia de alto valor, encaminhe para o ServiceNow Senior Board.',
    icon: 'lock',
    restricted: true
  },
  {
    q: '🔒 [Procedimento Interno] Como reabrir chamados encerrados no ServiceNow',
    a: 'Acesse o ticket no ServiceNow, altere o status de "Encerrado" para "Em andamento" e adicione uma nota de trabalho (Work Note) justificando a reabertura.',
    icon: 'lock',
    restricted: true
  }
];

export default function HelpPage({ userRoles = ['sf_cliente'], onOpenChat, onOpenMenu }) {
  const isStaff = userRoles.includes('sf_atendente') || userRoles.includes('sf_admin');
  const visibleFAQ = FAQ.filter(item => !item.restricted || isStaff);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="help-root">
      {/* Header */}
      <div className="help-header">
        <div className="help-header-title">
          {onOpenMenu && (
            <button
              className="btn-icon mobile-menu-toggle-btn"
              onClick={onOpenMenu}
              title="Abrir menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
          <span className="material-symbols-outlined help-header-icon">help</span>
          <div>
            <h2>Central de Ajuda</h2>
            <p className="help-subtitle">Dúvidas frequentes sobre nosso atendimento</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="help-content-container">
        <div className="help-faq-list">
          {visibleFAQ.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`help-faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="help-faq-question"
                  onClick={() => toggleFAQ(i)}
                  aria-expanded={isOpen}
                >
                  <span className="material-symbols-outlined help-faq-icon">{item.icon}</span>
                  <span className="help-faq-question-text">{item.q}</span>
                  <span className={`material-symbols-outlined help-faq-chevron ${isOpen ? 'rotated' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`help-faq-answer-wrapper ${isOpen ? 'open' : ''}`}>
                  <p className="help-faq-answer">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="help-cta-card">
          <div className="help-cta-info">
            <h3>Ainda tem dúvidas?</h3>
            <p>Nossa assistente virtual Sofia está pronta para te atender agora mesmo.</p>
          </div>
          <button
            className="help-cta-btn"
            onClick={() => onOpenChat('Preciso de ajuda')}
            id="help-chat-btn"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            Falar com a Sofia
          </button>
        </div>
      </div>
    </div>
  );
}
