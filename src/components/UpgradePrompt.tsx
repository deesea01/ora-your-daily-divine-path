import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MissionNote } from "@/components/MissionNote";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Optional override for the primary CTA copy */
  ctaLabel?: string;
}

export function UpgradePrompt({
  open,
  onClose,
  title = "Grow deeper in your faith with the saints.",
  description = "Unlock unlimited Saint conversations, the full prayer library, journal & Examen, and progress insights.",
  ctaLabel = "Start your 3-day free trial",
}: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm border-gold/30 bg-card p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-8 pb-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
            <Sparkles className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-xl text-foreground mb-2 leading-snug">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="px-6 pt-4 pb-6 space-y-2">
          <button
            onClick={() => {
              onClose();
              navigate("/paywall");
            }}
            className="w-full rounded-xl bg-gold py-3.5 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {ctaLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Not now
          </button>
          <div className="pt-2">
            <MissionNote variant="compact" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
