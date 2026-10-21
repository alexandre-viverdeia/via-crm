# VIA CRM

O núcleo de um CRM que acaba com o lead esquecido: todo contato que chega entra no funil, ganha um próximo passo com data e aparece para ser chamado no dia certo.

É o CRM de referência da aula **"Como montar a especificação técnica de um projeto de IA"**, da Viver de IA. Use como referência do que o método entrega, ou remixe e expanda em vez de começar do zero. O método e o kit da aula estão em [github.com/alexandre-viverdeia/aula-especificacao-ia](https://github.com/alexandre-viverdeia/aula-especificacao-ia).

## O que tem

- **Landing page de aplicação** (`/aplicacao`): o formulário cria o contato, a empresa e o negócio no primeiro estágio do funil, com uma tarefa de primeiro contato para as próximas horas.
- **Funil de negócios** em kanban, com empresas, contatos e o histórico de cada negócio.
- **Tarefas do dia**: as abas Hoje, Vencidas e Amanhã mostram quem chamar.
- **Negócios em risco**: o painel e o menu "Em Risco" mostram os negócios parados há mais de 14 dias.
- **Follow-up com IA**: no negócio, a IA lê o histórico e escreve a mensagem para retomar o contato.
- **Painel do dono, metas de vendas e relatórios**: receita, conversão por estágio, tempo médio em cada estágio e motivos de perda.
- **Importação de contatos e empresas** por CSV, com o mapeamento das colunas.
- **Time**: convite por e-mail e papéis de acesso. O primeiro cadastro cria a empresa (com um funil padrão) e vira dono; os próximos entram por convite.

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
