# Guia de Configuração e Integração — ServiceNow & ServiceFlow

Este guia descreve o passo a passo para configurar e implementar as funcionalidades do **ServiceFlow** na plataforma **ServiceNow** (aplicação com escopo, tabelas, regras de acesso ACL, notificações, automações e integrações).

---

## 1. Estrutura da Aplicação (Tabelas e Modelagem)

### A. Criação da Aplicação Customizada
1. No ServiceNow, acesse **System Applications > Studio**.
2. Clique em **Create Application**.
3. Defina o nome como `ServiceFlow` (o sistema gerará um escopo único, ex: `x_12345_sf`).
4. As tabelas, regras e fluxos criados a seguir devem residir sob o escopo desta aplicação.

### B. Tabela de Clientes e Atendentes (Herança de sys_user)
1. No Studio, clique em **Create Application File > Table > Create**.
2. **Tabela de Clientes (`x_sf_cliente`):**
   * **Label:** Cliente
   * **Extends table:** Usuário (`sys_user`). *(Nota: Certifique-se de que a tabela sys_user está marcada como extensível em seu dicionário do sistema).*
   * **Campos adicionais:**
     * **Ativo (`active`):** True/False.
     * **Turno/Horário de Preferência (`turno`):** Choice (opções: Manhã, Tarde, Noite).
     * **Localização (`location`):** Reference para `cmn_location`.
   * **Layout do Formulário:** Adicione o campo nativo **Localização (`location`)** e **Turno** ao formulário.
   * **Layout de Lista:** Configure as colunas para exibir: *Nome, Turno, Localização e Ativo*.
3. **Tabela de Atendentes/Agentes (`x_sf_atendente`):**
   * **Label:** Atendente
   * **Extends table:** Usuário (`sys_user`).
   * **Campos adicionais:**
     * **Número de Matrícula (`registration_number`):** String (40 caracteres).
     * **Data de Contratação (`hiring_date`):** Date.
     * **Data de Desligamento (`resignation_date`):** Date.
     * **Ativo (`active`):** True/False.
   * **Layout do Formulário:** Adicione o campo **Localização** nativo e os campos customizados acima.
   * **Layout de Lista:** Configure para exibir: *Nome, Número de Matrícula, Data de Contratação, Localização e Ativo*.

### C. Tabela de Serviços/Produtos (`x_sf_servico`)
1. Crie uma nova tabela:
   * **Label:** Serviço Acadêmico / Categoria de Produto
   * **Campos:**
     * **Nome (`name`):** String (40 caracteres).
     * **Responsável (`assigned_to`):** Reference para a tabela de Atendentes (`x_sf_atendente`).
     * **Nível de Criticidade (`priority`):** Choice (opções: Baixo, Médio, Alto).

### D. Tabela M2M de Avaliações/NPS (`x_sf_nps`)
1. Crie uma tabela Muitos para Muitos associando Clientes a Serviços (`sys_m2m.list` no navegador do ServiceNow ou criando uma tabela de correlação).
   * **Campos adicionais:**
     * **Nota de Atendimento (`rating`):** Integer (1 a 5).
     * **Comentários (`comments`):** String (4000 caracteres).
2. Configure as **Listas Relacionadas (Related Lists)**:
   * No formulário do Cliente, exiba a lista relacionada de Avaliações mostrando as notas e comentários.
   * No formulário do Serviço, exiba a lista de avaliações de clientes.

### E. Cadastro de Localidades
1. Acesse **User Administration > Locations** (`cmn_location.list`).
2. Cadastre as filiais de atendimento regionais:
   * `EDX-PE` (Recife)
   * `EDX-RJ` (Rio de Janeiro)
   * `EDX-MG` (Belo Horizonte)
3. Atribua estas localidades aos registros de Clientes e Atendentes criados.

---

## 2. Filtros Salvos (`sys_filter`)

