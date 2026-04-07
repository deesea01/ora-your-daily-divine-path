import { Sun, CloudSun, Moon } from 'lucide-react';

interface PrayerCardProps {
  title: string;
  subtitle: string;
  time: 'morning' | 'midday' | 'night';
  index: number;
}

const icons = {
  morning: Sun,
  midday: CloudSun,
  night: Moon,
};

const PrayerCard = ({ title, subtitle, time, index }: PrayerCardProps) => {
  const Icon = icons[time];

  return (
    <button
      className={`w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/30 hover:glow-gold active:scale-[0.98] animate-fade-in-delay-${index + 1}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div className="min-w-0">
        <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
};

export default PrayerCard;
