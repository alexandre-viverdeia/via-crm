import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type Member = { userId: string; orgId: string };

/** Checks the caller's session and returns the member and their org, or null. */
export async function getMember(req: Request): Promise<Member | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await anonClient.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const serviceClient = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await serviceClient.from("profiles").select("org_id").eq("id", userId).single();
  if (!profile?.org_id) return null;

  return { userId, orgId: profile.org_id };
}

export function unauthorized(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
