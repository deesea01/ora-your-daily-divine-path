import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudSun,
  Heart,
  Loader2,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { notifyAdminError } from "@/lib/notifyAdmin";
import { SacredPause } from "@/components/SacredPause";
import { toast } from "sonner";
import { localDateStr } from "@/lib/utils";
import SEO from "@/components/SEO";

type Slot = "morning" | "midday" | "night";

const SLOT_META: Record<Slot, { title: string; subtitle: string; Icon: typeof Sun }> = {
  morning: { title: "Morning Prayer", subtitle: "Begin the day with God", Icon: Sun },
  midday: { title: "Midday Angelus", subtitle: "Pause and remember", Icon: CloudSun },
  night: { title: "Night Prayer", subtitle: "Rest in His peace", Icon: Moon },
};

interface RefText { ref: string; text: string }
interface Devotion {
  opening: string;
  antiphon?: RefText;
  psalm?: RefText;
  scripture: RefText;
  reflection?: string;
  intercession?: string;
  saint: null | { key: string; name: string; intercession: string };
  prayer: string;
  blessing: string;
  themes: string[];
  next_step: null | { kind: string; label: string; reason: string };
}

const todayStr = () => localDateStr();
const cacheKey = (uid: string, slot: Slot) => `ora:devotion:v2:${uid}:${slot}:${todayStr()}`;

interface Step {
  key: "opening" | "antiphon" | "psalm" | "scripture" | "reflection" | "intercession" | "saint" | "prayer" | "blessing";
  label: string;
  content: JSX.Element;
}

