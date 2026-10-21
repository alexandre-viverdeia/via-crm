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
    const { org_id, channel, message } = await req.json();

    if (!org_id) {
      return json({ error: "Missing org_id" }, 400);
    }
    if (!channel) {
      return json({ error: "Missing channel" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: token } = await supabaseAdmin.rpc("get_org_secret", {
      p_org_id: org_id,
      p_key_name: "slack_bot_token",
    });

    if (!token) {
      return json({
        error: "slack_not_configured",
        message: "Conecte o Slack em Integrações antes de enviar mensagens.",
      }, 400);
    }

    const slackRes = await fetch(`${SLACK_API}/chat.postMessage`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channel.replace("#", ""),
        text: message || "🚀 FlowCRM conectado! As notificações de vendas vão aparecer aqui.",
      }),
    });

    const slackData = await slackRes.json();

    if (!slackData.ok) {
      return json({ error: slackData.error }, 400);
    }

    // Update channel in integration_configs
    const { data: existing } = await supabaseAdmin
      .from("integration_configs")
      .select("config")
      .eq("org_id", org_id)
      .eq("provider", "slack")
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("integration_configs").update({
        config: { ...existing.config, channel },
      }).eq("org_id", org_id).eq("provider", "slack");
    }

    return json({ ok: true, ts: slackData.ts });
  } catch (err) {
    console.error("slack-send-test error:", err);
    return json({ error: "Internal error" }, 500);
  }
});
