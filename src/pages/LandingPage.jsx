import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../config.js';
import './LandingPage.css';

const features = [
  {
    icon: 'auto_awesome',
    title: 'IA Conversacional',
    desc: 'Nossa IA coleta todas as informações em linguagem natural — sem formulários chatos.',
  },
  {
    icon: 'bolt',
    title: 'ServiceNow Ready',
    desc: 'Integração nativa com ServiceNow REST API. Zero fricção, protocolo imediato.',
  },
  {
    icon: 'palette',
    title: 'White-Label Total',
    desc: 'Injete seu logo, cores e identidade visual. Cada pixel é uma extensão da sua marca.',
  },
  {
    icon: 'lock',
    title: 'Seguro & Escalável',
    desc: 'Autenticação robusta e arquitetura preparada para crescer com o seu negócio.',
  },
];

const steps = [
  { num: '01', label: 'Cliente conversa com a IA' },
  { num: '02', label: 'IA coleta os dados necessários' },
  { num: '03', label: 'POST automático ao ServiceNow' },
  { num: '04', label: 'Protocolo entregue em segundos' },
];


export default function LandingPage({ onStartChat }) {
  const [brand, setBrand] = useState({
    primary: '#8B5CF6',
    secondary: '#67e8f9',
    aiName: 'Sofia',
    colorMode: 'dark',
  });

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(brand.aiName);
  const colorInputRef = useRef(null);
  const secondaryInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // ── Inject CSS variables on state change ──────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    // Helper: hex → "r,g,b" string for rgba() usage
    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `${r},${g},${b}`;
    };

    root.style.setProperty('--primary', brand.primary);
    root.style.setProperty('--primary-dim', brand.primary + 'cc');
    root.style.setProperty('--primary-rgb', hexToRgb(brand.primary));
    root.style.setProperty('--tertiary', brand.secondary);

    // Color mode: swap surface tokens
    if (brand.colorMode === 'light') {
      root.style.setProperty('--surface', '#f4f4f8');
      root.style.setProperty('--surface-container-low', '#e8e8f0');
      root.style.setProperty('--surface-container', '#dcdce8');
      root.style.setProperty('--surface-container-high', '#d0d0e0');
      root.style.setProperty('--on-surface', '#0d0d1a');
      root.style.setProperty('--on-surface-variant', '#44445a');
      root.style.setProperty('--outline-variant', '#c0c0d0');
    } else {
      root.style.setProperty('--surface', '#060e20');
      root.style.setProperty('--surface-container-low', '#0a1428');
      root.style.setProperty('--surface-container', '#0f1c35');
      root.style.setProperty('--surface-container-high', '#162240');
      root.style.setProperty('--on-surface', '#e8eaf6');
      root.style.setProperty('--on-surface-variant', '#8892b0');
      root.style.setProperty('--outline-variant', 'rgba(136,146,176,0.15)');
    }
  }, [brand]);

  // Focus the name input when it appears
  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleColorChange = (e) => {
    setBrand((b) => ({ ...b, primary: e.target.value }));
  };

  const handleSecondaryChange = (e) => {
    setBrand((b) => ({ ...b, secondary: e.target.value }));
  };

  const commitName = () => {
    setEditingName(false);
    setBrand((b) => ({ ...b, aiName: nameInput.trim() || b.aiName }));
    setNameInput((prev) => prev.trim() || brand.aiName);
  };

  const handleNameKey = (e) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') {
      setEditingName(false);
      setNameInput(brand.aiName);
    }
  };

  const toggleColorMode = () => {
    setBrand((b) => ({ ...b, colorMode: b.colorMode === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="material-symbols-outlined logo-mark">auto_awesome</span>
            <span className="logo-text">{CONFIG.brand.name}</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">Como funciona</a>
            <a href="#about">Sobre</a>
          </div>
          <button id="nav-cta" className="btn-primary nav-cta" onClick={onStartChat}>
            Iniciar Atendimento
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              <span>Powered by Groq + ServiceNow</span>
            </div>
            <h1 className="hero-title">
              Customer Support,<br />
              <span className="gradient-text">Reimagined</span><br />
              for Your Brand.
            </h1>
            <p className="hero-subtitle">
              O Ethereal Conduit para o seu fluxo de atendimento. Uma interface de alto desempenho
              que conecta a visão da sua marca às necessidades dos seus clientes via ServiceNow.
            </p>
            <div className="hero-actions">
              <button id="hero-cta" className="btn-primary btn-large" onClick={onStartChat}>
                Falar com a IA agora
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button id="hero-secondary" className="btn-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                Como funciona
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">{'<2s'}</span><span className="stat-label">resposta da IA</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">100%</span><span className="stat-label">white-label</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num">99.9%</span><span className="stat-label">uptime</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chat-preview">
              <div className="preview-header">
                <div className="preview-avatar">✦</div>
                <div>
                  <div className="preview-name">{brand.aiName}</div>
                  <div className="preview-status">● online</div>
                </div>
              </div>
              <div className="preview-messages">
                <div className="preview-msg assistant">
                  Olá! Estou aqui para te ajudar 😊 O que aconteceu?
                </div>
                <div className="preview-msg user">Meu produto chegou com defeito!</div>
                <div className="preview-msg assistant">
                  Que situação chata! Pode me dizer o número do seu pedido?
                </div>
                <div className="preview-msg user">#12345</div>
                <div className="preview-msg assistant typing-preview">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        </div>{/* end .hero-inner */}
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-inner">
          <div className="section-label">Recursos</div>
          <h2 className="section-title">Advanced Ecosystem</h2>
          <p className="section-subtitle">
            Features de precisão projetadas para escalar com a complexidade da sua marca.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>{f.icon}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="howto-section">
        <div className="section-inner">
          <div className="section-label">Integração</div>
          <h2 className="section-title">Fluxo Completo</h2>
          <p className="section-subtitle">
            Frontend React → Groq AI → ServiceNow REST API. Simples assim.
          </p>
          <div className="steps-track">
            {steps.map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{s.num}</div>
                <div className="step-label">{s.label}</div>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
          <div className="code-block">
            <div className="code-header">
              <span className="code-dot red" />
              <span className="code-dot yellow" />
              <span className="code-dot green" />
              <span className="code-filename">serviceNowService.js</span>
            </div>
            <pre className="code-body">
{`const response = await fetch(
  'https://SUA_INSTANCIA.service-now.com/api/serviceflow/chamados',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('usuario:senha')
    },
    body: JSON.stringify({ nome, email, numero_pedido, tipo })
  }
);

const { protocolo } = await response.json();
// → SF-2026-00847`}
            </pre>
          </div>
        </div>
      </section>

      {/* Brand / White-label */}
      <section id="about" className="brand-section">
        <div className="section-inner brand-inner">
          <div className="brand-content">
            <div className="section-label">White-Label</div>
            <h2 className="section-title">Sua Marca.<br />Nosso Engine.</h2>
            <p className="section-subtitle">
              Injete logos, fontes e cores com nossa API de transformação.
              Cada pixel é uma extensão da sua identidade visual.
            </p>
            <ul className="brand-list">
              <li><span className="material-symbols-outlined check">check</span> CSS variables dinamicamente injetáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Nome e avatar da IA customizáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Dark/Light mode com tokens bespoke</li>
              <li><span className="material-symbols-outlined check">check</span> Multi-tenant ready</li>
            </ul>
            <button id="brand-cta" className="btn-primary" onClick={onStartChat}>
              Testar agora →
            </button>
          </div>

          {/* ── Interactive Token Cards ── */}
          <div className="brand-tokens">

            {/* -- brand-primary: color picker */}
            <div
              className="token-card token-card--interactive"
              title="Clique para alterar a cor primária"
              onClick={() => colorInputRef.current?.click()}
            >
              <span className="token-key">--brand-primary</span>
              <div className="token-color-wrap">
                <span className="token-hex">{brand.primary}</span>
                <span
                  className="token-value token-swatch"
                  style={{ background: brand.primary }}
                />
                {/* Hidden native color input */}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={brand.primary}
                  onChange={handleColorChange}
                  className="token-color-input"
                  aria-label="Escolher cor primária"
                />
              </div>
            </div>

            {/* -- ai-name: inline text edit */}
            <div
              className={`token-card token-card--interactive${editingName ? ' token-card--active' : ''}`}
              title="Clique para editar o nome da IA"
              onClick={() => !editingName && setEditingName(true)}
            >
              <span className="token-key">--ai-name</span>
              {editingName ? (
                <input
                  ref={nameInputRef}
                  className="token-inline-input"
                  value={nameInput}
                  maxLength={20}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={handleNameKey}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="token-str">"{brand.aiName}"</span>
              )}
            </div>

            {/* -- brand-secondary: second color picker */}
            <div
              className="token-card token-card--interactive"
              title="Clique para alterar a cor secundária"
              onClick={() => secondaryInputRef.current?.click()}
            >
              <span className="token-key">--brand-secondary</span>
              <div className="token-color-wrap">
                <span className="token-hex">{brand.secondary}</span>
                <span
                  className="token-value token-swatch"
                  style={{ background: brand.secondary }}
                />
                <input
                  ref={secondaryInputRef}
                  type="color"
                  value={brand.secondary}
                  onChange={handleSecondaryChange}
                  className="token-color-input"
                  aria-label="Escolher cor secundária"
                />
              </div>
            </div>

            {/* -- color-mode: toggle */}
            <div
              className="token-card token-card--interactive"
              title="Clique para alternar o modo de cor"
              onClick={toggleColorMode}
            >
              <span className="token-key">--color-mode</span>
              <div className="token-mode-wrap">
                <span className="token-str">{brand.colorMode}</span>
                <div className={`token-mode-toggle ${brand.colorMode === 'light' ? 'token-mode-toggle--light' : ''}`}>
                  <span className="material-symbols-outlined token-mode-icon">
                    {brand.colorMode === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Pronto para transcender?</h2>
          <p className="cta-subtitle">
            Junte-se às marcas que usam o ServiceFlow para redefinir o atendimento ao cliente.
          </p>
          <button id="final-cta" className="btn-primary btn-large" onClick={onStartChat}>
            Iniciar Atendimento Gratuito
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="material-symbols-outlined logo-mark">auto_awesome</span>
            <span className="logo-text">{CONFIG.brand.name}</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Status</a>
            <a href="#">Contact</a>
          </div>
          <p className="footer-copy">© 2026 {CONFIG.brand.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
