import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "valid" | "invalid" | "done" | "submitting" | "error">("loading");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!token) { setState("invalid"); setMsg("Missing token."); return; }
    (async () => {
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
          headers: { apikey: SUPABASE_ANON },
        });
        const j = await r.json();
        if (j.valid === true) setState("valid");
        else if (j.reason === "already_unsubscribed") { setState("done"); setMsg("You're already unsubscribed."); }
        else { setState("invalid"); setMsg(j.error || "Invalid or expired link."); }
      } catch (e: any) {
        setState("error"); setMsg(e?.message || "Network error.");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (j.success) { setState("done"); setMsg("You've been unsubscribed."); }
      else { setState("error"); setMsg(j.error || "Could not unsubscribe."); }
    } catch (e: any) {
      setState("error"); setMsg(e?.message || "Network error.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
        {state === "loading" && (<><Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" /><p className="mt-3 text-sm text-muted-foreground">Verifying…</p></>)}
        {state === "valid" && (<>
          <h1 className="font-serif text-xl text-foreground mb-2">Unsubscribe from Ora emails?</h1>
          <p className="text-sm text-muted-foreground mb-4">You'll stop receiving non-essential messages from us.</p>
          <button onClick={confirm} className="w-full rounded-lg bg-gold py-3 text-sm font-medium text-primary-foreground">Confirm unsubscribe</button>
        </>)}
        {state === "submitting" && (<><Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" /><p className="mt-3 text-sm text-muted-foreground">Processing…</p></>)}
        {state === "done" && (<><Check className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-foreground">{msg}</p></>)}
        {(state === "invalid" || state === "error") && (<><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-3 text-sm text-foreground">{msg}</p></>)}
      </div>
    </div>
  );
}
