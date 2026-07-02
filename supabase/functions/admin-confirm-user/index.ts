import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "email required" }), { status: 400 });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });

    const { data, error } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, id: data.user?.id, email: data.user?.email, confirmed_at: data.user?.email_confirmed_at }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
  }
});