const PrayerDetail = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();

  const slot = type as Slot;
  const meta = SLOT_META[slot];

  // Sacred pause: once per session per slot per day.
  const pauseKey = slot ? `ora:sacred-pause:${slot}:${todayStr()}` : "";
  const [showPause, setShowPause] = useState<boolean>(() => {
    if (!slot) return false;
    try { return sessionStorage.getItem(pauseKey) !== "done"; } catch { return true; }
  });
  const dismissPause = () => {
    try { sessionStorage.setItem(pauseKey, "done"); } catch {}
    setShowPause(false);
  };

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [reflection, setReflection] = useState("");
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  // Already completed today?
  useEffect(() => {
    if (!user || !meta) return;
    supabase
      .from("prayer_completions")
      .select("id, reflection, saint_key")
      .eq("user_id", user.id)
      .eq("prayer_date", todayStr())
      .eq("prayer_type", slot)
      .maybeSingle()
      .then(({ data }) => { if (data) setCompleted(true); });
  }, [user, slot, meta]);

  // Load devotion (cache today; otherwise fetch).
  useEffect(() => {
    if (!user || !meta) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      const raw = localStorage.getItem(cacheKey(user.id, slot));
      if (raw) {
        const parsed = JSON.parse(raw) as Devotion;
        if (parsed?.prayer) {
          setDevotion(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/guided-devotion`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              slot,
              preferences: profile
                ? {
                    seeking: profile.seeking,
                    experience_level: profile.experience_level,
                    spiritual_guide: profile.spiritual_guide,
                  }
                : undefined,
            }),
          },
        );
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as Devotion;
        if (cancelled) return;
        setDevotion(json);
        try { localStorage.setItem(cacheKey(user.id, slot), JSON.stringify(json)); } catch {}
      } catch (err: any) {
        console.error("guided-devotion error", err);
        notifyAdminError("guided-devotion", err?.message || String(err), user?.id, { slot });
        if (!cancelled) setError("We couldn't prepare your devotion. Please try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, slot, meta, profile]);

  const steps: Step[] = useMemo(() => {
    if (!devotion) return [];
    const list: Step[] = [
      {
        key: "opening",
        label: slot === "night" ? "Examen" : slot === "midday" ? "Angelus" : "Opening",
        content: <Prose text={devotion.opening} />,
      },
    ];

    if (devotion.antiphon?.text) {
      list.push({
        key: "antiphon",
        label: "Antiphon",
        content: <ScriptureBlock reference={devotion.antiphon.ref} text={devotion.antiphon.text} />,
      });
    }

    if (devotion.psalm?.text) {
      list.push({
        key: "psalm",
        label: "Psalm",
        content: <ScriptureBlock reference={devotion.psalm.ref} text={devotion.psalm.text} multiline />,
      });
    }

    if (devotion.scripture?.text) {
      list.push({
        key: "scripture",
        label: "Scripture",
        content: <ScriptureBlock reference={devotion.scripture.ref} text={devotion.scripture.text} />,
      });
    }

    if (devotion.reflection) {
      list.push({
        key: "reflection",
        label: "Reflection",
        content: <Prose text={devotion.reflection} />,
      });
    }

    if (devotion.intercession) {
      list.push({
        key: "intercession",
        label: "Intercession",
        content: <Prose text={devotion.intercession} serif />,
      });
    }

    if (devotion.saint) {
      list.push({
        key: "saint",
        label: "Pray with",
        content: (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">
              {devotion.saint.name}
            </p>
            <p className="font-serif text-lg leading-relaxed text-foreground">
              {devotion.saint.intercession}
            </p>
          </div>
        ),
      });
    }

    list.push({
      key: "prayer",
      label: "Prayer",
      content: <Prose text={devotion.prayer} serif />,
    });

    list.push({
      key: "blessing",
      label: "Blessing",
      content: (
        <p className="font-serif text-2xl leading-relaxed text-foreground">{devotion.blessing}</p>
      ),
    });

    return list;
  }, [devotion, slot]);

  const finish = async () => {
    if (!user || marking) return;
    setMarking(true);
    const trimmed = reflection.trim().slice(0, 500);
    // Ensure auth session is fully hydrated before inserting (mobile Safari race)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setMarking(false);
      toast.error("Couldn't save prayer", { description: "Please sign in again and retry." });
      return;
    }
    const { error: insErr } = await supabase.from("prayer_completions").insert({
      user_id: session.user.id,
      prayer_date: todayStr(),
      prayer_type: slot,
      saint_key: devotion?.saint?.key ?? null,
      themes: devotion?.themes ?? [],
      scripture_ref: devotion?.scripture?.ref ?? null,
      reflection: trimmed || null,
    });
    if (insErr) {
      console.error("prayer_completions insert failed", insErr);
      notifyAdminError("prayer_completions.insert", insErr.message, session.user.id, { slot });
      toast.error("Couldn't save prayer", { description: insErr.message });
    } else {
      setCompleted(true);
    }
    setMarking(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!meta) return <Navigate to="/" replace />;

  const { Icon } = meta;
  const totalSteps = steps.length;
  const isLastStep = stepIdx >= totalSteps - 1;
  const onLastShown = totalSteps > 0 && stepIdx === totalSteps - 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={`${meta.title} — Daily Catholic Devotion | Ora`}
        description={`${meta.subtitle}. A guided ${meta.title.toLowerCase()} with scripture, reflection, and a saint companion.`}
        canonicalPath={`/prayer/${slot}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${meta.title} — Daily Catholic Devotion`,
          description: meta.subtitle,
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', name: 'Ora', url: 'https://oradevotion.com' },
          publisher: { '@type': 'Organization', name: 'Ora Devotion' },
        }}
      />
      {showPause && <SacredPause slot={slot} onContinue={dismissPause} />}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-lg font-medium text-foreground">{meta.title}</h1>
              <p className="truncate text-xs text-muted-foreground">{meta.subtitle}</p>
            </div>
          </div>
          {totalSteps > 0 && !completed && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">
              {Math.min(stepIdx + 1, totalSteps)} / {totalSteps}
            </span>
          )}
        </div>
        {/* Progress bar */}
        {totalSteps > 0 && !completed && (
          <div className="h-[2px] w-full bg-border/40">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-24 pt-10">
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Preparing your devotion…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full border border-gold/40 px-5 py-2 text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/10"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && devotion && !completed && (
          <div key={stepIdx} className="mx-auto flex w-full max-w-md flex-1 flex-col animate-fade-in">
            <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-gold/70">
              {steps[stepIdx]?.label}
            </p>
            <div className="flex-1">{steps[stepIdx]?.content}</div>

            {/* Optional reflection on the last step */}
            {onLastShown && (
              <div className="mt-8 space-y-2">
                <label htmlFor="prayer-reflection" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  A word from your heart (optional)
                </label>
                <textarea
                  id="prayer-reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value.slice(0, 500))}
                  placeholder="What rose in you during this prayer?"
                  rows={3}
                  aria-label="Prayer reflection"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {!loading && !error && completed && (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40">
              <Check className="h-7 w-7 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-foreground">Amen.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your prayer has been received. Carry it gently into the rest of your day.
              </p>
            </div>

            {devotion?.next_step && <NextStepCard step={devotion.next_step} navigate={navigate} />}

            <button
              onClick={() => navigate("/")}
              className="mt-2 rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              Return home
            </button>
          </div>
        )}
      </main>

      {/* Footer step controls */}
      {!loading && !error && devotion && !completed && (
        <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 py-4">
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground disabled:opacity-30"
            >
              Back
            </button>
            {!isLastStep ? (
              <button
                onClick={() => setStepIdx((i) => Math.min(totalSteps - 1, i + 1))}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-medium uppercase tracking-[0.22em] text-background transition-transform active:scale-[0.98]"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={marking}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-medium uppercase tracking-[0.22em] text-background transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {marking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5" />}
                Amen
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

function Prose({ text, serif }: { text: string; serif?: boolean }) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      {lines.map((l, i) => (
        <p
          key={i}
          className={
            serif
              ? "font-serif text-xl leading-relaxed text-foreground"
              : "text-[15px] leading-relaxed text-muted-foreground"
          }
        >
          {l}
        </p>
      ))}
    </div>
  );
}

function ScriptureBlock({ reference, text, multiline }: { reference: string; text: string; multiline?: boolean }) {
  const lines = multiline
    ? text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
    : [text.trim()];
  return (
    <figure className="relative mx-auto max-w-prose space-y-5 border-l border-gold/30 pl-6">
      {/* Decorative gold opening glyph */}
      <span
        aria-hidden
        className="absolute -left-[2px] -top-2 font-serif text-3xl leading-none text-gold/60"
      >
        ❧
      </span>

      <blockquote className="space-y-3">
        {lines.map((l, i) => (
          <p
            key={i}
            className={
              multiline
                ? "font-serif text-[1.35rem] leading-[1.7] tracking-[0.005em] text-foreground/95"
                : "font-serif text-[1.5rem] leading-[1.65] tracking-[0.005em] text-foreground first-letter:text-gold first-letter:font-serif"
            }
          >
            {multiline ? l : `“${l}”`}
          </p>
        ))}
      </blockquote>

      {reference && (
        <figcaption className="flex items-center gap-3 pt-1">
          <span aria-hidden className="h-px w-6 bg-gold/40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-gold/80">
            {reference}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function NextStepCard({
  step,
  navigate,
}: {
  step: { kind: string; label: string; reason: string };
  navigate: (path: string) => void;
}) {
  const routeFor = (kind: string): string | null => {
    switch (kind) {
      case "confession": return "/confession";
      case "rosary": return "/rosary";
      case "scripture":
      case "novena":
      case "saint":
        return "/prayer-library";
      default: return null;
    }
  };
  const route = routeFor(step.kind);
  return (
    <button
      onClick={() => route && navigate(route)}
      disabled={!route}
      className="group w-full rounded-xl border border-gold/30 bg-card p-4 text-left transition-colors hover:border-gold/60 disabled:cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
          <Sparkles className="h-4 w-4 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80">A gentle invitation</p>
          <p className="mt-0.5 truncate font-serif text-base text-foreground">{step.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{step.reason}</p>
        </div>
        {route && <ArrowRight className="h-4 w-4 text-gold/70 transition-transform group-hover:translate-x-0.5" />}
      </div>
    </button>
  );
}

export default PrayerDetail;
