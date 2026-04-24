import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { CONFIG } from '../config.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

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

const faqs = [
  {
    q: 'Quanto tempo leva para o ServiceFlow estar funcionando na minha loja?',
    a: 'Em média, 3 a 5 dias úteis. Nossa equipe realiza todo o onboarding: personalização visual (cores, nome da IA, logo da sua marca), configuração dos fluxos de atendimento e integração com o ServiceNow. Você não precisa fazer nada técnico.',
  },
  {
    q: 'Preciso ter equipe de TI para usar o ServiceFlow?',
    a: 'Não. O ServiceFlow foi projetado para donos de PME, não para times técnicos. Nós entregamos tudo configurado — você só precisa apontar para o nosso sistema e a IA começa a atender.',
  },
  {
    q: 'O que acontece se a IA não souber responder o cliente?',
    a: 'A IA detecta automaticamente quando uma situação está além do fluxo padrão e escala o chamado para sua equipe, garantindo que nenhum cliente fique sem resposta. Você tem visibilidade total de tudo via ServiceNow.',
  },
  {
    q: 'O ServiceFlow funciona com minha plataforma de e-commerce?',
    a: 'O ServiceNow, plataforma base do ServiceFlow, possui mais de 500 integrações nativas com sistemas de e-commerce, CRM e ERP. Nossa equipe avalia sua stack durante o onboarding e cuida da integração.',
  },
  {
    q: 'Posso personalizar a identidade visual do assistente de IA?',
    a: 'Sim — e isso é um dos nossos diferenciais. O assistente recebe o nome, as cores e o logo da sua marca. Para o seu cliente, parece que é um colaborador da própria loja, não um sistema terceirizado.',
  },
  {
    q: 'Como funciona o cancelamento?',
    a: 'É mês a mês, sem fidelidade e sem multa. Você cancela quando quiser, direto na sua área de cliente. Mas aviso: depois de ver os primeiros R$3,23/dia eliminando seu caos de suporte, a maioria decide ficar.',
  },
];

