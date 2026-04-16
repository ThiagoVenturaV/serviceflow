import { CONFIG } from '../config.js';
import './LegalPage.css';

export default function PrivacyPolicyPage({ onBack, onNavigate }) {
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
          <span className="material-symbols-outlined">shield</span>
        </div>
        <h1>Política de Privacidade</h1>
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
            <li><a href="#pp-intro">Introdução</a></li>
            <li><a href="#pp-coleta">Dados que Coletamos</a></li>
            <li><a href="#pp-uso">Como Utilizamos seus Dados</a></li>
            <li><a href="#pp-compartilhamento">Compartilhamento de Dados</a></li>
            <li><a href="#pp-armazenamento">Armazenamento e Segurança</a></li>
            <li><a href="#pp-cookies">Cookies e Tecnologias</a></li>
            <li><a href="#pp-direitos">Seus Direitos (LGPD)</a></li>
            <li><a href="#pp-retencao">Retenção de Dados</a></li>
            <li><a href="#pp-alteracoes">Alterações nesta Política</a></li>
          </ol>
        </div>

        {/* 1 – Introdução */}
        <div className="legal-card" id="pp-intro">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">info</span>
            </div>
            <h2>1. Introdução</h2>
          </div>
          <p>
            A <strong>{CONFIG.brand.name}</strong> ("nós", "nosso" ou "Empresa") valoriza a privacidade dos seus 
            usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
            suas informações pessoais ao utilizar nossa plataforma de atendimento inteligente com integração ao ServiceNow.
          </p>
          <p>
            Ao acessar ou utilizar o {CONFIG.brand.name}, você concorda com as práticas descritas nesta política. 
            Recomendamos que leia este documento atentamente.
          </p>
        </div>

        {/* 2 – Dados que Coletamos */}
        <div className="legal-card" id="pp-coleta">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">database</span>
            </div>
            <h2>2. Dados que Coletamos</h2>
          </div>
          <h3>2.1 Dados fornecidos por você</h3>
          <ul>
            <li>Nome completo, e-mail e informações de contato</li>
            <li>Mensagens e conteúdo enviados ao assistente de IA</li>
            <li>Números de pedido e informações de suporte</li>
            <li>Dados de personalização de marca (cores, logos, preferências)</li>
          </ul>
          <div className="legal-divider" />
          <h3>2.2 Dados coletados automaticamente</h3>
          <ul>
            <li>Endereço IP e informações do navegador</li>
            <li>Dados de uso e navegação na plataforma</li>
            <li>Dados de dispositivo (tipo, sistema operacional)</li>
            <li>Timestamps de acesso e interações</li>
          </ul>
        </div>

        {/* 3 – Como Utilizamos */}
        <div className="legal-card" id="pp-uso">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <h2>3. Como Utilizamos seus Dados</h2>
          </div>
          <p>Utilizamos suas informações para as seguintes finalidades:</p>
          <ul>
            <li>Fornecer e melhorar o serviço de atendimento via IA</li>
            <li>Processar e registrar chamados no ServiceNow</li>
            <li>Personalizar a experiência white-label da sua marca</li>
            <li>Manter a segurança e prevenir fraudes</li>
            <li>Análise de uso para melhorias contínuas da plataforma</li>
            <li>Comunicação sobre atualizações e novidades do serviço</li>
          </ul>
        </div>

        {/* 4 – Compartilhamento */}
        <div className="legal-card" id="pp-compartilhamento">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">share</span>
            </div>
            <h2>4. Compartilhamento de Dados</h2>
          </div>
          <p>
            Não vendemos suas informações pessoais. Podemos compartilhar dados apenas nas seguintes situações:
          </p>
          <ul>
            <li><strong>ServiceNow:</strong> dados necessários para abertura e gestão de chamados</li>
            <li><strong>Provedores de IA:</strong> conteúdo das conversas para processamento das respostas (de forma anonimizada quando possível)</li>
            <li><strong>Prestadores de serviço:</strong> empresas que nos auxiliam na operação (hospedagem, analytics)</li>
            <li><strong>Obrigações legais:</strong> quando exigido por lei ou ordem judicial</li>
          </ul>
        </div>

        {/* 5 – Armazenamento */}
        <div className="legal-card" id="pp-armazenamento">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h2>5. Armazenamento e Segurança</h2>
          </div>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger suas informações pessoais, incluindo:
          </p>
          <ul>
            <li>Criptografia de dados em trânsito (TLS/SSL)</li>
            <li>Controles de acesso rigorosos e autenticação</li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Backups regulares com proteção adequada</li>
          </ul>
          <p>
            Seus dados são armazenados em servidores seguros. Embora nos esforcemos para proteger suas informações, 
            nenhum método de transmissão pela internet é 100% seguro.
          </p>
        </div>

        {/* 6 – Cookies */}
        <div className="legal-card" id="pp-cookies">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">cookie</span>
            </div>
            <h2>6. Cookies e Tecnologias</h2>
          </div>
          <p>
            Utilizamos cookies e tecnologias similares para melhorar sua experiência:
          </p>
          <ul>
            <li><strong>Cookies essenciais:</strong> necessários para o funcionamento da plataforma</li>
            <li><strong>Cookies de performance:</strong> ajudam a entender como os usuários interagem com o serviço</li>
            <li><strong>Cookies de preferências:</strong> armazenam suas configurações de personalização (tema, cores)</li>
          </ul>
          <p>
            Você pode gerenciar cookies através das configurações do seu navegador. Desabilitar certos cookies 
            pode impactar a funcionalidade da plataforma.
          </p>
        </div>

        {/* 7 – Direitos LGPD */}
        <div className="legal-card" id="pp-direitos">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <h2>7. Seus Direitos (LGPD)</h2>
          </div>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
          </p>
          <ul>
            <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
            <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
            <li><strong>Exclusão:</strong> solicitar a eliminação dos dados pessoais</li>
            <li><strong>Portabilidade:</strong> transferir seus dados para outro fornecedor</li>
            <li><strong>Revogação:</strong> retirar o consentimento a qualquer momento</li>
            <li><strong>Informação:</strong> saber com quem seus dados foram compartilhados</li>
          </ul>
          <p>
            Para exercer esses direitos, entre em contato pelo e-mail: <a href="mailto:privacidade@serviceflow.com.br">privacidade@serviceflow.com.br</a>
          </p>
        </div>

        {/* 8 – Retenção */}
        <div className="legal-card" id="pp-retencao">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <h2>8. Retenção de Dados</h2>
          </div>
          <p>
            Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, 
            a menos que um período de retenção mais longo seja exigido ou permitido por lei.
          </p>
          <p>
            Dados de conversas com a IA são retidos por até 12 meses após a última interação, podendo ser 
            anonimizados para fins estatísticos após esse período.
          </p>
        </div>

        {/* 9 – Alterações */}
        <div className="legal-card" id="pp-alteracoes">
          <div className="legal-card-header">
            <div className="legal-card-icon">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <h2>9. Alterações nesta Política</h2>
          </div>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações 
            significativas publicando a nova versão nesta página e atualizando a data de "Última atualização".
          </p>
          <p>
            Recomendamos que revise esta política regularmente para se manter informado sobre como protegemos suas informações.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="legal-contact">
          <div className="legal-contact-glow" />
          <h3>Dúvidas sobre privacidade?</h3>
          <p>Nossa equipe está pronta para ajudar com qualquer questão sobre seus dados.</p>
          <a href="mailto:privacidade@serviceflow.com.br" className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>mail</span>
            Entrar em Contato
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
            <span className="active-link">Política de Privacidade</span>
            <span onClick={() => onNavigate('terms')}>Termos de Uso</span>
            <span onClick={onBack}>Voltar ao Início</span>
          </div>
          <p className="legal-footer-copy">© 2026 {CONFIG.brand.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
