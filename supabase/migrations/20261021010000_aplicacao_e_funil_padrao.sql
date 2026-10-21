-- Formulário público de aplicação: cria o contato, a empresa, o negócio no primeiro estágio,
-- uma nota com as respostas e a tarefa de primeiro contato. Chamado pela landing page (/aplicacao).
CREATE OR REPLACE FUNCTION public.submit_application(
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_company text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_challenge text DEFAULT NULL,
  p_org_slug text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org uuid;
  v_owner uuid;
  v_pipeline uuid;
  v_stage uuid;
  v_company uuid;
  v_contact uuid;
  v_deal uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_company_name text := nullif(btrim(coalesce(p_company, '')), '');
BEGIN
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(v_email) > 200 THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF length(coalesce(p_phone, '')) > 40 OR length(coalesce(v_company_name, '')) > 160
     OR length(coalesce(p_role, '')) > 120 OR length(coalesce(p_challenge, '')) > 2000 THEN
    RAISE EXCEPTION 'invalid_length';
  END IF;

  SELECT id INTO v_org FROM organizations
  WHERE p_org_slug IS NULL OR slug = p_org_slug
  ORDER BY created_at LIMIT 1;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'organization_not_found';
  END IF;

  SELECT user_id INTO v_owner FROM user_roles WHERE org_id = v_org AND role = 'owner' LIMIT 1;
  SELECT id INTO v_pipeline FROM pipelines WHERE org_id = v_org ORDER BY is_default DESC NULLS LAST, created_at LIMIT 1;
  SELECT id INTO v_stage FROM pipeline_stages WHERE pipeline_id = v_pipeline ORDER BY "order" LIMIT 1;

  IF v_company_name IS NOT NULL THEN
    SELECT id INTO v_company FROM companies WHERE org_id = v_org AND lower(name) = lower(v_company_name) LIMIT 1;
    IF v_company IS NULL THEN
      INSERT INTO companies (org_id, name, owner_id) VALUES (v_org, v_company_name, v_owner) RETURNING id INTO v_company;
    END IF;
  END IF;

  SELECT id INTO v_contact FROM contacts WHERE org_id = v_org AND lower(email) = v_email LIMIT 1;
  IF v_contact IS NULL THEN
    INSERT INTO contacts (org_id, first_name, last_name, email, phone, title, status, owner_id, company_id)
    VALUES (v_org, split_part(v_name, ' ', 1), nullif(btrim(substr(v_name, length(split_part(v_name, ' ', 1)) + 1)), ''),
            v_email, nullif(btrim(coalesce(p_phone, '')), ''), nullif(btrim(coalesce(p_role, '')), ''), 'lead', v_owner, v_company)
    RETURNING id INTO v_contact;
  END IF;

  INSERT INTO deals (org_id, title, currency, stage_id, contact_id, company_id, owner_id, status)
  VALUES (v_org, 'Mentoria · ' || coalesce(v_company_name, v_name), 'BRL', v_stage, v_contact, v_company, v_owner, 'open')
  RETURNING id INTO v_deal;

  INSERT INTO activities (org_id, type, title, body, contact_id, deal_id, company_id, user_id, completed_at)
  VALUES (v_org, 'note', 'Aplicação recebida pela landing page',
          concat_ws(E'\n', 'Cargo: ' || nullif(btrim(coalesce(p_role, '')), ''), 'WhatsApp: ' || nullif(btrim(coalesce(p_phone, '')), ''),
                    'Maior desafio: ' || nullif(btrim(coalesce(p_challenge, '')), '')),
          v_contact, v_deal, v_company, v_owner, now());

  INSERT INTO activities (org_id, type, title, contact_id, deal_id, company_id, user_id, due_date)
  VALUES (v_org, 'task', 'Primeiro contato com ' || split_part(v_name, ' ', 1), v_contact, v_deal, v_company, v_owner, now() + interval '2 hours');

  RETURN v_deal;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_application(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(text, text, text, text, text, text, text) TO anon, authenticated;

-- A primeira empresa criada já nasce com um funil pronto, já que o app não tem mais o wizard de configuração.
CREATE OR REPLACE FUNCTION public.create_default_pipeline(p_org uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pipeline uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM pipelines WHERE org_id = p_org) THEN
    RETURN;
  END IF;
  INSERT INTO pipelines (org_id, name, currency, is_default) VALUES (p_org, 'Vendas', 'BRL', true) RETURNING id INTO v_pipeline;
  INSERT INTO pipeline_stages (org_id, pipeline_id, name, "order", color, win_probability) VALUES
    (p_org, v_pipeline, 'Novo lead', 1, '#94A3B8', 10),
    (p_org, v_pipeline, 'Primeiro contato', 2, '#60A5FA', 20),
    (p_org, v_pipeline, 'Diagnóstico agendado', 3, '#0A1F3B', 40),
    (p_org, v_pipeline, 'Proposta enviada', 4, '#B9915B', 60),
    (p_org, v_pipeline, 'Negociação', 5, '#1F8A5B', 80);
END;
$$;

REVOKE ALL ON FUNCTION public.create_default_pipeline(uuid) FROM PUBLIC;

-- O primeiro cadastro cria a empresa (com o funil padrão) e vira dono; os próximos entram só por convite.
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
  v_invited_org UUID;
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
    v_invited_org := NULLIF(NEW.raw_user_meta_data->>'org_id', '')::uuid;

    IF v_invited_org IS NOT NULL THEN
      v_org_id := v_invited_org;
      v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'member')::public.app_role;
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
      v_role := COALESCE(v_invitation.role, 'member');
    END IF;

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
