# O formulário público grava por uma função do banco, não por acesso anônimo às tabelas

A Aplicação da landing page (`/aplicacao`) é preenchida por quem não tem login. Em vez de liberar escrita anônima nas tabelas, o formulário chama uma única função do banco, `submit_application`, que roda com permissão própria (`SECURITY DEFINER`) e é a única coisa que o visitante pode executar. Ela valida os campos, reaproveita a Empresa (pelo nome) e o Contato (pelo e-mail) quando já existem, cria o Negócio no primeiro Estágio do funil, guarda as respostas numa nota e agenda a Tarefa de primeiro contato para dali a duas horas, com o Proprietário como Responsável.

## Opções consideradas

- **Políticas de RLS liberando `insert` anônimo em contatos, empresas e negócios:** descartado. Qualquer pessoa com a chave pública poderia gravar o que quisesse nessas tabelas, sem a validação e sem a regra de "todo lead nasce com próximo passo".
- **Uma função do servidor (Edge Function) com a chave de serviço:** funcionaria, mas é mais uma peça para publicar pelo agente do Lovable, que gasta crédito, para fazer o que uma função SQL faz numa transação só.
