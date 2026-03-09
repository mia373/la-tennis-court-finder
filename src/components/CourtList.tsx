import { ExternalLink, MapPin, Clock, Info, Timer, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court';
import { formatDistanceToNow } from 'date-fns';

interface CourtListProps {
  courts: Court[];
}

type StatusKey = 'available' | 'limited' | 'full' | 'unknown';

const STATUS_CONFIG: Record<StatusKey, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  available: { label: 'OPEN', bgClass: 'bg-court-available/10', textClass: 'text-court-available', dotClass: 'bg-court-available' },
  limited: { label: 'LIMITED', bgClass: 'bg-court-limited/10', textClass: 'text-court-limited', dotClass: 'bg-court-limited' },
  full: { label: 'FULL', bgClass: 'bg-court-full/10', textClass: 'text-court-full', dotClass: 'bg-court-full' },
  unknown: { label: 'CHECKING', bgClass: 'bg-muted', textClass: 'text-muted-foreground', dotClass: 'bg-muted-foreground' },
};

export const CourtList = ({ courts }: CourtListProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
      {courts.map((court) => {
        const statusKey = (court.status as StatusKey) ?? 'unknown';
        const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.unknown;
        const lastUpdate = court.observed_at
          ? formatDistanceToNow(new Date(court.observed_at), { addSuffix: true })
          : null;
        const nextTime = court.details?.next_available_time as string | undefined;

        return (
          <Card
            key={court.court_source_id}
            className="group hover:shadow-lg transition-all duration-200 flex flex-col border-l-4 overflow-hidden"
            style={{ borderLeftColor: `hsl(var(--court-${statusKey === 'unknown' ? 'available' : statusKey}))` }}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold uppercase leading-tight truncate">
                    {court.name}
                  </h3>
                  {court.address && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{court.address}</span>
                    </p>
                  )}
                </div>
                <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bgClass}`}>
                  <div className={`h-2 w-2 rounded-full ${config.dotClass} ${statusKey === 'available' ? 'animate-pulse-live' : ''}`} />
                  <span className={`font-display text-xs font-bold tracking-wide ${config.textClass}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between px-4 pb-4">
              <div className="space-y-1.5">
                {court.available_courts !== null && court.total_courts !== null && (
                  <div className="font-display text-2xl font-bold tracking-tight">
                    {court.available_courts}
                    <span className="text-muted-foreground text-base font-medium">/{court.total_courts}</span>
                    <span className="text-xs font-body text-muted-foreground ml-1.5 uppercase tracking-wide">courts open</span>
                  </div>
                )}
                {nextTime && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Timer className="h-3 w-3" />
                    <span className="font-display uppercase tracking-wide">Next: {nextTime}</span>
                  </div>
                )}
                {lastUpdate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lastUpdate}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <Button asChild size="sm" className="flex-1 font-display uppercase tracking-wide text-xs font-semibold">
                  <a href={court.booking_url} target="_blank" rel="noopener noreferrer">
                    Book Now <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={court.source_url} target="_blank" rel="noopener noreferrer">
                    <Info className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
