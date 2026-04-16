import { CONFIG } from '../config.js';
import './LegalPage.css';

export default function TermsOfUsePage({ onBack, onNavigate }) {
  return (
    <div className="legal-page">
      {/* Nav */}
      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <div className="legal-nav-logo" onClick={onBack} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onBack()}>
            <img src="/logoServiceFlow.png" alt="ServiceFlow Logo" className="logo-mark" />
            <span className="logo-text">{CONFIG.brand.name}</span>
          </div>
          <button className="legal-nav-back" onClick={onBack}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            Voltar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="legal-hero">
        <div className="legal-hero-glow" />
        <div className="legal-hero-icon">
          <span className="material-symbols-outlined">description</span>
        </div>
        <h1>Termos de Uso</h1>
        <div className="legal-hero-badge">
          Última atualização: 15 de abril de 2026
        </div>
      </section>

      {/* Content */}
      <main className="legal-content">

        {/* TOC */}
        <div className="legal-toc">
          <div className="legal-toc-title">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>list</span>
            Índice
          </div>
          <ol>
            <li><a href="#tu-aceitacao">Aceitação dos Termos</a></li>
            <li><a href="#tu-servico">Descrição do Serviço</a></li>
            <li><a href="#tu-cadastro">Cadastro e Conta</a></li>
            <li><a href="#tu-uso">Uso Aceitável</a></li>
            <li><a href="#tu-propriedade">Propriedade Intelectual</a></li>
            <li><a href="#tu-whitelabel">White-Label e Personalização</a></li>
            <li><a href="#tu-ia">Uso de Inteligência Artificial</a></li>
            <li><a href="#tu-limitacao">Limitação de Responsabilidade</a></li>
            <li><a href="#tu-rescisao">Rescisão</a></li>
            <li><a href="#tu-legislacao">Legislação Aplicável</a></li>
          </ol>
        </div>

        {/* 1 – Aceitação */}
        <div className="legal-card" id="tu-aceitacao">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">handshake</span>
            </div>
            <h2>1. Aceitação dos Termos</h2>
          </div>
          <p>
            Ao acessar e utilizar a plataforma <strong>{CONFIG.brand.name}</strong>, você declara ter lido, compreendido 
            e aceito integralmente estes Termos de Uso. Se você não concordar com algum dos termos aqui dispostos, 
            não utilize nossos serviços.
          </p>
          <p>
            Estes termos constituem um acordo legal vinculante entre você ("Usuário") e a {CONFIG.brand.name} ("Empresa"), 
            regulando o uso de todos os serviços oferecidos pela plataforma.
          </p>
        </div>

        {/* 2 – Descrição do Serviço */}
        <div className="legal-card" id="tu-servico">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <h2>2. Descrição do Serviço</h2>
          </div>
          <p>
            O {CONFIG.brand.name} é uma plataforma de atendimento inteligente que utiliza Inteligência Artificial 
            para coletar informações e abrir chamados automaticamente via integração com o ServiceNow. 
            O serviço inclui:
          </p>
          <ul>
            <li>Interface de chat inteligente com IA conversacional</li>
            <li>Integração automatizada com ServiceNow REST API</li>
            <li>Personalização white-label completa (cores, logos, identidade visual)</li>
            <li>Geração automática de protocolos de atendimento</li>
            <li>Dashboard de gerenciamento de chamados</li>
          </ul>
        </div>

        {/* 3 – Cadastro */}
        <div className="legal-card" id="tu-cadastro">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <h2>3. Cadastro e Conta</h2>
          </div>
          <p>Para utilizar determinadas funcionalidades, pode ser necessário criar uma conta. Ao se cadastrar, você se compromete a:</p>
          <ul>
            <li>Fornecer informações verdadeiras, completas e atualizadas</li>
            <li>Manter a confidencialidade de suas credenciais de acesso</li>
            <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
            <li>Ser responsável por todas as atividades realizadas com sua conta</li>
          </ul>
          <p>
            A Empresa reserva-se o direito de suspender ou cancelar contas que violem estes termos ou que 
            apresentem atividades suspeitas.
          </p>
        </div>

        {/* 4 – Uso Aceitável */}
        <div className="legal-card" id="tu-uso">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h2>4. Uso Aceitável</h2>
          </div>
          <p>Ao utilizar o {CONFIG.brand.name}, você concorda em NÃO:</p>
          <ul>
            <li>Utilizar o serviço para fins ilegais ou não autorizados</li>
            <li>Tentar acessar sistemas, dados ou áreas restritas sem autorização</li>
            <li>Enviar conteúdo malicioso, vírus ou código prejudicial</li>
            <li>Realizar engenharia reversa ou descompilar o software</li>
            <li>Utilizar bots ou scripts automatizados para sobrecarregar a plataforma</li>
            <li>Reproduzir, distribuir ou criar obras derivadas sem autorização</li>
            <li>Coletar informações pessoais de outros usuários sem consentimento</li>
          </ul>
        </div>

        {/* 5 – Propriedade Intelectual */}
        <div className="legal-card" id="tu-propriedade">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">copyright</span>
            </div>
            <h2>5. Propriedade Intelectual</h2>
          </div>
          <p>
            Todo o conteúdo da plataforma {CONFIG.brand.name}, incluindo mas não limitado a textos, gráficos, 
            logotipos, ícones, imagens, código-fonte, design de interface e software, é de propriedade 
            exclusiva da Empresa ou de seus licenciadores.
          </p>
          <p>
            O uso do serviço não concede ao Usuário nenhum direito de propriedade intelectual sobre nossos 
            produtos, marcas ou conteúdos, exceto o direito limitado de uso conforme estes termos.
          </p>
        </div>

        {/* 6 – White-Label */}
        <div className="legal-card" id="tu-whitelabel">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <h2>6. White-Label e Personalização</h2>
          </div>
          <p>
            O {CONFIG.brand.name} oferece recursos de personalização white-label que permitem ao Usuário 
            customizar a aparência da interface. Ao utilizar esses recursos:
          </p>
          <ul>
            <li>Você garante que possui os direitos sobre os logos e marcas utilizados</li>
            <li>A Empresa não se responsabiliza por violações de propriedade intelectual de terceiros causadas pela personalização do Usuário</li>
            <li>Personalizações realizadas não transferem propriedade sobre o software base</li>
            <li>A Empresa pode remover conteúdos que violem direitos de terceiros</li>
          </ul>
        </div>

        {/* 7 – IA */}
        <div className="legal-card" id="tu-ia">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h2>7. Uso de Inteligência Artificial</h2>
          </div>
          <p>
            O {CONFIG.brand.name} utiliza modelos de Inteligência Artificial para processar e responder 
            mensagens dos usuários. Ao utilizar o serviço, você reconhece que:
          </p>
          <ul>
            <li>As respostas geradas pela IA podem não ser 100% precisas ou completas</li>
            <li>A IA não substitui aconselhamento profissional (jurídico, médico, financeiro, etc.)</li>
            <li>As conversas podem ser utilizadas para melhorar o modelo, de forma anonimizada</li>
            <li>A Empresa não se responsabiliza por decisões tomadas com base nas respostas da IA</li>
            <li>Não envie informações altamente sensíveis (senhas, dados bancários) no chat</li>
          </ul>
        </div>

        {/* 8 – Limitação */}
        <div className="legal-card" id="tu-limitacao">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h2>8. Limitação de Responsabilidade</h2>
          </div>
          <p>
            O serviço é fornecido "como está" e "conforme disponível". Na máxima extensão permitida 
            pela legislação aplicável:
          </p>
          <ul>
            <li>A Empresa não garante que o serviço será ininterrupto ou livre de erros</li>
            <li>Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais</li>
            <li>A responsabilidade total da Empresa é limitada ao valor pago pelo Usuário nos últimos 12 meses</li>
            <li>Eventos de força maior (desastres naturais, falhas de terceiros) isentam a Empresa de responsabilidade</li>
          </ul>
          <p>
            A Empresa envidará seus melhores esforços para manter o serviço disponível com 99,9% de uptime.
          </p>
        </div>

        {/* 9 – Rescisão */}
        <div className="legal-card" id="tu-rescisao">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <h2>9. Rescisão</h2>
          </div>
          <p>
            Qualquer das partes poderá encerrar esta relação a qualquer momento:
          </p>
          <ul>
            <li><strong>Pelo Usuário:</strong> pode cancelar sua conta a qualquer momento, entrando em contato conosco</li>
            <li><strong>Pela Empresa:</strong> pode suspender ou encerrar o acesso em caso de violação destes termos</li>
          </ul>
          <p>
            Em caso de rescisão, os dados do Usuário serão tratados conforme nossa 
            <span onClick={() => onNavigate('privacy')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}> Política de Privacidade</span>.
            As cláusulas de propriedade intelectual e limitação de responsabilidade sobreviverão à rescisão.
          </p>
        </div>

        {/* 10 – Legislação */}
        <div className="legal-card" id="tu-legislacao">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">balance</span>
            </div>
            <h2>10. Legislação Aplicável</h2>
          </div>
          <p>
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para dirimir 
            quaisquer controvérsias oriundas destes termos, fica eleito o foro da comarca de São Paulo/SP, 
            com exclusão de qualquer outro, por mais privilegiado que seja.
          </p>
          <p>
            Se qualquer disposição destes termos for considerada inválida ou inexequível, as demais 
            disposições permanecerão em pleno vigor e efeito.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="legal-contact">
          <div className="legal-contact-glow" />
          <h3>Precisa de esclarecimentos?</h3>
          <p>Entre em contato com nossa equipe jurídica para qualquer dúvida sobre estes termos.</p>
          <a href="mailto:juridico@serviceflow.com.br" className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>mail</span>
            Falar com Jurídico
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <div className="legal-footer-logo">
            <img src="/logoServiceFlow.png" alt="ServiceFlow Logo" className="logo-mark" />
            <span className="logo-text">{CONFIG.brand.name}</span>
          </div>
          <div className="legal-footer-links">
            <span onClick={() => onNavigate('privacy')}>Política de Privacidade</span>
            <span className="active-link">Termos de Uso</span>
            <span onClick={onBack}>Voltar ao Início</span>
          </div>
          <p className="legal-footer-copy">© 2026 {CONFIG.brand.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