Crie filtros globais para exibição rápida de listagens nas tabelas:
* **Atendentes Ativos:** Tabela `x_sf_atendente` | Condição: `active = true`.
* **Atendentes Inativos:** Tabela `x_sf_atendente` | Condição: `active = false`.
* **Clientes Ativos:** Tabela `x_sf_cliente` | Condição: `active = true`.
* **Clientes Inativos:** Tabela `x_sf_cliente` | Condição: `active = false`.
* **Serviços Críticos:** Tabela `x_sf_servico` | Condição: `priority = Alto`.

---

## 3. Usuários e Grupos (Estrutura Organizacional)

1. **Usuários:** Cadastre pelo menos 6 clientes (`sys_user`), 2 atendentes e 1 supervisor/gerente no sistema.
2. **Hierarquia e Gerência:**
   * No cadastro dos atendentes, defina o campo **Manager (Gerente)** apontando para o usuário Supervisor.
3. **Grupos (`sys_user_group`):**
   * **Grupo Nacional (`ServiceFlow Nacional`):** Grupo pai de todas as operações.
   * **Grupos Regionais:**
     * Crie grupos regionais (ex: `ServiceFlow RJ`, `ServiceFlow PE`, `ServiceFlow MG`).
     * Defina o **Parent Group (Grupo Pai)** de cada grupo regional como `ServiceFlow Nacional`.
   * **Grupos de Usuários:**
     * Crie grupos específicos de *Clientes* e *Atendentes* dentro de cada regional (ex: `Atendentes PE` pertencendo ao grupo pai `ServiceFlow PE`).

---

## 4. Roles (Funções do Sistema)

1. No Studio, acesse **Create Application File > Role > Create**.
2. Crie as seguintes roles:
   * `sf_usuario`: Role básica concedida a todos os usuários da plataforma.
   * `sf_cliente`: Role para usuários finais (clientes).
   * `sf_atendente`: Role para analistas de suporte.
   * `sf_admin`: Role de supervisão/gerência concedida ao supervisor.
3. Atribua as roles aos respectivos grupos criados na Etapa 3.

---

## 5. ACLs (Access Control Lists - Regras de Segurança)

Acesse **System Security > Access Control (ACL)** e configure as seguintes regras:

1. **Tabela de Clientes (`x_sf_cliente`):**
   * **Regra de Leitura (Read):**
     * Role: `sf_cliente`. Condição: `sys_id = javascript:gs.getUserID()` (o cliente só lê o próprio registro).
     * Role: `sf_atendente` (pode ler todos).
   * **Regra de Escrita (Write):**
     * Role: `sf_cliente`. Permite alterar apenas campos como *Telefone* ou *E-mail*, mas não o *Turno* ou *Status Ativo*.
     * Role: `sf_admin` (pode alterar qualquer campo).
2. **Tabela de Chamados/Tickets (`x_sf_ticket`):**
   * **Regra de Leitura (Read):**
     * Role: `sf_cliente`. Condição: `caller_id = javascript:gs.getUserID()` (cliente só lê chamados abertos por ele).
     * Role: `sf_atendente` e `sf_admin` (leem todos).
   * **Regra de Escrita e Criação (Write & Create):**
     * Role: `sf_cliente` (pode criar e editar seus próprios chamados).
     * Role: `sf_atendente` (pode alterar status de qualquer chamado, mas não pode deletar registros).
   * **Regra de Exclusão (Delete):**
     * Apenas a role `sf_admin` possui permissão de exclusão (`delete`).
3. **Acesso Limitado à Tabela de Atendentes (`x_sf_atendente`):**
   * **Regra de Leitura no Campo Nome:**
     * Crie uma ACL de leitura para o campo *Nome* (`x_sf_atendente.name`). Role: `sf_cliente` (clientes podem ler apenas o nome dos atendentes associados aos chamados).
     * Crie outra ACL para bloquear a leitura de outros campos sensíveis (como matrícula e contratação) para a role `sf_cliente`.

---

## 6. Dashboards e Relatórios

