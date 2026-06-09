import { useState } from 'react';
import './LoginPage.css';

export default function LoginPage({ onLogin, onContinueAsGuest }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Tenta buscar chamados desse email para verificar se é cliente
      const res = await fetch(`/api/meus_chamados?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      
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
        name = list[0]?.nome_do_cliente || '';
      }
      // Se retornou sem erro critico, loga o usuario (com ou sem chamados)
      onLogin({ email: trimmed, nome: name, chamados: list });
    } catch {
      // Mesmo sem chamados anteriores, permite entrar
      onLogin({ email: trimmed, chamados: [] });
    } finally {
      setLoading(false);
    }
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
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">
            Informe seu e-mail para acessar seus chamados e histórico de atendimento.
          </p>
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
          <button className="login-link" onClick={() => {}}>Termos de Uso</button>
          {' '}e{' '}
          <button className="login-link" onClick={() => {}}>Política de Privacidade</button>.
        </p>
      </div>
    </div>
  );
}
