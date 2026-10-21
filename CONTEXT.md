# VIA CRM

O núcleo comercial da Viver de IA: acompanha cada lead da Mentoria, da Aplicação ao fechamento, para que nenhum fique esquecido sem próximo passo.

## Linguagem

### Produto

**Mentoria**:
O produto que a Viver de IA vende: a mentoria em IA para empresários, comprada pela empresa (venda B2B). Todo Negócio que nasce de uma Aplicação se chama "Mentoria · <empresa>".
_Evite_: curso, programa

**Aplicação**:
O formulário público da landing page em que o empresário se candidata à Mentoria. Cada Aplicação vira um Contato, uma Empresa, um Negócio no primeiro Estágio e a Tarefa de primeiro contato.
_Evite_: inscrição, cadastro, formulário de lead

### Organização e time

**Organização**:
A empresa dona do CRM, a Viver de IA. Cada instalação do CRM tem uma só (veja `docs/adr/0002-um-crm-por-empresa.md`).
_Evite_: empresa (reservado para o cliente), conta, tenant

**Membro**:
Uma pessoa do time que usa o CRM. Entra por convite e tem um Papel.
_Evite_: usuário, colaborador

**Papel**:
O nível de acesso de um Membro: Proprietário (quem criou a Organização), Administrador (convida e organiza o time) ou Membro.
_Evite_: owner, admin, perfil, cargo

**Responsável**:
O Membro que cuida de um Contato, de uma Empresa ou de um Negócio e faz os próximos passos dele.
_Evite_: vendedor, dono, owner

**Equipe**:
Um grupo de Membros dentro do time, usado para dar Metas a um grupo.
_Evite_: time (para o grupo)

### Cadastros

**Empresa**:
A empresa cliente, ou candidata a cliente, onde trabalham os Contatos.
_Evite_: conta, cliente, organização

**Contato**:
Uma pessoa com quem o time conversa, ligada ou não a uma Empresa.
_Evite_: lead (como cadastro), pessoa de contato

**Status do contato**:
Em que ponto da relação o Contato está: Lead, Prospect, Cliente ou Churned.
_Evite_: estágio (é do Negócio)

### Pipeline

**Pipeline**:
A sequência de Estágios por onde os Negócios passam. O padrão se chama "Vendas".
_Evite_: funil (na tela), esteira

**Estágio**:
Uma fase do Pipeline. O padrão tem cinco: Novo lead, Primeiro contato, Diagnóstico agendado, Proposta enviada e Negociação.
_Evite_: etapa, fase, coluna

**Negócio**:
Uma venda em andamento para um Contato ou uma Empresa, com Valor, Estágio, Responsável e Fechamento.
_Evite_: oportunidade, deal, lead

**Status do negócio**:
Aberto, Ganho ou Perdido. Ganho e Perdido não são Estágios: o Negócio fecha no Estágio em que estava (veja `docs/adr/0005-ganho-e-perdido-sao-status.md`).
_Evite_: estágio final, fechado

**Motivo da perda**:
Por que um Negócio foi Perdido, escolhido ao marcar a perda.
_Evite_: razão de perda

**Fechamento**:
A data em que se espera fechar o Negócio.
_Evite_: data de fechamento, prazo

**Previsão**:
A soma dos Negócios abertos por mês de Fechamento, em faixas de probabilidade: Comprometido (80% ou mais), Melhor caso (50% ou mais) e Pipeline total.
_Evite_: forecast, projeção

**Qualificação BANT**:
A checagem de orçamento, decisor, necessidade e prazo de um Negócio, que dá uma nota de 0 a 100.
_Evite_: score, lead score

### Rotina

**Atividade**:
Qualquer registro do que aconteceu ou vai acontecer com um Contato ou Negócio: Ligação, Email, Reunião, Nota ou Tarefa. As Atividades formam o histórico.
_Evite_: interação, evento

**Tarefa**:
Uma Atividade com data para fazer: é o próximo passo de um Contato ou Negócio.
_Evite_: próxima ação, lembrete, to-do

**Vencida**:
Uma Tarefa não concluída cuja data já passou.
_Evite_: atrasada, vencido

**Negócio em risco**:
Um Negócio aberto que precisa de atenção: está sem Atividade há dias demais ou com o Fechamento chegando ou passado. As regras ficam em "Regras de Risco".
_Evite_: negócio esfriando, parado

**Follow-up**:
A mensagem para retomar a conversa com o Contato de um Negócio, escrita pela IA a partir do histórico.
_Evite_: cobrança, lembrete

### Resultados

**Painel**:
A tela inicial (Dashboard) com os números do dono: receita, ganhos, win rate, ticket médio, ciclo e o Pipeline por Estágio.
_Evite_: home, painel do dono

**Meta**:
Um alvo mensal de receita, Negócios ganhos, Atividades ou Contatos novos, para um Membro, uma Equipe ou a Organização.
_Evite_: objetivo, quota
