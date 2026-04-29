import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from "@/lib/guides";
import { useEntitlement, FREE_GUIDE_KEY } from "@/hooks/useEntitlement";

const ORDER: SpiritualGuideKey[] = [
  "st_padre_pio",
  "st_augustine",
  "st_teresa",
  "st_francis",
  "st_joan_of_arc",
  "st_thomas_aquinas",
  "st_michael",
];

const SHORT: Record<string, string> = {
  monk: "Daily rhythm & stillness",
  st_padre_pio: "Spiritual strength",
  st_augustine: "Purpose & restless heart",
  st_teresa: "Deep prayer life",
  st_francis: "Joy & simplicity",
  st_joan_of_arc: "Courage & conviction",
  st_thomas_aquinas: "Discernment & study",
  st_michael: "Protection & resolve",
};

export function SaintCompanionsCarousel() {
  const navigate = useNavigate();
  const { isPremium } = useEntitlement();

  return (
    <section className="mb-8 animate-fade-in-delay-3">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-xl text-foreground">
            {isPremium ? "Your Saint Companions" : "Unlock Saint Companions"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isPremium ? "Pray with the saints" : "Voices of the saints, ready to walk with you"}
          </p>
        </div>
        <button
          onClick={() => navigate("/guide")}
          className="text-xs text-gold hover:underline"
        >
          See all →
        </button>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 snap-x snap-mandatory">
          {ORDER.map((key) => {
            const g = SPIRITUAL_GUIDES[key];
            const locked = !isPremium && key !== FREE_GUIDE_KEY;
            return (
              <button
                key={key}
                onClick={() => {
                  if (locked) navigate("/paywall");
                  else navigate("/monk-chat");
                }}
                className={`group relative w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-all active:scale-[0.97] ${
                  locked ? "border-gold/25 bg-card hover:border-gold/50" : "border-gold/40 bg-card hover:border-gold"
                }`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={g.avatar}
                    alt={g.label}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      locked ? "blur-[2px] brightness-75" : ""
                    }`}
                  />
                  {locked && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                        <Sparkles className="h-2.5 w-2.5" /> Premium
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                          <Lock className="h-4 w-4 text-gold" />
                        </div>
                      </div>
                    </>
                  )}
                  {!locked && (
                    <div className="absolute right-2 top-2 rounded-full bg-background/70 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold backdrop-blur-sm">
                      Free
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-serif text-sm leading-tight text-foreground">{g.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{SHORT[key]}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!isPremium && (
        <button
          onClick={() => navigate("/paywall")}
          className="mt-3 w-full rounded-xl border border-gold/40 bg-gold/10 py-3 text-sm font-medium text-gold transition-all hover:bg-gold/20 active:scale-[0.98]"
        >
          Pray With the Saints →
        </button>
      )}
    </section>
  );
}

export default SaintCompanionsCarousel;
