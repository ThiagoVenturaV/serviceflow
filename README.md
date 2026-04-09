# ✦ ServiceFlow

O **ServiceFlow** é uma interface White-Label de Suporte ao Cliente de próxima geração que une a interação em linguagem natural de IAs avançadas com plataformas de ITSM (como ServiceNow).

## ✨ Features

- **IA Conversacional Intuitiva**: Utiliza **Groq (LLaMA-3 70B)** para conversar com o cliente de forma fluída e extrair os dados estruturados do problema sem depender de formulários chatos e engessados.
- **Integração com ServiceNow**: Ao finalizar a coleta, o sistema dispara requisições POST automatizadas direto para a REST API do ServiceNow, gerando o ticket e devolvendo o protocolo em menos de 2 segundos.
- **Design System "Ethereal Conduit"**: Interface premium, baseada em glassmorphism, tons escuros (*obsidian*) e alto contraste, proporcionando foco e clareza absoluta na resolução do problema do seu cliente.
- **UX Mobile-First e Responsiva**: A arquitetura passa perfeitamente de uma Landing Page comercial para um Portal (Dashboard) interativo onde as ações ocorrem. PWA-ready e perfeitamente ajustável à telas mobile com Navbar inferior flutuante.
- **Componentização de Marca**: Todo o portal funciona com tokens dinâmicos CSS, facilitando injeções White-Label. Cor primária, logos e nome da IA são customizáveis no Root level.

## 🚀 Stack de Tecnologias

- **React + Vite**: Performance implacável no lado do cliente.
- **Groq-SDK**: Inferência absurdamente rápida.
- **Google Material Symbols**: Ícones puros em vetores sem dor de cabeça.
- **Vanilla CSS Responsivo**: Flexível e livre das travas de componentes prontos para garantir sua identidade visual perfeita.

## 🛠️ Como preparar o ambiente

1. Clone o repositório na sua máquina.
2. Acesse a pasta do projeto e rode \`npm install\`.
3. Renomeie o arquivo \`.env.example\` para \`.env\` e adicione suas chaves (Principalmente \`VITE_GROQ_API_KEY\` e credenciais do **ServiceNow**).
4. Inicialize o laboratório: \`npm run dev\`.

## 🧠 Fluxo de Arquitetura da Informação

\`\`\`
Cliente no Frontend (React)
        ↓ (Mensagem natural do usuário)
Groq LLaMA Inference extrai a intenção do usuário no formato de JSON Contextualizado
        ↓ (Dados Estruturados prontos: nome, email, ticket, defeito)
Frontend (React) processa o manifesto e finaliza coleta
        ↓ (HTTPS POST Axios/Fetch com Token Basic)
Instância ServiceNow (Tabela customizada de pós-venda) / Outros ERPs
\`\`\`

<br>
<p align="center"><i>Criado para revolucionar fluxos estáticos e automatizar suporte técnico de alto nível.</i></p>
