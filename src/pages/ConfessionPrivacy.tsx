import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';
import { Switch } from '@/components/ui/switch';

const ConfessionPrivacy = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings, loading } = useConfession();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/confession')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Privacy & Security</h1>
      </header>

      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Shield icon */}
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 mb-3">
            <Shield className="h-7 w-7 text-gold" />
          </div>
          <p className="font-serif text-base text-foreground text-center">Your confession data is sacred</p>
          <p className="text-xs text-muted-foreground text-center mt-1 max-w-xs">
            All information is encrypted, private, and only accessible by you. We treat your spiritual life with the utmost discretion.
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-1 animate-fade-in">
          {/* Hide previews */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Hide sensitive text previews</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hides parish names and reflections in history
              </p>
            </div>
            <Switch
              checked={settings.hide_previews}
              onCheckedChange={(checked) => updateSettings({ hide_previews: checked })}
            />
          </div>

          {/* Auto-delete prep */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Auto-delete preparation notes</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically removes exam notes after you log a confession
              </p>
            </div>
            <Switch
              checked={settings.auto_delete_prep}
              onCheckedChange={(checked) => updateSettings({ auto_delete_prep: checked })}
            />
          </div>

          {/* Passcode (informational for now) */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 opacity-60">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Require passcode / biometric</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lock the confession tracker behind device authentication
              </p>
            </div>
            <Switch
              checked={settings.passcode_enabled}
              disabled
            />
            <span className="absolute right-12 text-[10px] text-muted-foreground">Coming soon</span>
          </div>

          {/* Local only (informational) */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 opacity-60">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Store data locally only</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep all confession data on this device only
              </p>
            </div>
            <Switch
              checked={settings.local_only}
              disabled
            />
            <span className="absolute right-12 text-[10px] text-muted-foreground">Coming soon</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground italic px-4 pt-4">
          Ora will never share, sell, or expose your confession data. Your spiritual journey is between you and God.
        </p>
      </main>
    </div>
  );
};

export default ConfessionPrivacy;
