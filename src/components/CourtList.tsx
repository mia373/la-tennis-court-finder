import { ExternalLink, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court';
import { formatDistanceToNow } from 'date-fns';

interface CourtListProps {
  courts: Court[];
}

const STATUS_CONFIG = {
  available: { label: 'Available', variant: 'default' as const, color: 'bg-green-500' },
  limited: { label: 'Limited', variant: 'secondary' as const, color: 'bg-yellow-500' },
  full: { label: 'Full', variant: 'destructive' as const, color: 'bg-red-500' },
  unknown: { label: 'Unknown', variant: 'outline' as const, color: 'bg-muted' },
};

export const CourtList = ({ courts }: CourtListProps) => {
  return (
    <div className="space-y-4">
      {courts.map((court) => {
        const status = court.status || 'unknown';
        const config = STATUS_CONFIG[status];
        const lastUpdate = court.observed_at
          ? formatDistanceToNow(new Date(court.observed_at), { addSuffix: true })
          : 'Never';

        return (
          <Card key={court.court_source_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {court.name}
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3" />
                    {court.address || court.area}
                  </CardDescription>
                </div>
                <div className={`h-3 w-3 rounded-full ${config.color} animate-pulse`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {court.available_courts !== null && court.total_courts !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {court.available_courts} of {court.total_courts} courts available
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Updated {lastUpdate}
              </div>
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <a href={court.booking_url} target="_blank" rel="noopener noreferrer">
                    Book Now <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={court.source_url} target="_blank" rel="noopener noreferrer">
                    Info
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
