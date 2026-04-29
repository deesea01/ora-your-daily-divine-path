import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, BookOpen, ChevronRight, Star, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerLibrary } from '@/hooks/usePrayerLibrary';
import { PRAYER_CATEGORIES, PRAYERS, getPrayersByCategory, PRESET_ROUTINES } from '@/lib/prayerLibrary';
import { getCategoryTranslation, getPrayerTranslation } from '@/lib/prayerTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { useEntitlement, isPremiumPrayer } from '@/hooks/useEntitlement';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import SEO from '@/components/SEO';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-muted-foreground',
  familiar: 'text-gold',
  memorized: 'text-green-400',
};

const PrayerLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { favorites, progress, loading } = usePrayerLibrary();
  const { language, t } = useLanguage();
  const { isPremium } = useEntitlement();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Helper to get localized prayer data
  const getLocalizedPrayer = (prayer: typeof PRAYERS[0]) => {
    const tr = getPrayerTranslation(prayer.id, language);
    return {
      ...prayer,
      title: tr?.title || prayer.title,
      description: tr?.description || prayer.description,
    };
  };

  const filteredPrayers = (() => {
    let list = selectedCategory ? getPrayersByCategory(selectedCategory) : PRAYERS;
    if (showFavorites) list = list.filter(p => favorites.has(p.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const lp = getLocalizedPrayer(p);
        return lp.title.toLowerCase().includes(q) || lp.description.toLowerCase().includes(q);
      });
    }
    return list;
  })();

  // Localized category helper
  const getCatLabel = (cat: typeof PRAYER_CATEGORIES[0]) => {
    const tr = getCategoryTranslation(cat.key, language);
    return tr?.label || cat.label;
  };
  const getCatDesc = (cat: typeof PRAYER_CATEGORIES[0]) => {
    const tr = getCategoryTranslation(cat.key, language);
    return tr?.description || cat.description;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Daily Catholic Prayers — Rosary, Novenas & Devotions | Ora" description="Browse 30+ daily Catholic prayers: the rosary, novenas, Liturgy of the Hours, Lent and Advent guides. Read, listen, and pray with Ora." canonicalPath="/prayer-library" />
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label={t.back}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">{t.prayerLibrary}</h1>
        <button onClick={() => navigate('/prayer-library/routines')} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Routines">
          <BookOpen className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prayers…"
              className="pl-9 bg-card border-border"
            />
          </div>
        </div>

        {/* Quick filters */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => { setShowFavorites(!showFavorites); setSelectedCategory(null); }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${showFavorites ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}
          >
            <Heart className="h-3 w-3" /> Favorites
          </button>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold"
            >
              {PRAYER_CATEGORIES.find(c => c.key === selectedCategory)?.emoji} {getCatLabel(PRAYER_CATEGORIES.find(c => c.key === selectedCategory)!)} ✕
            </button>
          )}
        </div>

        {/* Categories (when no filter active) */}
        {!selectedCategory && !showFavorites && !search.trim() && (
          <div className="px-4 pb-4">
            <h2 className="font-serif text-base text-foreground mb-3 animate-fade-in">Categories</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRAYER_CATEGORIES.map((cat, i) => {
                const count = getPrayersByCategory(cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setSelectedCategory(cat.key); setShowFavorites(false); }}
                    className="rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-gold/20 active:scale-[0.98] animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <p className="text-xs font-medium text-foreground mt-1 leading-tight">{getCatLabel(cat)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{count} prayer{count !== 1 ? 's' : ''}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Prayer list */}
        {(selectedCategory || showFavorites || search.trim()) && (
          <div className="px-4 pb-4 space-y-2">
            {filteredPrayers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No prayers found.</p>
              </div>
            ) : (
              filteredPrayers.map((prayer, i) => {
                const lp = getLocalizedPrayer(prayer);
                const prog = progress.get(prayer.id);
                const diff = prog?.difficulty || 'beginner';
                const isFav = favorites.has(prayer.id);
                const locked = !isPremium && isPremiumPrayer(prayer.id);
                return (
                  <button
                    key={prayer.id}
                    onClick={() => locked ? setUpgradeOpen(true) : navigate(`/prayer-library/${prayer.id}`)}
                    className={`w-full rounded-xl border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98] animate-fade-in ${locked ? 'border-border/60 opacity-80' : 'border-border'}`}
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{lp.title}</p>
                          {isFav && <Heart className="h-3 w-3 text-gold fill-gold" />}
                          {locked && <Lock className="h-3 w-3 text-gold/70" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{lp.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground">{prayer.estimatedMinutes} min</span>
                          <span className={`text-[10px] capitalize ${DIFFICULTY_COLORS[diff]}`}>
                            {diff === 'memorized' && <Star className="inline h-2.5 w-2.5 mr-0.5" />}
                            {diff}
                          </span>
                          {prog && prog.practice_count > 0 && (
                            <span className="text-[10px] text-muted-foreground">{prog.practice_count}× practiced</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Preset routines */}
        {!selectedCategory && !showFavorites && !search.trim() && (
          <div className="px-4 pb-6">
            <h2 className="font-serif text-base text-foreground mb-3 animate-fade-in">Quick Routines</h2>
            <div className="space-y-2">
              {PRESET_ROUTINES.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => navigate(`/prayer-library/${r.prayerIds[0]}?routine=${encodeURIComponent(JSON.stringify(r.prayerIds))}`)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-gold/20 active:scale-[0.98] animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{r.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.description} · {r.prayerIds.length} prayers</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="The full library awaits."
        description="Unlock 30+ prayers, audio narration, and guided practice — start your 3-day free trial."
      />
    </div>
  );
};

export default PrayerLibrary;
