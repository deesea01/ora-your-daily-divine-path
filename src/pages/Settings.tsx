import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, User, Sparkles, BookOpen, LogOut, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import PrayerRemindersCard from '@/components/PrayerRemindersCard';
import { toast } from '@/hooks/use-toast';

const SEEKING_OPTIONS = [
  { value: 'peace', label: 'Inner Peace', emoji: '🕊️' },
  { value: 'discipline', label: 'Spiritual Discipline', emoji: '⚔️' },
  { value: 'community', label: 'Community', emoji: '🤝' },
  { value: 'healing', label: 'Healing', emoji: '💛' },
  { value: 'purpose', label: 'Purpose', emoji: '🔥' },
  { value: 'forgiveness', label: 'Forgiveness', emoji: '🙏' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Just Starting', desc: 'New to prayer or returning' },
  { value: 'intermediate', label: 'Growing', desc: 'Regular prayer life' },
  { value: 'advanced', label: 'Devoted', desc: 'Deep, consistent practice' },
];

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, saveProfile, setGuide, setDailyPrayerGoal } = useUserProfile();
  const { t } = useLanguage();

  const [displayName, setDisplayName] = useState('');
  const [seeking, setSeeking] = useState<string[]>([]);
  const [experience, setExperience] = useState('beginner');
  const [dailyGoal, setDailyGoal] = useState(3);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSeeking(profile.seeking || []);
      setExperience(profile.experience_level || 'beginner');
      setDailyGoal(profile.daily_prayer_goal || 3);
    }
  }, [profile]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const guideKey = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;
  const guideData = SPIRITUAL_GUIDES[guideKey];

  const toggleSeeking = (value: string) => {
    setSeeking(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const saveChanges = async () => {
    setSaving(true);
    const result = await saveProfile(seeking, experience, dailyGoal, displayName);
    setSaving(false);
    if (!result?.error) {
      toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
      setActiveSection(null);
    } else {
      toast({ title: 'Error', description: 'Could not save. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pb-8 pt-safe">
      <header className="flex items-center gap-3 pb-6 pt-6">
        <button onClick={() => navigate('/')} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-2xl text-foreground">Settings</h1>
      </header>

      {/* Profile Name */}
      <section className="mb-4">
        <button
          onClick={() => setActiveSection(activeSection === 'name' ? null : 'name')}
          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <User className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Display Name</p>
                <p className="text-xs text-muted-foreground">{displayName || 'Not set'}</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'name' ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {activeSection === 'name' && (
          <div className="mt-2 rounded-xl border border-gold/20 bg-card p-4 animate-fade-in">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none"
            />
            <button onClick={saveChanges} disabled={saving} className="mt-3 w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </section>

      {/* Spiritual Guide */}
      <section className="mb-4">
        <button
          onClick={() => setActiveSection(activeSection === 'guide' ? null : 'guide')}
          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{guideData.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">Spiritual Guide</p>
                <p className="text-xs text-muted-foreground">{guideData.label}</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'guide' ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {activeSection === 'guide' && (
          <div className="mt-2 space-y-2 animate-fade-in">
            {Object.entries(SPIRITUAL_GUIDES).map(([key, guide]) => (
              <button
                key={key}
                onClick={async () => {
                  await setGuide(key);
                  toast({ title: 'Guide updated', description: `${guide.label} is now your spiritual guide.` });
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  guideKey === key ? 'border-gold bg-gold/10' : 'border-border bg-card hover:border-gold/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{guide.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{guide.label}</p>
                      <p className="text-xs text-muted-foreground">{guide.description}</p>
                    </div>
                  </div>
                  {guideKey === key && <Check className="h-4 w-4 text-gold" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Seeking */}
      <section className="mb-4">
        <button
          onClick={() => setActiveSection(activeSection === 'seeking' ? null : 'seeking')}
          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">What You're Seeking</p>
                <p className="text-xs text-muted-foreground">{seeking.length} selected</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'seeking' ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {activeSection === 'seeking' && (
          <div className="mt-2 rounded-xl border border-gold/20 bg-card p-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {SEEKING_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleSeeking(opt.value)}
                  className={`rounded-lg border p-3 text-left text-sm transition-all ${
                    seeking.includes(opt.value) ? 'border-gold bg-gold/10 text-foreground' : 'border-border text-muted-foreground hover:border-gold/20'
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
            <button onClick={saveChanges} disabled={saving || seeking.length === 0} className="mt-3 w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </section>

      {/* Experience Level */}
      <section className="mb-4">
        <button
          onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}
          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <BookOpen className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Prayer Experience</p>
                <p className="text-xs text-muted-foreground capitalize">{experience}</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'experience' ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {activeSection === 'experience' && (
          <div className="mt-2 space-y-2 animate-fade-in">
            {EXPERIENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={async () => {
                  setExperience(opt.value);
                  setSaving(true);
                  await saveProfile(seeking, opt.value, dailyGoal, displayName);
                  setSaving(false);
                  toast({ title: 'Experience updated' });
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  experience === opt.value ? 'border-gold bg-gold/10' : 'border-border bg-card hover:border-gold/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  {experience === opt.value && <Check className="h-4 w-4 text-gold" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Daily Prayer Goal */}
      <section className="mb-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Daily Prayer Goal</p>
            <div className="flex gap-2">
              {[1, 2, 3].map(g => (
                <button
                  key={g}
                  onClick={async () => {
                    setDailyGoal(g);
                    await setDailyPrayerGoal(g);
                    toast({ title: `Goal set to ${g} prayer${g > 1 ? 's' : ''}/day` });
                  }}
                  className={`h-9 w-9 rounded-full border text-sm font-medium transition-all ${
                    dailyGoal === g ? 'border-gold bg-gold/20 text-gold' : 'border-border text-muted-foreground hover:border-gold/30'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Reminders */}
      <section className="mb-4">
        <PrayerRemindersCard />
      </section>

      {/* Subscription */}
      <section className="mb-4">
        <SubscriptionCard />
      </section>

      {/* Language */}
      <section className="mb-4">
        <LanguageSelector />
      </section>

      {/* Legal Links */}
      <section className="mb-6">
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <button onClick={() => navigate('/privacy-policy')} className="w-full p-4 text-left flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Privacy Policy</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/terms-of-service')} className="w-full p-4 text-left flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Terms of Service</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Sign Out */}
      <section className="mb-8">
        <button
          onClick={signOut}
          className="w-full rounded-xl border border-destructive/30 bg-card p-4 text-left transition-all hover:border-destructive/50"
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">Sign Out</p>
          </div>
        </button>
      </section>
    </div>
  );
};

export default Settings;
