import { useState } from 'react';
import './NPSModal.css';

const STARS = [1, 2, 3, 4, 5];

const LABELS = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export default function NPSModal({ protocolo, onSubmit, onClose }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);

    try {
      await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo, nota: selected }),
      });
    } catch {
      // Falha silenciosa — NPS é secundário, não bloqueia o fluxo
    }

    setDone(true);
    setTimeout(() => onSubmit(selected), 1800);
  };

  return (
    <div className="nps-overlay" role="dialog" aria-modal="true" aria-label="Avalie o atendimento">
      <div className="nps-card">
        {!done ? (
          <>
            <div className="nps-header">
              <div className="nps-icon-wrap">
                <span className="material-symbols-outlined nps-icon">star</span>
              </div>
              <h3 className="nps-title">Como foi nosso atendimento?</h3>
              <p className="nps-subtitle">
                Seu chamado <strong>{protocolo}</strong> foi aberto com sucesso!
                Avalie nossa assistente Sofia.
              </p>
            </div>

            <div
              className="nps-stars"
              onMouseLeave={() => setHovered(0)}
              role="group"
              aria-label="Selecione uma nota de 1 a 5 estrelas"
            >
              {STARS.map((s) => (
                <button
                  key={s}
                  className={`nps-star ${s <= (hovered || selected) ? 'nps-star--active' : ''}`}
                  onMouseEnter={() => setHovered(s)}
                  onClick={() => setSelected(s)}
                  aria-label={`${s} estrela${s > 1 ? 's' : ''} — ${LABELS[s]}`}
                  id={`nps-star-${s}`}
                >
                  <span className="material-symbols-outlined">star</span>
                </button>
              ))}
            </div>

            {(hovered || selected) > 0 && (
              <p className="nps-label-text">{LABELS[hovered || selected]}</p>
            )}

            <div className="nps-actions">
              <button
                className="nps-btn-skip"
                onClick={onClose}
                id="nps-skip-btn"
              >
                Pular avaliação
              </button>
              <button
                className="nps-btn-submit"
                onClick={handleSubmit}
                disabled={!selected || submitting}
                id="nps-submit-btn"
              >
                {submitting ? (
                  <><span className="nps-spinner" /> Enviando...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Enviar</>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="nps-success">
            <div className="nps-success-icon">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <h3>Obrigado pelo feedback!</h3>
            <p>Sua avaliação nos ajuda a melhorar cada vez mais. 💜</p>
          </div>
        )}
      </div>
    </div>
  );
}
