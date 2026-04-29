import { Component, ReactNode } from 'react';
import { RefreshCw, Mail } from 'lucide-react';
import logoImg from '@/assets/logo.png';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class OnboardingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[Onboarding] error boundary caught:', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleRestart = () => {
    try {
      // Clear any local onboarding scratch state, then reload from the top.
      window.location.assign('/onboarding');
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10 text-center">
        <img src={logoImg} alt="Ora" className="mb-6 h-12 w-12 opacity-80" />
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gold/70">
          Something interrupted us
        </p>
        <h1 className="mb-3 max-w-sm font-serif text-2xl leading-tight text-foreground">
          Your path is safe — let's pick this back up.
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          A small hiccup kept this step from loading. Your earlier answers are saved.
          Try again, or restart the gentle setup from the beginning.
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={this.handleRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <button
            onClick={this.handleRestart}
            className="w-full rounded-xl border border-border bg-card py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Restart setup
          </button>
          <a
            href="mailto:hello@oradevotion.com?subject=Onboarding%20issue"
            className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-3 w-3" /> Contact support
          </a>
        </div>

        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-8 max-w-md overflow-auto rounded-lg border border-border bg-card p-3 text-left text-[10px] text-muted-foreground">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}

export default OnboardingErrorBoundary;
