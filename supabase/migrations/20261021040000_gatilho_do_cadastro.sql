-- O gatilho que roda handle_new_user a cada cadastro: o primeiro cria a Organização, os próximos entram por convite.
-- Ele fica no schema auth, que o remix do Lovable não copia. Depois de um remix, rode este arquivo no banco novo antes do primeiro cadastro.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
