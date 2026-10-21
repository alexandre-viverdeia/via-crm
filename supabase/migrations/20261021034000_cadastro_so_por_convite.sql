-- Só entra no CRM quem tem um convite registrado no banco.
-- Antes, o cadastro aceitava org_id e role vindos dos dados do usuário, que o navegador controla:
-- quem soubesse o id da Organização se cadastrava como Proprietário.
-- Agora a Organização e o Papel vêm sempre do convite, e o convite só dá Membro ou Administrador.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_role public.app_role := 'member';
  v_user_name TEXT;
  v_invitation RECORD;
BEGIN
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  SELECT id INTO v_org_id FROM public.organizations LIMIT 1;

  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, settings)
    VALUES ('Minha Empresa', 'minha-empresa', '{"timezone":"America/Sao_Paulo","currency":"BRL"}'::jsonb)
    RETURNING id INTO v_org_id;
    v_role := 'owner';
    PERFORM public.create_default_pipeline(v_org_id);
  ELSE
    SELECT * INTO v_invitation
    FROM public.invitations
    WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_invitation.id IS NULL THEN
      RAISE EXCEPTION 'signup_disabled: cadastro permitido apenas por convite do administrador';
    END IF;

    v_org_id := v_invitation.org_id;
    v_role := CASE WHEN v_invitation.role = 'admin' THEN 'admin'::public.app_role ELSE 'member'::public.app_role END;

    UPDATE public.invitations
    SET accepted_at = now()
    WHERE org_id = v_org_id AND lower(email) = lower(NEW.email) AND accepted_at IS NULL;
  END IF;

  INSERT INTO public.profiles (id, org_id, email, name, avatar_url)
  VALUES (NEW.id, v_org_id, NEW.email, v_user_name, NEW.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (NEW.id, v_org_id, v_role)
  ON CONFLICT (user_id, org_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- A tela de login usa esta função para mostrar a aba "Cadastrar" só enquanto não existe nenhum Membro.
-- Ela já existia no banco e não estava nas migrations.
CREATE OR REPLACE FUNCTION public.signup_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles);
$$;

GRANT EXECUTE ON FUNCTION public.signup_allowed() TO anon, authenticated;

-- O funil padrão só é criado pelo gatilho do cadastro, nunca chamado de fora.
REVOKE EXECUTE ON FUNCTION public.create_default_pipeline(uuid) FROM anon, authenticated;
