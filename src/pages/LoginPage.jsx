import { useState } from 'react';
import './LoginPage.css';

export default function LoginPage({ onLogin, onContinueAsGuest, onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerLogin = async (targetEmail) => {
    const trimmed = targetEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Busca as permissões de ACL e roles do ServiceNow para este email
      const permRes = await fetch(`/api/permissoes?email=${encodeURIComponent(trimmed)}`);
      const permissions = await permRes.json().catch(() => ({
        canRead: true,
        canWrite: false,
        canCreate: true,
        canDelete: false,
        roles: ['sf_cliente']
      }));

      // Tenta buscar chamados desse email para verificar se é cliente
      const res = await fetch(`/api/meus_chamados?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => null);
      
      let list = [];
      if (data) {
        if (Array.isArray(data)) {
          list = data;
        } else if (data.result) {
          if (Array.isArray(data.result)) {
            list = data.result;
          } else if (data.result.result && Array.isArray(data.result.result)) {
            list = data.result.result;
          }
        }
      }
      let name = '';
      if (list.length > 0) {
        name = list[0]?.nome_do_cliente || list[0]?.u_nome_cliente || '';
      }
      // Se retornou sem erro critico, loga o usuario com suas roles
      onLogin({
        email: trimmed,
        nome: name || trimmed.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
        chamados: list,
        permissions
      });
    } catch {
      // Fallback
      onLogin({
        email: trimmed,
        chamados: [],
        permissions: {
          canRead: true,
          canWrite: false,
          canCreate: true,
          canDelete: false,
          roles: ['sf_cliente']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerLogin(email);
  };

  return (
    <div className="login-root">
      {/* Fundo animado */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logoServiceFlow.png" alt="ServiceFlow" className="login-logo-img" />
          <span className="login-logo-text">ServiceFlow</span>
        </div>

        <div className="login-header">
          <h1 className="login-title">Bem-vindo ao Portal</h1>
          <p className="login-subtitle">
            Informe seu e-mail do ServiceNow para carregar suas roles e ACLs dinâmicas.
          </p>
          <div className="login-test-hint" style={{ marginTop: '0.75rem', padding: '0.625rem', background: 'var(--surface-container-high)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'left', border: '1px dashed var(--outline-variant)' }}>
            <strong>💡 Acesso Rápido de Teste (ServiceNow):</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => { setEmail('cliente.pedro@gmail.com'); triggerLogin('cliente.pedro@gmail.com'); }}
                disabled={loading}
              >
                <span><strong>Cliente:</strong> Pedro</span>
                <code>cliente.pedro@gmail.com</code>
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => { setEmail('atendente.carlos@serviceflow.com'); triggerLogin('atendente.carlos@serviceflow.com'); }}
                disabled={loading}
              >
                <span><strong>Atendente:</strong> Carlos</span>
                <code>atendente.carlos@serviceflow.com</code>
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => { setEmail('supervisor.ana@serviceflow.com'); triggerLogin('supervisor.ana@serviceflow.com'); }}
                disabled={loading}
              >
                <span><strong>Supervisor:</strong> Ana</span>
                <code>supervisor.ana@serviceflow.com</code>
              </button>
            </div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              <span className="material-symbols-outlined login-field-icon">mail</span>
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className={`login-input ${error ? 'login-input--error' : ''}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
            {error && (
              <span className="login-error">
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>error</span>
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="login-btn-primary"
            disabled={loading || !email.trim()}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Verificando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">arrow_forward</span>
                Entrar no Portal
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button
          className="login-btn-ghost"
          onClick={onContinueAsGuest}
          id="login-guest-btn"
        >
          <span className="material-symbols-outlined">person_outline</span>
          Continuar sem conta
        </button>

        <p className="login-footnote">
          Ao entrar, você concorda com nossos{' '}
          <button className="login-link" type="button" onClick={() => onNavigate('terms')}>Termos de Uso</button>
          {' '}e{' '}
          <button className="login-link" type="button" onClick={() => onNavigate('privacy')}>Política de Privacidade</button>.
        </p>
      </div>
    </div>
  );
}
