import { Sun, CloudSun, Moon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrayerCardProps {
  title: string;
  subtitle: string;
  time: 'morning' | 'midday' | 'night';
  index: number;
  completed?: boolean;
}

const icons = {
  morning: Sun,
  midday: CloudSun,
  night: Moon,
};

const PrayerCard = ({ title, subtitle, time, index, completed }: PrayerCardProps) => {
  const Icon = icons[time];
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/prayer/${time}`)}
      className={`w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/30 hover:glow-gold active:scale-[0.98] animate-fade-in-delay-${index + 1}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {completed && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15">
          <Check className="h-4 w-4 text-gold" />
        </div>
      )}
    </button>
  );
};

export default PrayerCard;
