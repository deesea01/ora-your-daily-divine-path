import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type Env = "sandbox" | "live";

// Founder accounts that always have premium access. Mirror of src/lib/founders.ts
const FOUNDER_EMAILS = new Set<string>([
  "derek@oradevotion.com",
]);

export function getAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function isFounderUser(userId: string): Promise<boolean> {
  try {
    const admin = getAdminClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    const email = data?.user?.email?.trim().toLowerCase();
    return !!email && FOUNDER_EMAILS.has(email);
  } catch {
    return false;
  }
}

/**
 * Returns true if the user has an active or trialing subscription in the given environment,
 * OR if the user is a founder account (always premium).
 * Defaults to checking BOTH environments so callers don't have to know which one the client is in.
 */
export async function hasActiveSubscription(
  userId: string,
  env?: Env,
): Promise<boolean> {
  if (await isFounderUser(userId)) return true;
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
