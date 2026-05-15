import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  /** ISO date string, e.g. "2022-08-08" */
  startDate: string;
}

function diff(from: Date, to: Date) {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function AnniversaryCounter({ startDate }: Props) {
  const start = new Date(startDate);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = now
    ? diff(start, now)
    : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const cell = (label: string, value: number, pad = 2) => (
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl md:text-6xl font-medium text-wine tabular-nums">
        {String(value).padStart(pad, "0")}
      </span>
      <span className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
    </div>
  );

  return (
    <div className="relative inline-flex flex-col items-center gap-5">
      <div className="flex items-center gap-3 text-rose">
        <span className="h-px w-10 bg-rose/40" />
        <Heart className="h-4 w-4 fill-rose animate-heartbeat" />
        <span className="font-script text-xl text-wine/80">since {startDate}</span>
        <Heart className="h-4 w-4 fill-rose animate-heartbeat" />
        <span className="h-px w-10 bg-rose/40" />
      </div>

      <div className="grid grid-cols-4 items-end gap-6 md:gap-10 px-8 py-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-rose/20 shadow-[0_20px_60px_-30px_oklch(0.4_0.1_20/0.4)]">
        {cell("Days 天", days, Math.max(2, String(days).length))}
        {cell("Hours 时", hours)}
        {cell("Minutes 分", minutes)}
        {cell("Seconds 秒", seconds)}
      </div>

      <p className="font-script text-2xl text-rose">
        每一秒都在爱你 ♡
      </p>
    </div>
  );
}
