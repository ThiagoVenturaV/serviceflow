import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { CONFIG } from '../config.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

// Custom premium CountUp component that animates when scrolled into view
function CountUp({ end, start = 0, duration = 2000, prefix = '', suffix = '', decimals = 0, useThousandsSeparator = false }) {
  const isTest = typeof window === 'undefined' || !window.IntersectionObserver || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');
  const [count, setCount] = useState(isTest ? end : start);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isTest) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = percentage * (2 - percentage);
            
            const currentValue = start + easeProgress * (end - start);
            setCount(currentValue);

            if (percentage < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [end, start, duration, isTest]);

  // Format count
  const formattedCount = (() => {
    let value = count.toFixed(decimals);
    if (useThousandsSeparator) {
      const parts = value.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      value = parts.join(',');
    }
    return `${prefix}${value}${suffix}`;
  })();

  return <span ref={elementRef}>{formattedCount}</span>;
}

const features = [
  {
    icon: 'auto_awesome',
    title: 'IA Conversacional',
    desc: 'Resolução autônoma de chamados via linguagem natural. Dispense formulários complexos e aumente a conversão do autoatendimento em até 40%.',
  },
  {
    icon: 'bolt',
    title: 'ServiceNow Ready',
    desc: 'Conexão nativa e segura com a API REST do ServiceNow. Sincronização em tempo real de filas, SLAs e triagem inteligente sem esforço de engenharia.',
  },
  {
    icon: 'palette',
    title: 'White-Label Total',
    desc: 'Customização completa de UI. Injete a identidade visual, cores e tom de voz da sua marca, garantindo uma transição fluida e profissional para seus clientes.',
  },
  {
    icon: 'lock',
    title: 'Seguro & Escalável',
    desc: 'Arquitetura corporativa em conformidade com a LGPD. Criptografia ponta a ponta e escalabilidade pronta para suportar picos de chamados com segurança.',
  },
];

const steps = [
  { num: '01', label: 'Interação inicial via linguagem natural' },
  { num: '02', label: 'Triagem e enriquecimento de dados por IA' },
  { num: '03', label: 'Sincronização instantânea na API ServiceNow' },
  { num: '04', label: 'Protocolo de atendimento gerado em segundos' },
];

const faqs = [
  {
    q: 'Como funciona o processo e qual o tempo de homologação?',
    a: 'Nossa equipe realiza o setup e onboarding em até 5 dias úteis. Configuramos a identidade visual (logos, cores e paleta), calibramos as regras de atendimento e estruturamos a integração segura com sua instância ServiceNow.',
  },
  {
    q: 'Nossa empresa precisará alocar desenvolvedores para a integração?',
    a: 'Não. O ServiceFlow é uma solução SaaS gerenciada. Cuidamos do provisionamento, infraestrutura e atualizações de segurança. Seu time só precisa apontar o widget e gerenciar os chamados no painel do ServiceNow.',
  },
  {
    q: 'Como a IA processa casos complexos ou não previstos?',
    a: 'A IA monitora o nível de confiança das respostas. Ao identificar cenários atípicos ou solicitações de transição humana, ela realiza o handoff em tempo real para a fila ativa de suporte no ServiceNow, mantendo todo o histórico.',
  },
  {
    q: 'Quais plataformas de e-commerce e ERPs são compatíveis?',
    a: 'Por possuir a espinha dorsal de governança baseada no ServiceNow, nossa arquitetura suporta integrações nativas com as principais ferramentas do mercado (como Shopify, VTEX, SAP e Salesforce). Cuidamos disso durante o onboarding.',
  },
  {
    q: 'É possível desativar qualquer menção ao ServiceFlow (White-Label completo)?',
    a: 'Sim. A solução é 100% white-label. Você pode customizar cores primárias, secundárias, logotipo, avatar e comportamento da IA. Para o cliente final, a experiência de suporte é totalmente proprietária da sua marca.',
  },
];

