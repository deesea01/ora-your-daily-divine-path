import { Component, ReactNode } from "react";
import { notifyAdminError } from "@/lib/notifyAdmin";

interface Props {
  children: ReactNode;
  /** Resets the boundary when this value changes (e.g. step index). */
  resetKey?: string | number;
  /** Optional label for the surrounding context, included in admin reports. */
  context?: string;
  onRetry?: () => void;
}

interface State {
  error: Error | null;
}

export class StepErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log for the developer console
    console.error("StepErrorBoundary caught:", error, info);
    // Best-effort admin notification
    notifyAdminError({
      where: this.props.context || "StepErrorBoundary",
      message: error.message,
      stack: `${error.stack || ""}\n${info.componentStack || ""}`,
    }).catch(() => {});
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-gold/20 bg-card/60 px-6 py-8 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70">
            A small interruption
          </p>
          <p className="font-serif text-lg text-foreground">
            This step couldn’t be displayed.
          </p>
          <p className="text-sm text-muted-foreground">
            Take a breath. You can try again or continue your prayer.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-2 rounded-full border border-gold/40 px-5 py-2 text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/10"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default StepErrorBoundary;
