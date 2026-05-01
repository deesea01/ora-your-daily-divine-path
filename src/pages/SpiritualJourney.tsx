import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Flame, Compass, Heart, BookOpen, Shield, RefreshCw, ChevronRight, UserRound, PenLine, Cross } from "lucide-react";
import { useSpiritualProfile, type Recommendation } from "@/hooks/useSpiritualProfile";
import { SPIRITUAL_GUIDES } from "@/lib/guides";
import SEO from "@/components/SEO";
import { humanizeLabel } from "@/lib/utils";

const TYPE_ICON: Record<Recommendation["type"], typeof Sparkles> = {
  prayer: BookOpen,
  scripture: BookOpen,
  sacrament: Cross,
  saint: UserRound,
  devotion: Compass,
};

export default function SpiritualJourney() {
  const navigate = useNavigate();
  const { profile, loading, refreshing, refresh } = useSpiritualProfile();
  const [didInitialRefresh, setDidInitialRefresh] = useState(false);

  // On first visit, run a quick rules-only refresh in the background.
  useEffect(() => {
    if (!loading && !didInitialRefresh && !profile) {
      setDidInitialRefresh(true);
      refresh("rules");
    } else if (!loading && profile && !didInitialRefresh) {
      setDidInitialRefresh(true);
      // Quietly refresh stale (>6h) rules in background
      const stale = !profile.last_refreshed_at ||
        (Date.now() - new Date(profile.last_refreshed_at).getTime()) > 6 * 3_600_000;
      if (stale) refresh("rules");
    }
  }, [loading, profile, didInitialRefresh, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  const recommendations = (profile?.recommendations ?? []) as Recommendation[];
  const topSaintKey = profile?.top_saint;
  const topSaint = topSaintKey ? SPIRITUAL_GUIDES[topSaintKey] : null;

  const consistency = profile?.devotional_consistency ?? 0;
  const struggles = profile?.struggles ?? [];
  const growthAreas = profile?.growth_areas ?? [];

  return (
    <div className="min-h-screen bg-background px-6 pb-12 pt-safe">
      <SEO title="Spiritual Journey | Ora" description="Your private spiritual profile — gentle insights and devotional invitations from Ora." canonicalPath="/journey" />

      <header className="flex items-center justify-between pb-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">Spiritual Journey</p>
        <button
          onClick={() => refresh("full")}
          disabled={refreshing}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Refresh insights"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </header>

      <h1 className="font-serif text-2xl text-foreground">How God is shaping your heart</h1>
      <p className="mt-1 text-sm text-muted-foreground">A private reflection of your prayer life. Only you can see this.</p>

      {/* AI invitation */}
      {profile?.ai_invitation && (
        <section className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-5 animate-fade-in">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Sparkles className="h-3 w-3" /> Today's invitation
          </div>
          <p className="mt-2 font-serif text-lg leading-snug text-foreground">{profile.ai_invitation}</p>
          {profile.ai_summary && (
            <p className="mt-3 text-sm text-muted-foreground italic">{profile.ai_summary}</p>
          )}
        </section>
      )}

      {/* Consistency + saint */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3 w-3 text-gold" /> Devotional rhythm
          </div>
          <p className="mt-1 font-serif text-2xl text-foreground">{consistency}%</p>
          <p className="text-[11px] text-muted-foreground">of recent days in prayer</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <UserRound className="h-3 w-3 text-gold" /> Closest saint
          </div>
          <p className="mt-1 font-serif text-base text-foreground leading-tight">
            {topSaint?.label ?? "Discovering…"}
          </p>
          <p className="text-[11px] text-muted-foreground">{topSaint?.tone ?? "Walk with your guide"}</p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-8">
        <h2 className="font-serif text-lg text-gold">Suggested next devotion</h2>
        <p className="mb-4 text-xs text-muted-foreground">Based on your recent prayer life — gently offered, never required.</p>
        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Pray a few more times and Ora will gather quiet insights for you.</p>
            <button
              onClick={() => refresh("rules")}
              className="mt-4 text-xs font-medium text-gold hover:underline"
            >
              Refresh now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = TYPE_ICON[rec.type] ?? Sparkles;
              return (
                <button
                  key={i}
                  onClick={() => rec.action_route && navigate(rec.action_route)}
                  className="group w-full rounded-xl border border-gold/15 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{rec.type}</p>
                      <h3 className="font-serif text-base text-foreground leading-snug">{rec.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                      {rec.action_label && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold">
                          {rec.action_label} <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Growth + struggles */}
      <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-gold" /> Growth areas
          </div>
          {growthAreas.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground italic">Will appear as you reflect.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {growthAreas.map((g) => (
                <span key={g} className="rounded-full border border-gold/20 bg-gold/5 px-2.5 py-0.5 text-xs text-foreground capitalize">{humanizeLabel(g)}</span>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-gold" /> Areas of struggle
          </div>
          {struggles.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground italic">No recurring struggles noted.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {struggles.map((s) => (
                <span key={s} className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">{humanizeLabel(s)}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Saints to explore */}
      {(profile?.saints_affinity?.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg text-gold">Saints in your circle</h2>
          <p className="mb-3 text-xs text-muted-foreground">Companions you've walked with most.</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {profile!.saints_affinity.slice(0, 6).map((s) => {
              const guide = SPIRITUAL_GUIDES[s.saint_key];
              if (!guide) return null;
              return (
                <button
                  key={s.saint_key}
                  onClick={() => navigate("/guide")}
                  className="shrink-0 w-32 rounded-xl border border-border bg-card p-3 text-left hover:border-gold/30"
                >
                  <img src={guide.avatar} alt={guide.label} className="h-14 w-14 rounded-full object-cover" />
                  <p className="mt-2 font-serif text-sm text-foreground leading-tight">{guide.label}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{s.interaction_count} interactions</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <PenLine className="h-3.5 w-3.5 text-gold" /> Privacy
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Your spiritual profile is private and visible only to you. Ora never shares your prayer life,
          struggles, or reflections with anyone. Insights are generated to gently serve your devotion —
          not to be sold, profiled, or used outside your relationship with God.
        </p>
      </section>

      {profile?.last_refreshed_at && (
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          Last refreshed {new Date(profile.last_refreshed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
