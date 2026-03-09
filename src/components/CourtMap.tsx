import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court';

interface CourtMapProps {
  courts: Court[];
}

type StatusKey = 'available' | 'limited' | 'full' | 'unknown';

const STATUS_CONFIG: Record<StatusKey, { label: string; dotClass: string; ringClass: string }> = {
  available: { label: 'Available', dotClass: 'bg-green-500', ringClass: 'ring-green-200' },
  limited: { label: 'Limited', dotClass: 'bg-yellow-500', ringClass: 'ring-yellow-200' },
  full: { label: 'Full', dotClass: 'bg-red-500', ringClass: 'ring-red-200' },
  unknown: { label: 'Checking…', dotClass: 'bg-muted-foreground', ringClass: 'ring-muted' },
};

// Rough West LA bounding box
const BOUNDS = { minLat: 33.98, maxLat: 34.07, minLng: -118.50, maxLng: -118.36 };

const project = (lat: number, lng: number) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100,
  y: 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100,
});

export const CourtMap = ({ courts }: CourtMapProps) => {
  const courtsWithPos = courts.filter((c) => c.latitude && c.longitude);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Simple SVG grid map */}
        <div
          className="relative w-full rounded-xl border bg-muted/10 overflow-hidden"
          style={{ paddingBottom: '56.25%' }}
        >
          <div className="absolute inset-0">
            {/* Grid lines */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={`${i * 10}%`}
                  y1="0"
                  x2={`${i * 10}%`}
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={`${i * 12.5}%`}
                  x2="100%"
                  y2={`${i * 12.5}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Area label */}
            <div className="absolute top-3 left-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
              West LA
            </div>

            {/* Court markers */}
            {courtsWithPos.map((court) => {
              const { x, y } = project(court.latitude!, court.longitude!);
              const statusKey = (court.status as StatusKey) ?? 'unknown';
              const config = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.unknown;

              return (
                <div
                  key={court.court_source_id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
                >
                  <div
                    className={`h-5 w-5 rounded-full ${config.dotClass} ring-4 ${config.ringClass} animate-pulse hover:scale-125 transition-transform`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none w-52">
                    <Card className="shadow-xl border">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-semibold text-sm leading-tight">{court.name}</p>
                        <Badge variant="outline" className="text-xs gap-1">
                          <div className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                          {config.label}
                        </Badge>
                        {court.available_courts !== null && court.total_courts !== null && (
                          <p className="text-xs text-muted-foreground">
                            {court.available_courts}/{court.total_courts} courts open
                          </p>
                        )}
                        <Button asChild size="sm" className="w-full h-7 text-xs">
                          <a href={court.booking_url} target="_blank" rel="noopener noreferrer">
                            Book <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}

            {courtsWithPos.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No court locations available
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
          {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${cfg.dotClass}`} />
              <span className="text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
