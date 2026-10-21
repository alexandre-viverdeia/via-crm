# Um CRM por empresa: o primeiro cadastro cria a organização, os demais entram por convite

Cada instalação do VIA CRM atende uma empresa só. O primeiro cadastro cria a Organização, já com o funil padrão, e vira Proprietário; depois disso o cadastro fica fechado, e só entra quem recebeu um convite de um Proprietário ou Administrador. Os dados continuam isolados por `org_id`, com Row Level Security em todas as tabelas e as funções `get_user_org_id` e `has_role` nas políticas, para que voltar a ter várias empresas no mesmo banco seja uma decisão nova, e não uma reescrita.

## Opções consideradas

- **Cadastro aberto, uma Organização por conta (modelo SaaS):** descartado. O produto é o CRM de uma empresa, e cada aluno remixa o seu. Cadastro aberto deixaria qualquer pessoa criar conta no banco da empresa.
- **Sem organização, dados soltos por usuário:** descartado. O time precisa ver os mesmos Negócios, e o Proprietário precisa ver o time inteiro no Painel.

## Consequências

O formulário público da landing page não tem usuário logado, então precisa saber em qual Organização gravar: ele usa a primeira Organização do banco (veja `0003-formulario-publico-por-funcao-do-banco.md`).
