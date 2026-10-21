# VIA CRM

O núcleo de um CRM que acaba com o lead esquecido: toda Aplicação que chega entra no Pipeline, ganha a Tarefa de primeiro contato e aparece para ser chamada no dia certo.

É o CRM de referência da aula **"Como montar a especificação técnica de um projeto de IA"**, da Viver de IA. Use como referência do que o método entrega, ou remixe e expanda em vez de começar do zero. O método e o kit da aula estão em [github.com/alexandre-viverdeia/aula-especificacao-ia](https://github.com/alexandre-viverdeia/aula-especificacao-ia).

## Como ler este repositório

Este repositório mostra o método da aula aplicado a um projeto inteiro. Siga a ordem das etapas:

| Etapa | Onde ver | O que tem lá |
|---|---|---|
| 1. Ambiente | `AGENTS.md`, `.claude/skills/` e `docs/agents/` | o kit da aula: as skills e as regras que o agente segue neste projeto |
| 2. Grill | `CONTEXT.md` e `docs/adr/` | o glossário do negócio e as decisões difíceis de reverter, cada uma com o porquê |
| 3. Spec | [issue #1](https://github.com/alexandre-viverdeia/via-crm/issues/1) | o problema, a solução, 60 histórias de usuário, as decisões e o que ficou de fora |
| 4. Tickets | [issues #2 a #22](https://github.com/alexandre-viverdeia/via-crm/issues?q=is%3Aissue+label%3Aready-for-agent) | as fatias da spec, cada uma com "Blocked by" e critérios de aceite, fechadas apontando para o código |
| 5. Construir | issues #23 a #25 e o [histórico de commits](https://github.com/alexandre-viverdeia/via-crm/commits/main) | um ticket por conversa, com testes, fechado por um commit "Closes #N" |
| 6. Manter | [issues com o label `bug`](https://github.com/alexandre-viverdeia/via-crm/issues?q=is%3Aissue+is%3Aopen+label%3Abug) | o que a revisão do código encontrou, esperando triagem; os `good first issue` são um bom primeiro ticket |

O visual da Viver de IA está no `DESIGN.md`, escrito no ticket #3.

## O que tem

- **Landing page de aplicação** (`/aplicacao`): o formulário cria o contato, a empresa e o negócio no primeiro Estágio do Pipeline, com uma tarefa de primeiro contato para as próximas horas.
- **Pipeline de negócios** em kanban, com empresas, contatos e o histórico de cada negócio.
- **Tarefas do dia**: as abas Hoje, Vencidas e Amanhã mostram quem chamar.
- **Negócios em risco**: o painel e o menu "Em Risco" mostram os negócios parados há mais de 14 dias.
- **Follow-up com IA**: no negócio, a IA lê o histórico e escreve a mensagem para retomar o contato.
- **Painel do dono, metas de vendas e relatórios**: receita, conversão por estágio, tempo médio em cada estágio e motivos de perda.
- **Importação de contatos e empresas** por CSV, com o mapeamento das colunas.
- **Time**: convite por e-mail e papéis de acesso. O primeiro cadastro cria a Organização (com o Pipeline padrão) e vira Proprietário; os próximos entram só por convite.

## Stack

- React, TypeScript, Vite, Tailwind CSS e shadcn/ui
- Lovable Cloud: banco Postgres com Row Level Security, login e funções do servidor
- Lovable AI, chamado pelas funções `ai-email`, `ai-copilot` e `ai-insights`
- Vitest e Testing Library

## Como rodar

**No Lovable:** remixe o projeto. O banco, o login e a IA já vêm configurados.

**No seu computador:**

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto
npm run dev
```

```bash
npm test        # testes
npm run build   # build de produção
```

As mudanças no banco ficam em `supabase/migrations/`, e o esquema completo em `.lovable/consolidated_schema.sql`.

## Licença

Projeto aberto para estudo e uso como base dos seus próprios projetos, feito pela Viver de IA.
