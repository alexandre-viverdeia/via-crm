

## Plano: Correções Pós-Remix do FlowCRM

### Diagnóstico do estado atual

| Item | Status | Ação necessária |
|---|---|---|
| Rota `/setup` no App.tsx | ❌ Ausente | Adicionar rota + lazy import |
| Função `create_organization_for_user` | ✅ Existe no DB | Nenhuma |
| Função `handle_new_user` | ✅ Existe no DB | Nenhuma |
| Trigger `on_auth_user_created` | ❌ Ausente | Recriar via migration |
| Funções RLS (`has_role`, `get_user_org_id`, `user_belongs_to_org`) | ✅ Existem | Nenhuma |
| Animações CSS onboarding | ✅ Existem | Nenhuma |
| Slack connector | ✅ Conectado | Nenhuma |
| Auto-confirm email | Verificar | Configurar se necessário |

### Correções a implementar

**1. Adicionar rota `/setup` ao App.tsx**

Adicionar lazy import do Setup e registrar a rota **fora** do `<AppLayout />` (Setup tem layout próprio).

**2. Recriar trigger `on_auth_user_created`**

As funções do banco existem, mas o trigger que conecta `auth.users` ao `handle_new_user()` está ausente. Sem ele, novos signups não criam profile automaticamente. Migration SQL:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**3. Verificar/configurar auto-confirm email**

Usar `configure_auth` para garantir que `auto_confirm_email = true` está ativo (conforme preferência já registrada no projeto).

### O que NÃO precisa ser feito

- Funções SQL (`create_organization_for_user`, `handle_new_user`, `has_role`, etc.) — já existem
- Animações CSS — já existem em `src/index.css`
- Reconexão do Slack — já está conectado
- Secrets adicionais — serão solicitados sob demanda quando o usuário usar as features

