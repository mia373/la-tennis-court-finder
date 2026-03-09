import { ExternalLink, MapPin, Clock, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court';
import { formatDistanceToNow } from 'date-fns';

interface CourtListProps {
  courts: Court[];
}

type StatusKey = 'available' | 'limited' | 'full' | 'unknown';

const STATUS_CONFIG: Record<StatusKey, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; dotClass: string }> = {
  available: { label: 'Available', variant: 'default', dotClass: 'bg-green-500' },
  limited: { label: 'Limited', variant: 'secondary', dotClass: 'bg-yellow-500' },
  full: { label: 'Full', variant: 'destructive', dotClass: 'bg-red-500' },
  unknown: { label: 'Checking…', variant: 'outline', dotClass: 'bg-muted-foreground' },
};

export const CourtList = ({ courts }: CourtListProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {courts.map((court) => {
        const statusKey = (court.status as StatusKey) ?? 'unknown';
        const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.unknown;
        const lastUpdate = court.observed_at
          ? formatDistanceToNow(new Date(court.observed_at), { addSuffix: true })
          : null;

        return (
          <Card key={court.court_source_id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-snug truncate">{court.name}</CardTitle>
                  {court.address && (
                    <CardDescription className="flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{court.address}</span>
                    </CardDescription>
                  )}
                </div>
                <Badge variant={config.variant} className="flex-shrink-0 gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {court.available_courts !== null && court.total_courts !== null && (
                  <div className="text-sm font-medium">
                    {court.available_courts} / {court.total_courts} courts open
                  </div>
                )}
                {lastUpdate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Updated {lastUpdate}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={court.booking_url} target="_blank" rel="noopener noreferrer">
                    Book <ExternalLink className="ml-1.5 h-3 w-3" />
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