export default function LandingPage({ onStartChat, onNavigate }) {
  const [brand, setBrand] = useState({
    primary: '#8B5CF6',
    secondary: '#e8e8e8ff',
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
    root.style.setProperty('--tertiary-rgb', hexToRgb(brand.secondary));

    // Color mode: swap surface tokens
    if (brand.colorMode === 'light') {
      root.style.setProperty('--nav-bg', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--surface', '#f4f4f8');
      root.style.setProperty('--surface-container-low', '#e8e8f0');
      root.style.setProperty('--surface-container', '#dcdce8');
      root.style.setProperty('--surface-container-high', '#d0d0e0');
      root.style.setProperty('--on-surface', '#0d0d1a');
      root.style.setProperty('--on-surface-variant', '#44445a');
      root.style.setProperty('--outline-variant', '#c0c0d0');
    } else {
      root.style.setProperty('--nav-bg', 'rgba(6, 14, 32, 0.85)');
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

  // ── GSAP Animations ───────────────────────────────────────────────────────
  const landingRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // Helper: animate elements only when they scroll into view
      const reveal = (selector, vars, triggerEl) => {
        ScrollTrigger.create({
          trigger: triggerEl || selector,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo(selector,
              { opacity: 0, ...vars.from },
              { opacity: 1, duration: 0.7, ease: 'power3.out', ...vars.to }
            );
          },
        });
      };

      // ─── Hero entrance cascade (immediate, no scroll trigger) ──────────
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .fromTo('.hero-title',
          { opacity: 0, y: 40, rotationX: 15 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.8, transformOrigin: 'center bottom' }
        )
        .fromTo('.hero-subtitle',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo('.hero-actions',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.3'
        )
        .fromTo('.hero-stats .stat, .hero-stats .stat-divider',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 },
          '-=0.2'
        );

      // Chat preview — slides in from the right
      heroTl.fromTo('.hero-visual',
        { opacity: 0, x: 80, rotationY: -8, scale: 0.92 },
        { opacity: 1, x: 0, rotationY: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.3
      );

      // Hero glow
      gsap.fromTo('.hero-glow',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' }
      );

      // ─── Features section ──────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: '#features',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '#features .section-label, #features .section-title, #features .section-subtitle',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }
          );
        },
      });

      ScrollTrigger.create({
        trigger: '.features-grid',
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.feature-card',
            { opacity: 0, y: 50, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.6, ease: 'back.out(1.4)' }
          );
        },
      });

      // ─── Brand / White-label section ───────────────────────────────────
      ScrollTrigger.create({
        trigger: '#about',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.brand-content',
            { opacity: 0, x: -60 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
          );
          gsap.fromTo('.brand-tokens .token-card',
            { opacity: 0, x: 60 },
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.2 }
          );
        },
      });

      // ─── How it works section ──────────────────────────────────────────
      ScrollTrigger.create({
        trigger: '#how-it-works',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            '#how-it-works .section-label, #how-it-works .section-title, #how-it-works .section-subtitle',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }
          );
        },
      });

      ScrollTrigger.create({
        trigger: '.steps-track',
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.step-item',
            { opacity: 0, y: 40, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.6, ease: 'back.out(1.6)' }
          );
        },
      });

      ScrollTrigger.create({
        trigger: '.code-block',
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.code-block',
            { opacity: 0, y: 40, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
          );
        },
      });

      // ─── CTA Final section ─────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const ctaTl = gsap.timeline();
          ctaTl
            .fromTo('.cta-glow',
              { opacity: 0, scale: 0.3 },
              { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
            )
            .fromTo('.cta-title',
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
              '-=0.6'
            )
            .fromTo('.cta-subtitle',
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
              '-=0.3'
            )
            .fromTo('.cta-section .btn-primary',
              { opacity: 0, y: 20, scale: 0.9 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' },
              '-=0.2'
            );
        },
      });

      // ─── Footer ────────────────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: '.landing-footer',
        start: 'top 95%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.footer-inner > *',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' }
          );
        },
      });

    }, landingRef);

    return () => ctx.revert();
  }, []);


  return (
    <div className="landing" ref={landingRef}>
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <img src="/logoServiceFlow.png" alt="ServiceFlow Logo" className="logo-mark" />
            <span className="logo-text">{CONFIG.brand.name}</span>
          </a>
          <div className="nav-links">
            <a href="#features">Funcionalidades</a>
            <a href="#about">White-Label</a>
            <a href="#how-it-works">Como funciona</a>
          </div>
          <button id="nav-cta" className="btn-primary nav-cta" onClick={onStartChat}>
            Agendar Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        {/* Animated orbs — decorative, pointer-events:none */}
        <div className="hero-orb hero-orb-a" aria-hidden="true" />
        <div className="hero-orb hero-orb-b" aria-hidden="true" />
        <div className="hero-orb hero-orb-c" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Suporte de multinacional.<br />
              <span className="gradient-text">Personalizado</span><br />
              para a sua marca.
            </h1>
            <p className="hero-subtitle">
              Esqueça os chatbots engessados. O ServiceFlow integra o padrão global do ServiceNow à sua operação, entregando uma experiência de atendimento que converte clientes irritados em fãs leais.
            </p>
            <div className="hero-actions">
              <button id="hero-cta" className="btn-primary btn-large" onClick={onStartChat}>
                Agendar Demonstração
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

      {/* Pain Section */}
      <section className="pain-section" style={{ position: 'relative' }}>
        <div className="section-particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="section-inner">
          <div className="section-label">O Problema</div>
          <h2 className="section-title">Você reconhece<br /><span className="gradient-text">essa cena?</span></h2>
          <p className="section-subtitle">
            Enquanto você foca na expansão, falhas no suporte destroem a sua margem de lucro silenciosamente.
          </p>
          <div className="pain-grid">
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">schedule</span>
              <h3>Clientes esperando horas</h3>
              <p>Uma troca simples vira um pesadelo de 3 dias de e-mails. O cliente perde a paciência — e a confiança na sua marca.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">inbox</span>
              <h3>Equipe afogada no repetitivo</h3>
              <p>Sua equipe passa o dia respondendo as mesmas perguntas sobre prazo, status e devolução. Ninguém tem tempo para o que importa.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">folder_off</span>
              <h3>Chamados que somem</h3>
              <p>Sem rastreamento, sem protocolo, sem histórico. O cliente liga de novo, repete tudo do zero — e a raiva dobra.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">star_half</span>
              <h3>Reviews negativos que ficam</h3>
              <p>Cada atendimento ruim vira uma avaliação de 1 estrela no Google, Reclame Aqui ou E-commerce. E essas ficam para sempre.</p>
            </div>
          </div>
          <div className="pain-highlight">
            <span className="material-symbols-outlined pain-alert-icon">warning_amber</span>
            <p>
              <strong>76% dos consumidores</strong> afirmam que uma única experiência ruim no pós-venda é suficiente
              para nunca mais comprar de uma marca. O seu suporte atual está convertendo clientes em detratores?
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section" style={{ position: 'relative' }}>
        {/* Floating particles — decorative */}
        <div className="section-particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="section-inner">
          <div className="section-label">Recursos</div>
          <h2 className="section-title">Ecossistema Avançado</h2>
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

      {/* Social Proof */}
      <section className="proof-section">
        <div className="section-inner">
          <div className="section-label">Resultados Reais</div>
          <h2 className="section-title">PMEs que transformaram<br />seu pós-venda com o ServiceFlow</h2>
          <div className="proof-stats">
            <div className="proof-stat">
              <span className="proof-num">+3.200</span>
              <span className="proof-label">chamados resolvidos/mês</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num">98%</span>
              <span className="proof-label">taxa de satisfação dos clientes</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num">&lt;2min</span>
              <span className="proof-label">para abrir um protocolo completo</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num">100%</span>
              <span className="proof-label">de precisão na abertura dos protocolos</span>
            </div>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Antes do ServiceFlow, minha equipe passava 4 horas por dia só respondendo e-mails de troca e devolução. Hoje a IA cuida disso tudo, o protocolo é aberto em segundos e eu foco apenas em crescer. O melhor investimento que já fiz no meu negócio.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">CM</div>
                <div>
                  <div className="testimonial-name">Camila Matos</div>
                  <div className="testimonial-role">Loja Encanto Feminino · São Paulo, SP</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Tentei contratar uma atendente para resolver o caos do pós-venda. Não funcionou. Com o ServiceFlow, configuraram tudo para minha loja em dias e agora cada chamado tem protocolo, histórico e resposta. Nunca mais perdi cliente por falta de retorno.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RF</div>
                <div>
                  <div className="testimonial-name">Ricardo Fontes</div>
                  <div className="testimonial-role">E-commerce de Eletrônicos · Belo Horizonte, MG</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Achei que seria complicado demais para a minha loja pequena. Mas foi o contrário — configuraram tudo com as cores e o nome da minha marca. Minhas avaliações no Reclame Aqui subiram de 6.8 para 9.2 em dois meses.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AP</div>
                <div>
                  <div className="testimonial-name">Ana Paula Reis</div>
                  <div className="testimonial-role">Marketplace de Artesanato · Curitiba, PR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand / White-label */}
      <section id="about" className="brand-section">
        <div className="section-inner brand-inner">
          <div className="brand-content">
            <div className="section-label">White-Label</div>
            <h2 className="section-title">Sua Marca.<br />Nosso Sistema.</h2>
            <p className="section-subtitle">
              Injete logos, fontes e cores com nossa função de transformação.
              Cada pixel é uma extensão da sua identidade visual.
            </p>
            <ul className="brand-list">
              <li><span className="material-symbols-outlined check">check</span> CSS variáveis dinamicamente injetáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Nome e avatar da IA customizáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Dark/Light mode com tokens customizáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Segurança de dados</li>
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
            >
              <span className="token-key">Cor Primária</span>
              <div className="token-color-wrap">
                <span className="token-hex">{brand.primary}</span>
                <span
                  className="token-value token-swatch"
                  style={{ background: brand.primary }}
                />
                {/* Overlay native color input */}
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
              <span className="token-key">Nome da IA</span>
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
            >
              <span className="token-key">Cor Secundária</span>
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
              <span className="token-key">Modo de Cor</span>
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

      {/* How it works */}
      <section id="how-it-works" className="howto-section" style={{ position: 'relative' }}>
        {/* Floating particles — decorative */}
        <div className="section-particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="section-inner">
          <div className="section-label">Integração</div>
          <h2 className="section-title">Fluxo Completo</h2>
          <p className="section-subtitle">
            Frontend React → IA → ServiceNow API. Simples assim.
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

      {/* Objections */}
      <section className="objections-section" style={{ position: 'relative' }}>
        <div className="section-particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="section-inner">
          <div className="section-label">Sem Pegadinha</div>
          <h2 className="section-title">Sua dúvida tem resposta.<br /><span className="gradient-text">Veja aqui.</span></h2>
          <div className="objections-grid">
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">payments</span>
                <h3>&ldquo;A mensalidade vai pesar no orçamento?&rdquo;</h3>
              </div>
              <p>O ServiceFlow não é apenas uma ferramenta, é uma <strong>operação de suporte de nível Enterprise</strong> para a sua empresa. Mais do que economizar com novas contratações, você blinda a reputação da sua marca, garante zero chamados perdidos e transforma o atendimento no seu maior diferencial competitivo.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">build</span>
                <h3>&ldquo;Parece complicado de configurar.&rdquo;</h3>
              </div>
              <p>Não tem nada para você fazer. Nossa equipe personaliza <strong>tudo</strong> para a sua loja: nome do assistente, cores, fluxo de atendimento e integração com ServiceNow. Você contrata hoje e a IA já atende amanhã.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">psychology</span>
                <h3>&ldquo;E se a IA errar com meu cliente?&rdquo;</h3>
              </div>
              <p>Quando a IA detecta algo fora do padrão, <strong>escala automaticamente para sua equipe</strong>. O cliente nunca fica sem resposta e você mantém controle total de cada chamado aberto.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">link</span>
                <h3>&ldquo;Preciso integrar com meu sistema.&rdquo;</h3>
              </div>
              <p>O ServiceNow é o padrão global de gestão de chamados — usado por <strong>Airbnb, Adobe e Siemens</strong>. Integra com os principais e-commerces e ERPs. Nossa equipe cuida da integração no onboarding.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">exit_to_app</span>
                <h3>&ldquo;E se eu quiser cancelar?&rdquo;</h3>
              </div>
              <p>Sem multa, sem carência, sem burocracia. O ServiceFlow é <strong>mês a mês</strong>. Cancela em um clique quando quiser. Mas depois de ver os primeiros protocolos sendo abertos em segundos, duvido que você queira parar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  {faq.q}
                  <span className="faq-chevron material-symbols-outlined">expand_more</span>
                </summary>
                <p className="faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="cta-glow" />
        {/* Secondary cyan glow — decorative */}
        <div className="cta-glow-secondary" aria-hidden="true" />
        <div className="section-inner cta-inner">
          <div className="cta-urgency">
            <span className="material-symbols-outlined urgency-icon">bolt</span>
            <span>Apenas <strong>12 vagas de onboarding</strong> disponíveis este mês</span>
          </div>
          <h2 className="cta-title">Chega de suporte<br /><span className="gradient-text">desorganizado.</span></h2>
          <p className="cta-subtitle">
            Eleve sua marca com uma <strong>operação de suporte premium</strong>. Sua loja terá uma 
            IA de alto nível, 100% configurada, personalizada e pronta para blindar sua reputação.
          </p>
          <button id="final-cta" className="btn-primary btn-large" onClick={onStartChat}>
            Agendar Demonstração →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/logoServiceFlow.png" alt="ServiceFlow Logo" className="logo-mark" />
            <span className="logo-text">{CONFIG.brand.name}</span>
          </div>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Política de Privacidade</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Termos de Uso</a>
            <a href="mailto:contato@serviceflow.com.br">Contato</a>
          </div>
          <p className="footer-copy">© 2026 {CONFIG.brand.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
