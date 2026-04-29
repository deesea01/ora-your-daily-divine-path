import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, PenLine, Compass, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSpiritualProfile } from "@/hooks/useSpiritualProfile";

interface Props {
  streak: number;
}

export function FaithJourneyCard({ streak }: Props) {
  const { user } = useAuth();
  const { profile } = useSpiritualProfile();
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

  const topRec = profile?.recommendations?.[0];
  const consistency = profile?.devotional_consistency ?? 0;

  return (
    <section className="mb-8 animate-fade-in">
      <button
        onClick={() => navigate("/journey")}
        className="group relative w-full overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold/5 p-5 text-left transition-all hover:border-gold/50 active:scale-[0.99] glow-gold"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">Your Spiritual Journey</p>
            <h2 className="mt-1 font-serif text-xl text-foreground">How God is shaping your heart</h2>
          </div>
          <Sparkles className="h-5 w-5 text-gold" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Flame className="h-3 w-3 text-gold/80" /> Streak
            </div>
            <p className="mt-1 font-serif text-lg text-foreground">{streak}d</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Compass className="h-3 w-3 text-gold/80" /> Rhythm
            </div>
            <p className="mt-1 font-serif text-lg text-foreground">{consistency}%</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <PenLine className="h-3 w-3 text-gold/80" /> Journal
            </div>
            <p className="mt-1 font-serif text-lg text-foreground">{journalCount ?? "—"}</p>
          </div>
        </div>

        {topRec ? (
          <div className="mt-4 rounded-xl border border-gold/20 bg-background/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gold/80">Today Ora suggests</p>
            <p className="mt-1 font-serif text-sm text-foreground leading-snug">{topRec.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{topRec.reason}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-gold/15 bg-background/40 p-3">
            <p className="text-[11px] text-muted-foreground italic">
              As you pray and reflect, Ora will gather gentle insights here.
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-1 text-xs font-medium text-gold">
          Open spiritual journey <ChevronRight className="h-3 w-3" />
        </div>
      </button>
    </section>
  );
}

export default FaithJourneyCard;
