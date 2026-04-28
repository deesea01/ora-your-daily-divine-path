import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Flame, PenLine, Heart, BookOpen, Compass, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlement } from "@/hooks/useEntitlement";

interface Props {
  streak: number;
}

export function FaithJourneyCard({ streak }: Props) {
  const { user } = useAuth();
  const { isPremium } = useEntitlement();
  const navigate = useNavigate();
  const [journalCount, setJournalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setJournalCount(count ?? 0));
  }, [user]);

  const freeMetrics = [
    { icon: Flame, label: "Prayer streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
    { icon: PenLine, label: "Journal reflections", value: journalCount === null ? "—" : `${journalCount}` },
    { icon: Heart, label: "Gratitude growth", value: "+18%" },
    { icon: BookOpen, label: "Scripture engagement", value: "+22%" },
  ];

  const lockedMetrics = [
    { icon: Sparkles, label: "Monthly spiritual review" },
    { icon: Compass, label: "Personalized virtue" },
    { icon: UserRound, label: "Saint mentor pick" },
  ];

  return (
    <section className="mb-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold/5 p-5 glow-gold">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">Your Faith Journey</p>
            <h2 className="mt-1 font-serif text-xl text-foreground">How God is shaping your heart</h2>
          </div>
          <Sparkles className="h-5 w-5 text-gold" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {freeMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border/60 bg-background/40 p-3"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <m.icon className="h-3 w-3 text-gold/80" />
                {m.label}
              </div>
              <p className="mt-1 font-serif text-lg text-foreground">{m.value}</p>
            </div>
          ))}
        </div>

        {!isPremium && (
          <>
            <div className="mt-3 space-y-2">
              {lockedMetrics.map((m) => (
                <div
                  key={m.label}
                  className="relative flex items-center justify-between rounded-xl border border-gold/15 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                      <m.icon className="h-3.5 w-3.5 text-gold/70" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="select-none font-serif text-sm text-foreground/80 blur-[3px]">
                        Reflecting trust & surrender
                      </p>
                    </div>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-gold/70" />
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/paywall")}
              className="mt-5 w-full rounded-xl bg-gold py-3 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Unlock Your Full Spiritual Journey
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              See how God is shaping your heart through prayer, reflection, and devotion.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default FaithJourneyCard;
