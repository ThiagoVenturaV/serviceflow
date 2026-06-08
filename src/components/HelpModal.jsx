import './HelpModal.css';

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
];

export default function HelpModal({ onClose, onOpenChat }) {
  return (
    <div className="help-overlay" role="dialog" aria-modal="true" aria-label="Central de Ajuda">
      <div className="help-card">
        {/* Header */}
        <div className="help-header">
          <div className="help-header-left">
            <div className="help-header-icon-wrap">
              <span className="material-symbols-outlined">help</span>
            </div>
            <div>
              <h2 className="help-title">Central de Ajuda</h2>
              <p className="help-subtitle">Dúvidas frequentes sobre nosso atendimento</p>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose} aria-label="Fechar ajuda" id="help-close-btn">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* FAQ */}
        <div className="help-faq-list">
          {FAQ.map((item, i) => (
            <details key={i} className="help-faq-item">
              <summary className="help-faq-question">
                <span className="material-symbols-outlined help-faq-icon">{item.icon}</span>
                <span>{item.q}</span>
                <span className="material-symbols-outlined help-faq-chevron">expand_more</span>
              </summary>
              <p className="help-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="help-cta">
          <p>Não encontrou o que procurava?</p>
          <button
            className="help-cta-btn"
            onClick={() => { onClose(); onOpenChat('Preciso de ajuda'); }}
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
