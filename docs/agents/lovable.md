# Lovable

O app roda no Lovable: este projeto usa o modelo React + Vite (React Router, TypeScript, Tailwind CSS e shadcn/ui), com o Lovable Cloud (banco Postgres, login e funções do servidor) e o Lovable AI (a IA do app). O código mora no repositório do GitHub ligado ao Lovable. O que você envia para a `main` aparece no editor do Lovable em segundos.

O nome, o id do projeto e o link do editor estão em `docs/agents/lovable-projeto.md`.

## Quem faz o quê

| Tarefa | Como | Crédito do Lovable |
|---|---|---|
| Código, telas, regras e testes | Você, no computador: commit e push na `main` | não gasta |
| Criar ou alterar tabelas, funções SQL e políticas de acesso | SQL pela ferramenta `query_database` do conector do Lovable | não gasta |
| Consultar ou inserir dados de teste | `query_database` | não gasta |
| Publicar o app | `deploy_project` do conector, ou o botão Publicar no editor | não gasta |
| Publicar ou remover funções do servidor (`supabase/functions/`) | `send_message` para o agente do Lovable, pedindo só o deploy, sem mexer no código | gasta |
| O que nenhum caminho acima resolve | `send_message` para o agente do Lovable | gasta |

O plano gratuito do Lovable dá 5 créditos por dia. Antes de qualquer `send_message`, explique ao usuário por que não há outro caminho e peça a autorização dele. Junte num pedido só tudo o que depende do agente.

## Mudanças no banco

1. Escreva o SQL (tabela, colunas, Row Level Security e políticas) e rode com `query_database`.
2. Salve o mesmo SQL em `supabase/migrations/<AAAAMMDDHHMMSS>_<descricao>.sql`, para ficar no histórico. O esquema completo de partida está em `.lovable/consolidated_schema.sql`.
3. Atualize à mão `src/integrations/supabase/types.ts`. O Lovable não regenera esse arquivo quando o SQL vem de fora. Consulte `information_schema.columns` com `query_database` e siga o formato que já está no arquivo, com `Row`, `Insert` e `Update` para cada tabela.
4. Rode `npx tsc --noEmit` antes do commit.

Toda tabela nasce com Row Level Security ligada e isolada por `org_id` (veja `docs/adr/0002-um-crm-por-empresa.md`). O `query_database` roda no banco de verdade: não apague dados nem tabelas sem pedir.

## A IA do app (Lovable AI)

A IA é chamada só pelas funções do servidor, em `supabase/functions/`, nunca pelo navegador. A tela chama a função com `supabase.functions.invoke("<nome>", { body })`, e a função chama o gateway do Lovable. A chave `LOVABLE_API_KEY` já existe no servidor do Lovable Cloud: nunca a coloque no código nem na conversa.

```ts
const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
});
```

No computador essa chave não existe. A função devolve um erro claro quando ela falta, a lógica em volta é coberta por testes e a chamada real é conferida no preview do Lovable.

## No computador

- Instale as dependências com `npm install --no-package-lock`. O Lovable usa o `bun.lock`; não atualize o `package-lock.json`.
- Antes de cada push, rode `npx tsc --noEmit` e `npm test`.
- O usuário confere o resultado no preview do editor do Lovable.
- Não reescreva o histórico que já foi enviado (force push, rebase ou amend de commits enviados): o Lovable perde o histórico do projeto.
