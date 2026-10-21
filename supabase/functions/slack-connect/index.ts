import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLACK_API = "https://slack.com/api";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { org_id, bot_token } = await req.json();

    if (!org_id) {
      return json({ error: "Missing org_id" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Token vem do formulário (primeira conexão) ou do Vault (reconexão).
    // Nunca de env/connector: o remix perde o connector e o env não existe.
    let token: string | null = typeof bot_token === "string" && bot_token.trim()
      ? bot_token.trim()
      : null;
    const tokenFromBody = token !== null;

    if (!token) {
      const { data } = await supabaseAdmin.rpc("get_org_secret", {
        p_org_id: org_id,
        p_key_name: "slack_bot_token",
      });
      token = data ?? null;
    }

    if (!token) {
      return json({
        error: "slack_not_configured",
        message: "Cole o Bot Token do Slack (xoxb-…) para conectar.",
      }, 400);
    }

    // 1. Verify token with auth.test
    const authRes = await fetch(`${SLACK_API}/auth.test`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const authData = await authRes.json();

    if (!authData.ok) {
      return json({ error: "Slack connection failed", detail: authData.error }, 401);
    }

    // 2. First connection: persist the token in the Vault
    if (tokenFromBody) {
      const { error: vaultError } = await supabaseAdmin.rpc("set_org_secret", {
        p_org_id: org_id,
        p_key_name: "slack_bot_token",
        p_key_value: token,
      });
      if (vaultError) throw vaultError;
    }

    // 3. List public channels
    const channelsRes = await fetch(
      `${SLACK_API}/conversations.list?types=public_channel&limit=200&exclude_archived=true`,
      { headers: { "Authorization": `Bearer ${token}` } },
    );
    const channelsData = await channelsRes.json();

    const channels = (channelsData.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
    }));

    // 4. Save connection metadata (never the token) to integration_configs
    const { data: existing } = await supabaseAdmin
      .from("integration_configs")
      .select("id")
      .eq("org_id", org_id)
      .eq("provider", "slack")
      .maybeSingle();

    const configData = {
      workspace_name: authData.team,
      bot_user_id: authData.user_id,
      connected_via: "vault",
    };

    if (existing) {
      await supabaseAdmin.from("integration_configs")
        .update({ config: configData, is_active: true })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("integration_configs")
        .insert({ org_id, provider: "slack", config: configData, is_active: true });
    }

    return json({
      workspace_name: authData.team,
      workspace_url: authData.url,
      bot_user_id: authData.user_id,
      channels,
    });
  } catch (err) {
    console.error("slack-connect error:", err);
    return json({ error: "Internal error" }, 500);
  }
});
