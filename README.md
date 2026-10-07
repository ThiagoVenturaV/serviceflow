# ✦ ServiceFlow

O **ServiceFlow** é uma interface White-Label de Suporte ao Cliente de próxima geração que une a interação em linguagem natural de IAs avançadas com plataformas de ITSM (como ServiceNow).

## ✨ Features

- **IA Conversacional Intuitiva**: Utiliza **Groq (GPT-OSS 120B)** para conversar com o cliente de forma fluída e extrair os dados estruturados do problema sem depender de formulários chatos e engessados.
- **Integração com ServiceNow**: Ao finalizar a coleta, o sistema dispara requisições POST automatizadas direto para a REST API do ServiceNow, gerando o ticket e devolvendo o protocolo em menos de 2 segundos.
- **Branding Dinâmico (White-Label Real)**: O frontend carrega dinamicamente a identidade visual (cor primária, logotipo e nome da IA) direto de System Properties (`sys_properties`) do ServiceNow através de uma API segura. Alterações no ServiceNow se refletem ao vivo no app.
- **Dashboard de Gestão no ServiceNow**: Painel administrativo corporativo ("ServiceFlow — Visão do Gestor") com widgets de contagem de status, tipos de chamados, TMA, NPS e triagem visual separando chamados com imagens anexadas.
- **Design System "Ethereal Conduit"**: Interface premium, baseada em glassmorphism, tons escuros (*obsidian*) e alto contraste, proporcionando foco e clareza absoluta na resolução do problema do seu cliente.
- **UX Mobile-First e Responsiva**: A arquitetura passa perfeitamente de uma Landing Page comercial para um Portal (Dashboard) interativo onde as ações ocorrem. PWA-ready e perfeitamente ajustável à telas mobile com Navbar inferior flutuante.

## 🚀 Stack de Tecnologias

- **React + Vite**: Performance implacável no lado do cliente.
- **Groq-SDK**: Inferência absurdamente rápida.
- **Google Material Symbols**: Ícones puros em vetores sem dor de cabeça.
- **Vanilla CSS Responsivo**: Flexível e livre das travas de componentes prontos para garantir sua identidade visual perfeita.

## 🛠️ Como preparar o ambiente

1. Clone o repositório na sua máquina.
2. Acesse a pasta do projeto e rode \`npm install\`.
3. Renomeie o arquivo \`.env.example\` para \`.env\` e configure \`GROQ_API_KEY\` e as credenciais server-side do **ServiceNow**. Nunca use o prefixo \`VITE_\` para segredos.
4. Inicialize o laboratório: \`npm run dev\`.

## 🧠 Fluxo de Arquitetura da Informação

\`\`\`
Cliente no Frontend (React)
        ↓ (Mensagem natural do usuário)
Groq LLaMA Inference extrai a intenção do usuário no formato de JSON Contextualizado
        ↓ (Dados Estruturados prontos: nome, email, ticket, defeito)
Frontend (React) processa o manifesto e finaliza coleta
        ↓ (HTTPS para funções serverless; sem credenciais no navegador)
API server-side usa uma conta ServiceNow de menor privilégio
\`\`\`

<br>
<p align="center"><i>Criado para revolucionar fluxos estáticos e automatizar suporte técnico de alto nível.</i></p>
