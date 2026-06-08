import { useState, useEffect } from 'react';
import './MyCasesPage.css';

const STATUS_MAP = {
  '1': { label: 'Novo', color: 'status-new' },
  '2': { label: 'Em andamento', color: 'status-inprogress' },
  '3': { label: 'Em espera', color: 'status-onhold' },
  '6': { label: 'Resolvido', color: 'status-resolved' },
  '7': { label: 'Encerrado', color: 'status-closed' },
  'Novo': { label: 'Novo', color: 'status-new' },
  'Em andamento': { label: 'Em andamento', color: 'status-inprogress' },
  'Resolvido': { label: 'Resolvido', color: 'status-resolved' },
  'Encerrado': { label: 'Encerrado', color: 'status-closed' },
};

const TIPO_ICON = {
  'Troca': 'swap_horiz',
  'Devolução': 'undo',
  'Garantia': 'verified_user',
  'Reclamação': 'report',
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status || 'Aberto', color: 'status-new' };
  return <span className={`case-status-badge ${s.color}`}>{s.label}</span>;
}

export default function MyCasesPage({ userEmail, onNewChat }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/meus_chamados?email=${encodeURIComponent(userEmail)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // ServiceNow retorna { result: [...] }
        const list = Array.isArray(data) ? data : (data.result || []);
        setCases(list);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="mycases-root">
        <div className="mycases-loading">
          <div className="mycases-spinner" />
          <p>Buscando seus chamados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mycases-root">
        <div className="mycases-error">
          <span className="material-symbols-outlined mycases-error-icon">error_outline</span>
          <h3>Não foi possível carregar seus chamados</h3>
          <p>{error}</p>
          <button className="mycases-btn-retry" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mycases-root">
      {/* Header */}
      <div className="mycases-header">
        <div className="mycases-header-title">
          <span className="material-symbols-outlined mycases-header-icon">confirmation_number</span>
          <div>
            <h2>Meus Chamados</h2>
            <p className="mycases-email">{userEmail}</p>
          </div>
        </div>
        <button className="mycases-btn-new" onClick={onNewChat} id="new-case-btn">
          <span className="material-symbols-outlined">add</span>
          Novo Chamado
        </button>
      </div>

      {/* Resumo rápido */}
      {cases.length > 0 && (
        <div className="mycases-summary">
          <div className="summary-chip">
            <span className="summary-num">{cases.length}</span>
            <span>Total</span>
          </div>
          <div className="summary-chip">
            <span className="summary-num summary-open">
              {cases.filter(c => !['6','7','Resolvido','Encerrado'].includes(c.status || c.state)).length}
            </span>
            <span>Em aberto</span>
          </div>
          <div className="summary-chip">
            <span className="summary-num summary-done">
              {cases.filter(c => ['6','7','Resolvido','Encerrado'].includes(c.status || c.state)).length}
            </span>
            <span>Concluídos</span>
          </div>
        </div>
      )}

      {/* Lista */}
      {cases.length === 0 ? (
        <div className="mycases-empty">
          <div className="mycases-empty-icon-wrap">
            <span className="material-symbols-outlined mycases-empty-icon">inbox</span>
          </div>
          <h3>Nenhum chamado encontrado</h3>
          <p>Você ainda não abriu nenhum chamado com este e-mail.</p>
          <button className="mycases-btn-new" onClick={onNewChat} id="first-case-btn">
            <span className="material-symbols-outlined">add</span>
            Abrir primeiro chamado
          </button>
        </div>
      ) : (
        <div className="mycases-list">
          {cases.map((c) => {
            const id = c.protocolo || c.number || c.sys_id || Math.random();
            const isExpanded = expandedId === id;
            const icon = TIPO_ICON[c.tipo || c.type] || 'support_agent';
            const dateRaw = c.data || c.opened_at || c.sys_created_on;
            const dateStr = dateRaw
              ? new Date(dateRaw).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';

            return (
              <div
                key={id}
                className={`case-card ${isExpanded ? 'case-card--expanded' : ''}`}
                onClick={() => toggleExpand(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleExpand(id)}
              >
                <div className="case-card-main">
                  <div className="case-icon-wrap">
                    <span className="material-symbols-outlined case-icon">{icon}</span>
                  </div>
                  <div className="case-info">
                    <div className="case-info-top">
                      <span className="case-protocol">{c.protocolo || c.number || 'Protocolo'}</span>
                      <StatusBadge status={c.status || c.state} />
                    </div>
                    <p className="case-produto">{c.produto || c.product || 'Produto não informado'}</p>
                    <p className="case-date">{dateStr}</p>
                  </div>
                  <span
                    className={`material-symbols-outlined case-chevron ${isExpanded ? 'case-chevron--open' : ''}`}
                  >
                    expand_more
                  </span>
                </div>

                {isExpanded && (
                  <div className="case-details">
                    <div className="case-detail-grid">
                      {c.tipo && (
                        <div className="case-detail-item">
                          <span className="case-detail-label">Tipo</span>
                          <span className="case-detail-value">{c.tipo}</span>
                        </div>
                      )}
                      {c.numero_pedido && (
                        <div className="case-detail-item">
                          <span className="case-detail-label">Pedido</span>
                          <span className="case-detail-value">{c.numero_pedido}</span>
                        </div>
                      )}
                      {(c.descricao || c.description) && (
                        <div className="case-detail-item case-detail-full">
                          <span className="case-detail-label">Descrição</span>
                          <span className="case-detail-value">{c.descricao || c.description}</span>
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
  );
}
