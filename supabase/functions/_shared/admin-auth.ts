// Shared admin-auth helper for internal/cron edge functions.
// Accepts EITHER a service-role JWT in the Authorization header,
// OR a matching `x-cron-secret` header when CRON_SECRET env var is set.
export function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1]
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAdminCaller(req: Request): boolean {
  // Option 1: CRON_SECRET header match
  const expected = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret');
  if (expected && provided && expected === provided) return true;

  // Option 2: Service-role JWT
  const auth = req.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ')) {
    const claims = parseJwtClaims(auth.slice(7).trim());
    if (claims?.role === 'service_role') return true;
  }
  return false;
}