1. Acesse **Reports > View / Run > Create a Report**.
2. **Relatório 1: Atendentes Ativos por Unidade**
   * **Source Type:** Table (`x_sf_atendente`).
   * **Type:** Bar (Barras) ou Donut (Rosca).
   * **Group by:** `location` (Localização).
   * **Filter:** `active = true`.
3. **Relatório 2: Chamados por Status e Unidade**
   * **Source Type:** Table (`x_sf_ticket`).
   * **Type:** Stacked Bar (Barras empilhadas).
   * **Group by:** `location`. Stack by: `state` (Status).
4. **Dashboard:**
   * Acesse **Self-Service > Dashboards > New**.
   * Adicione os relatórios acima ao painel e configure a permissão de compartilhamento apenas para a role `sf_admin`.

---

## 7. Notificações por E-mail

Acesse **System Notification > Email > Notifications**:

1. **Notificação de Lançamento de Avaliação/NPS:**
   * **Table:** Avaliação (`x_sf_nps`).
   * **When to send:** Record inserted (Inserido).
   * **Who will receive:** Cliente associado.
   * **Subject:** `Avaliação recebida para o serviço: ${service.name}`
   * **Message HTML:**
     ```html
     Olá ${client.name},
     Agradecemos sua nota ${rating} atribuída ao atendimento do serviço ${service.name}.
     Seu comentário registrado foi: "${comments}".
     ```
2. **Notificação de Chamado Atribuído ao Atendente:**
   * **Table:** Chamado (`x_sf_ticket`).
   * **When to send:** Record updated | Field `assigned_to` changes.
   * **Who will receive:** Atendente atribuído (`assigned_to`).
   * **Subject:** `Novo chamado sob sua responsabilidade: ${number}`
   * **Message HTML:**
     ```html
     Olá ${assigned_to.name},
     Você foi designado como responsável pelo chamado ${number} (Tipo: ${type}).
     Prazo estipulado (SLA): ${sla_due}.
     ```

---

## 8. Knowledge Management (Base de Conhecimento)

1. **Ativação:** Garanta que o plugin **Advanced Knowledge Management** esteja ativo em **System Definition > Plugins**.
2. **Base de Conhecimento ("Central de Ajuda"):**
   * Acesse **Knowledge > Administration > Knowledge Bases > New**.
   * **Title:** Central de Ajuda ServiceFlow.
   * **Owner:** Supervisor/Admin.
3. **Controle de Acesso (User Criteria):**
   * Em **Can Read**, adicione a role `sf_usuario` (todos leem).
   * Em **Can Contribute**, crie uma User Criteria restringindo apenas para membros do grupo `Atendentes PE` ou `sf_admin`.
4. **Template de Artigos:**
   * Crie um template de Artigo com 3 seções: *Responsáveis pelo Processo, Público-alvo e Conteúdo*.
5. **Artigos Restritos:**
   * Publique um artigo usando o template acima (ex: "Planos de Resolução de Crises de Atendimento").
   * Configure os critérios de acesso do artigo específico para que apenas a role `sf_atendente` possa visualizá-lo.

---

## 9. Record Producer e Flow Designer (Automação de Entrada)

### A. Tabela de Solicitações Acadêmicas/De Suporte (`x_sf_solicitacao`)
1. Crie uma tabela herdada de `task` (Tarefa) chamada *Solicitação de Serviços*.

### B. Record Producer
1. Acesse **Service Catalog > Catalog Definitions > Record Producers**.
2. Clique em **New** e configure:
   * **Name:** Solicitação de Suporte Pós-Venda.
   * **Table name:** Tabela de Solicitações (`x_sf_solicitacao`).
   * **Catalog:** Service Catalog.
   * **Category:** Suporte Geral (crie uma nova se necessário).
3. **Variáveis do Record Producer:**
   * `nome_cliente` (Reference para `sys_user` - preenchimento automático com o usuário da sessão).
   * `produto_suporte` (Reference para a tabela de produtos).
   * `categoria_suporte` (Choice: Troca, Reembolso, Garantia).
   * `justificativa` (Multi-line text).

