import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type Env = "sandbox" | "live";

export function getAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/**
 * Returns true if the user has an active or trialing subscription in the given environment.
 * Defaults to checking BOTH environments so callers don't have to know which one the client is in.
 */
export async function hasActiveSubscription(
  userId: string,
  env?: Env,
): Promise<boolean> {
  const admin = getAdminClient();
  const query = admin
    .from("subscriptions")
    .select("status, current_period_end, environment")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]);

  if (env) query.eq("environment", env);

  const { data, error } = await query;
  if (error || !data) return false;

  const now = Date.now();
  return data.some(
    (s: any) =>
      !s.current_period_end || new Date(s.current_period_end).getTime() > now,
  );
}

export function envFromRequest(req: Request): Env | undefined {
  const url = new URL(req.url);
  const q = url.searchParams.get("env");
  if (q === "sandbox" || q === "live") return q;
  return undefined;
}