export default function LandingPage({ onStartChat, onNavigate }) {
  const [brand, setBrand] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_brand_config');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return {
      primary: '#8B5CF6',
      secondary: '#e8e8e8ff',
      aiName: 'Sofia',
      colorMode: systemPrefersLight ? 'light' : 'dark',
    };
  });

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(brand.aiName);
  const colorInputRef = useRef(null);
  const secondaryInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // Interactive Chat Preview states
  const [previewMsgs, setPreviewMsgs] = useState([
    { sender: 'assistant', text: 'Olá! Como posso ajudar você hoje? 😊' },
    { sender: 'user', text: 'Gostaria de solicitar a troca do meu pedido.' },
    { sender: 'assistant', text: 'Com certeza. Para localizar a sua compra em nossa base, poderia informar o número do pedido?' },
    { sender: 'user', text: '#12345' },
    { sender: 'assistant', text: 'Aguarde um momento enquanto localizo os dados no ServiceNow...' }
  ]);
  const [previewInput, setPreviewInput] = useState('');
  const [isPreviewTyping, setIsPreviewTyping] = useState(false);
  const [toast, setToast] = useState(null);

  const previewInputRef = useRef(null);
  const previewMsgsRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
  };

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initial Chat Simulation
  useEffect(() => {
    setIsPreviewTyping(true);
    const timer = setTimeout(() => {
      setIsPreviewTyping(false);
      setPreviewMsgs(prev => [
        ...prev,
        { sender: 'assistant', text: `Localizei o pedido #12345 (Fone Bluetooth) integrado no ServiceNow. Status: 'Entregue'. Deseja abrir um protocolo de troca ou falar com um analista?` }
      ]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll messages
  useEffect(() => {
    if (previewMsgsRef.current) {
      previewMsgsRef.current.scrollTop = previewMsgsRef.current.scrollHeight;
    }
  }, [previewMsgs, isPreviewTyping]);

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    if (!previewInput.trim() || isPreviewTyping) return;

    const userText = previewInput.trim();
    setPreviewMsgs(prev => [...prev, { sender: 'user', text: userText }]);
    setPreviewInput('');
    setIsPreviewTyping(true);

    setTimeout(() => {
      setIsPreviewTyping(false);
      let reply = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('troca') || textLower.includes('devol') || textLower.includes('cancel')) {
        reply = `Perfeito. O protocolo de troca foi aberto no ServiceNow sob o número SF-99882. O processo de devolução foi iniciado e enviaremos as instruções de postagem por e-mail.`;
      } else if (textLower.includes('atendente') || textLower.includes('humano') || textLower.includes('falar com')) {
        reply = `Compreendo. Estou transferindo o seu atendimento para a nossa equipe de suporte no ServiceNow. Um analista prosseguirá em alguns instantes.`;
      } else {
        reply = `Entendido. Sou a ${brand.aiName}, assistente virtual da ${CONFIG.brand.name}. Posso abrir chamados de suporte, consultar pedidos ou tirar dúvidas sobre sua entrega. Como posso ajudar?`;
      }

      setPreviewMsgs(prev => [...prev, { sender: 'assistant', text: reply }]);
    }, 1500);
  };

  // ── Inject CSS variables and toggle theme classes on state change ──────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sf_brand_config', JSON.stringify(brand));

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

    // Color mode: toggle class on html element
    if (brand.colorMode === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
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

      // Chat preview - slides in from the right
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
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              stagger: 0.12, 
              duration: 0.6, 
              ease: 'back.out(1.4)',
              onComplete: () => {
                gsap.set('.feature-card', { clearProps: 'transform' });
              }
            }
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
            { 
              opacity: 1, 
              x: 0, 
              stagger: 0.1, 
              duration: 0.6, 
              ease: 'power3.out', 
              delay: 0.2,
              onComplete: () => {
                gsap.set('.brand-tokens .token-card', { clearProps: 'transform' });
              }
            }
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
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              stagger: 0.15, 
              duration: 0.6, 
              ease: 'back.out(1.6)',
              onComplete: () => {
                gsap.set('.step-item', { clearProps: 'transform' });
              }
            }
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
            )
            .set('.cta-section .btn-primary', { clearProps: 'transform' });
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
      <section id="hero" className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        {/* Animated orbs - decorative, pointer-events:none */}
        <div className="hero-orb hero-orb-a" aria-hidden="true" />
        <div className="hero-orb hero-orb-b" aria-hidden="true" />
        <div className="hero-orb hero-orb-c" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Suporte de nível Enterprise.<br />
              <span className="gradient-text">Personalizado</span><br />
              para a sua marca.
            </h1>
            <p className="hero-subtitle">
              Automatize seu pós-venda com a velocidade e segurança nativas do ServiceNow. Resolva trocas, devoluções e chamados complexos em segundos, mitigando o churn e blindando sua reputação.
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
              <div className="stat"><span className="stat-num"><CountUp end={2} start={10} prefix="<" suffix="s" /></span><span className="stat-label">resposta via IA</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num"><CountUp end={100} start={0} suffix="%" /></span><span className="stat-label">white-label completo</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-num"><CountUp end={99.9} start={0} suffix="%" decimals={1} /></span><span className="stat-label">uptime de rede</span></div>
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
              <div className="preview-messages" ref={previewMsgsRef}>
                {previewMsgs.map((msg, idx) => (
                  <div key={idx} className={`preview-msg ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
                {isPreviewTyping && (
                  <div className="preview-msg assistant typing-preview">
                    <span /><span /><span />
                  </div>
                )}
              </div>
              <form onSubmit={handlePreviewSubmit} className="preview-input-form">
                <input
                  ref={previewInputRef}
                  type="text"
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  placeholder="Simule uma conversa com a IA..."
                  className="preview-input"
                  disabled={isPreviewTyping}
                  aria-label="Simular conversa"
                />
                <button type="submit" className="preview-send-btn" disabled={isPreviewTyping || !previewInput.trim()} aria-label="Enviar mensagem simulada">
                  <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>arrow_upward</span>
                </button>
              </form>
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
          <h2 className="section-title">O custo invisível de um<br /><span className="gradient-text">suporte ineficiente</span></h2>
          <p className="section-subtitle">
            Enquanto você foca na expansão, falhas na experiência de pós-venda destroem a sua margem de lucro e corroem o LTV dos clientes.
          </p>
          <div className="pain-grid">
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">schedule</span>
              <h3>Tempo de Espera Crítico</h3>
              <p>Trocas simples viram longas esperas por e-mail. A lentidão frustra o cliente, que abandona a sua marca nas próximas compras.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">inbox</span>
              <h3>Sobrecarga Operacional</h3>
              <p>Seu time de atendimento passa o dia respondendo chamados repetitivos de rastreamento e status. Zero tempo para focar em iniciativas estratégicas.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">folder_off</span>
              <h3>Descentralização de Dados</h3>
              <p>Sem rastreamento unificado ou protocolo integrado. O cliente é forçado a repetir o histórico em múltiplos canais de contato.</p>
            </div>
            <div className="pain-card">
              <span className="material-symbols-outlined pain-icon">star_half</span>
              <h3>Danos à Reputação</h3>
              <p>Fricções no pós-venda escalam rapidamente para avaliações negativas de 1 estrela no Google e Reclame Aqui, reduzindo a conversão de novos clientes.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section" style={{ position: 'relative' }}>
        {/* Floating particles - decorative */}
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
              <div
                key={i}
                className={`feature-card feature-card-${i}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (i === 0) {
                    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
                    if (previewInputRef.current) previewInputRef.current.focus();
                    showToast("Use o chat interativo no topo para testar a IA em tempo real!");
                  } else if (i === 1) {
                    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
                    showToast("O ServiceFlow se comunica de forma nativa com as APIs do ServiceNow.");
                  } else if (i === 2) {
                    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
                    showToast("Role até o painel abaixo para customizar as cores e nome da IA.");
                  } else if (i === 3) {
                    showToast("✦ Arquitetura segura em conformidade com a LGPD e criptografia ativa.");
                  }
                }}
              >
                <div className="feature-card-content">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>{f.icon}</span>
                  </div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
                {/* Visual bento decorations */}
                {i === 0 && (
                  <div className="bento-decor bento-decor-chat" aria-hidden="true">
                    <div className="decor-bubble assistant">✦ IA Ativa</div>
                    <div className="decor-bubble user">Quero trocar meu pedido</div>
                    <div className="decor-bubble assistant pulse">{brand.aiName} digitando...</div>
                  </div>
                )}
                {i === 1 && (
                  <div className="bento-decor bento-decor-now" aria-hidden="true">
                    <div className="now-status-badge">REST API CONNECTED</div>
                    <div className="now-ticket-box">
                      <div className="ticket-line" />
                      <div className="ticket-line short" />
                      <div className="ticket-dot" />
                    </div>
                  </div>
                )}
                {i === 2 && (
                  <div className="bento-decor bento-decor-palette" aria-hidden="true">
                    <div className="palette-preview-bar">
                      <div className="palette-swatch" style={{ background: brand.primary }} />
                      <div className="palette-swatch" style={{ background: brand.secondary }} />
                    </div>
                    <div className="palette-label">{brand.aiName} Editado</div>
                  </div>
                )}
                {i === 3 && (
                  <div className="bento-decor bento-decor-secure" aria-hidden="true">
                    <div className="secure-radar">
                      <span className="radar-circle" />
                      <span className="radar-circle" />
                    </div>
                    <span className="material-symbols-outlined secure-lock-icon">security</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="proof-section">
        <div className="section-inner">
          <div className="section-label">Resultados Reais</div>
          <h2 className="section-title">Resultados que transformam a<br />eficiência operacional do pós-venda</h2>
          <div className="proof-stats">
            <div className="proof-stat">
              <span className="proof-num"><CountUp end={3200} start={0} prefix="+" useThousandsSeparator={true} /></span>
              <span className="proof-label">chamados automatizados/mês</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num"><CountUp end={98} start={0} suffix="%" /></span>
              <span className="proof-label">de índice de satisfação (CSAT)</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num"><CountUp end={2} start={10} prefix="<" suffix="min" /></span>
              <span className="proof-label">tempo médio de atendimento (TMA)</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <span className="proof-num"><CountUp end={100} start={0} suffix="%" /></span>
              <span className="proof-label">de precisão na integração de dados</span>
            </div>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Antes do ServiceFlow, nosso time de suporte gastava horas processando trocas manuais via e-mail. A IA automatizou 80% das interações de primeiro nível com integração instantânea ao ServiceNow. Nosso time de CS agora foca em expansão estratégica.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">CM</div>
                <div>
                  <div className="testimonial-name">Camila Matos</div>
                  <div className="testimonial-role">VP de Customer Success na Lumina Fashion</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;Com o crescimento acelerado da nossa base, a operação corria o risco de colapsar. O ServiceFlow implementou fluxos estruturados de autoatendimento integrados diretamente ao ServiceNow. Uma experiência de pós-venda verdadeiramente premium.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RF</div>
                <div>
                  <div className="testimonial-name">Ricardo Fontes</div>
                  <div className="testimonial-role">Diretor de Operações na Vortex Tech</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">&ldquo;O onboarding do ServiceFlow foi impecável. A inteligência artificial assumiu o suporte de primeira linha mantendo perfeitamente o tom de voz da nossa marca. Nosso índice de NPS subiu de 62 para 89 em menos de um trimestre.&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AP</div>
                <div>
                  <div className="testimonial-name">Ana Paula Reis</div>
                  <div className="testimonial-role">Head de Customer Experience na Artesa</div>
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
            <h2 className="section-title">Sua Identidade.<br />Nossa Tecnologia.</h2>
            <p className="section-subtitle">
              Mantenha a integridade da sua marca. Customize logos, fontes, cores e comportamento da IA com facilidade para criar uma experiência de suporte proprietária.
            </p>
            <ul className="brand-list">
              <li><span className="material-symbols-outlined check">check</span> Injeção em tempo real de CSS customizável</li>
              <li><span className="material-symbols-outlined check">check</span> Nome, avatar e comportamento da IA parametrizáveis</li>
              <li><span className="material-symbols-outlined check">check</span> Temas Light e Dark com persistência de preferências</li>
              <li><span className="material-symbols-outlined check">check</span> Segurança de dados corporativos e conformidade LGPD</li>
            </ul>
            <button id="brand-cta" className="btn-primary" onClick={() => setEditingName(true)}>
              Testar agora &rarr;
            </button>
          </div>

          {/* ── Dynamic Design Customizer Studio Widget ── */}
          <div className="brand-tokens-panel">
            <div className="panel-chrome-header">
              <div className="chrome-dots">
                <span className="c-dot red" />
                <span className="c-dot yellow" />
                <span className="c-dot green" />
              </div>
              <div className="chrome-title">identity-studio.config</div>
              <div className="chrome-status-badge">
                <span className="pulse-dot" /> LIVE PREVIEW
              </div>
            </div>
            
            <div className="brand-tokens">
              {/* -- brand-primary: color picker */}
              <div
                className="token-card token-card--interactive"
                title="Clique para alterar a cor primária"
              >
                <div className="token-meta">
                  <span className="token-key">Cor Primária</span>
                  <span className="token-desc-sub">--color-primary</span>
                </div>
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
                <div className="token-meta">
                  <span className="token-key">Nome da IA</span>
                  <span className="token-desc-sub">--ai-agent-name</span>
                </div>
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
                <div className="token-meta">
                  <span className="token-key">Cor Secundária</span>
                  <span className="token-desc-sub">--color-secondary</span>
                </div>
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
                <div className="token-meta">
                  <span className="token-key">Modo de Cor</span>
                  <span className="token-desc-sub">--color-theme-mode</span>
                </div>
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

            <div className="panel-chrome-footer">
              <span className="material-symbols-outlined">analytics</span>
              <span>Injetor CSS ativo &middot; localStorage sincronizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="howto-section" style={{ position: 'relative' }}>
        {/* Floating particles - decorative */}
        <div className="section-particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="section-inner">
          <div className="section-label">Integração</div>
          <h2 className="section-title">Integração de Alto Desempenho</h2>
          <p className="section-subtitle">
            Uma conexão transparente entre o seu front-end React, nossa inteligência e a API do ServiceNow.
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
          <div className="section-label">Transparência</div>
          <h2 className="section-title">Pronto para escalar<br /><span className="gradient-text">com segurança.</span></h2>
          <div className="objections-grid">
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">payments</span>
                <h3>&ldquo;Qual o retorno sobre o investimento (ROI) da solução?&rdquo;</h3>
              </div>
              <p>O ServiceFlow atua como um multiplicador de eficiência. Ao automatizar até 80% das demandas de pós-venda, você reduz drasticamente o custo por transação (CPT), mitiga estouros de SLA e retém clientes que seriam perdidos por lentidão.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">build</span>
                <h3>&ldquo;Quanto tempo de engenharia é necessário para a integração?&rdquo;</h3>
              </div>
              <p>Esforço técnico zero do seu time. Nossa equipe cuida de todo o processo de onboarding, configuração visual e mapeamento de fluxos. A homologação com suas instâncias do ServiceNow é realizada em tempo recorde.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">psychology</span>
                <h3>&ldquo;Como são gerenciados os casos complexos ou atípicos?&rdquo;</h3>
              </div>
              <p>Nossa IA possui inteligência de triagem calibrada por thresholds. Ao detectar um caso fora do escopo ou uma solicitação de transição humana, ela realiza o handoff em tempo real para a fila de suporte ativa no ServiceNow.</p>
            </div>
            <div className="objection-card">
              <div className="objection-q">
                <span className="material-symbols-outlined obj-icon">link</span>
                <h3>&ldquo;Existe compatibilidade com outras ferramentas do ecossistema?&rdquo;</h3>
              </div>
              <p>O ServiceNow é o hub de governança corporativa ideal. Conectamos nativamente a ERPs, CRMs (como Salesforce e HubSpot) e principais plataformas de e-commerce, consolidando os dados com total conformidade.</p>
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
        {/* Secondary cyan glow - decorative */}
        <div className="cta-glow-secondary" aria-hidden="true" />
        <div className="section-inner cta-inner">
          <div className="cta-urgency">
            <span className="material-symbols-outlined urgency-icon">bolt</span>
            <span>Vagas de onboarding limitadas para este ciclo de implantação</span>
          </div>
          <h2 className="cta-title">Transforme seu pós-venda<br /><span className="gradient-text">em um canal de crescimento.</span></h2>
          <p className="cta-subtitle">
            Elimine gargalos operacionais, reduza o tempo médio de atendimento (TMA) e garanta a fidelidade dos seus clientes com uma operação de suporte automatizada e integrada ao ServiceNow.
          </p>
          <button id="final-cta" className="btn-primary btn-large" onClick={onStartChat}>
            Agendar Demonstração →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }} title="Voltar ao Topo">
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

      {/* Premium Toast Notification */}
      {toast && (
        <div className="premium-toast">
          <span className="material-symbols-outlined toast-icon">info</span>
          <span className="toast-text">{toast}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Fechar notificação">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
