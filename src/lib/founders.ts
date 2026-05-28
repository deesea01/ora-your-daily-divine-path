// Founder accounts that always have premium access, regardless of subscription status.
// Server-side mirror lives in supabase/functions/_shared/entitlement.ts
export const FOUNDER_EMAILS = new Set<string>([
  "derek@oradevotion.com",
  "appreview@oradevotion.com", // Apple App Review demo account — permanent premium
]);

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_EMAILS.has(email.trim().toLowerCase());
}