### C. Flow Designer (Automação do Fluxo de Trabalho)
1. Acesse **Process Automation > Flow Designer**.
2. Clique em **New > Flow**.
3. **Trigger (Gatilho):** Record Created na tabela `x_sf_solicitacao`.
4. **Ações do Fluxo:**
   * **Passo 1 (Update Record):** Atualizar o status da solicitação para "Em andamento".
   * **Passo 2 (Ask for Approval):** Solicitar aprovação do grupo `Supervisores`. Regra: *Anyone approves or rejects* (basta um aprovar/rejeitar).
   * **Passo 3 (Conditional Branch):**
     * **Se aprovado:**
       * Cadastrar o chamado automaticamente na fila ativa de atendimento do Atendente da regional correspondente.
       * Enviar e-mail de confirmação ao cliente.
     * **Se rejeitado:**
       * Mudar o status da solicitação para "Cancelado".
       * Adicionar comentário informando a recusa.

---

## 10. UI Policies e Business Rules

### A. UI Policy (Lógica de Tela)
* **Objetivo:** Tornar o campo "Número de Série" e "Nota Fiscal" visível e obrigatório apenas quando o tipo de atendimento for "Garantia".
* **Configuração:**
  * **Table:** Chamado (`x_sf_ticket`).
  * **Conditions:** `Tipo [type] IS Garantia`.
  * **UI Policy Actions:**
    * Campo `serial_number` -> Visible: True, Mandatory: True.
    * Campo `invoice` -> Visible: True, Mandatory: True.

### B. Business Rule (Regras de Servidor)
* **Objetivo:** Inativar automaticamente um Atendente no sistema se a data de desligamento inserida for igual ou anterior à data atual.
* **Configuração:**
  * **Table:** Atendente (`x_sf_atendente`).
  * **When to run:** Before Insert/Update.
  * **Condition:** `resignation_date` is not empty.
  * **Script (Advanced):**
    ```javascript
    (function executeRule(current, previous /*null when async*/) {
        var today = new GlideDate();
        var resignation = new GlideDate();
        resignation.setValue(current.resignation_date);
        
        if (resignation.onOrBefore(today)) {
            current.active = false;
        }
    })(current, previous);
    ```

---

## 11. Endpoint Customizado para Exposição de Permissões (ACLs)

Para permitir que o frontend do **ServiceFlow** consulte em tempo real as permissões reais do usuário com base nas ACLs ativas do ServiceNow, configure uma **Scripted REST API**:

1. Acesse **System Web Services > Scripted REST APIs > New**.
2. **Name:** ServiceFlow Portal Integration.
3. **API ID:** `sf_portal`.
4. Clique em **Submit**.
5. Na aba **Resources**, clique em **New** para criar o recurso de verificação de permissões:
   * **Name:** check_permissions
   * **HTTP Method:** GET
   * **Relative Path:** `/permissions`
   * **Script (JavaScript Server-Side):**
     ```javascript
     (function process(request, response) {
         var tableName = request.queryParams.table ? request.queryParams.table[0] : 'x_sf_ticket';
         var gr = new GlideRecord(tableName);
         
         // Captura dinamicamente as permissões baseadas nas ACLs ativas do usuário logado
         var result = {
             canRead: gr.canRead(),
             canWrite: gr.canWrite(),
             canCreate: gr.canCreate(),
             canDelete: gr.canDelete(),
             roles: gs.getUser().getUserRoles().toArray() // Retorna as roles associadas ao usuário
         };
         
         response.setStatus(200);
         response.setBody(result);
     })(request, response);
     ```

Dessa forma, ao fazer login, o **ServiceFlow** consulta o endpoint `GET /api/x_sf/sf_portal/permissions?table=x_sf_ticket` utilizando as credenciais do usuário autenticado e ajusta a interface de forma 100% dinâmica.
