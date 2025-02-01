import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatDuration(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

interface EnrichmentTimerProps {
  startTime: string;
}

export function EnrichmentTimer({ startTime }: EnrichmentTimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      setElapsed(now - start);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span>Running for: {formatDuration(elapsed)}</span>
    </div>
  );
}
