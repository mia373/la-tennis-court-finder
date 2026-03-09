import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Court } from '@/types/court';

interface CourtMapProps {
  courts: Court[];
}

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-green-500' },
  limited: { label: 'Limited', color: 'bg-yellow-500' },
  full: { label: 'Full', color: 'bg-red-500' },
  unknown: { label: 'Unknown', color: 'bg-muted' },
};

export const CourtMap = ({ courts }: CourtMapProps) => {
  const courtsWithLocation = courts.filter((c) => c.latitude && c.longitude);

  // West LA bounding box
  const bounds = {
    minLat: 33.98,
    maxLat: 34.07,
    minLng: -118.50,
    maxLng: -118.36,
  };

  const scaleX = (lng: number) =>
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const scaleY = (lat: number) =>
    100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="relative w-full h-[500px] bg-muted/20 rounded-lg overflow-hidden border">
          {/* Map placeholder background */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">West LA Tennis Courts</p>
            </div>
          </div>

          {/* Court markers */}
          {courtsWithLocation.map((court) => {
            const status = court.status || 'unknown';
            const config = STATUS_CONFIG[status];
            const x = scaleX(court.longitude!);
            const y = scaleY(court.latitude!);

            return (
              <div
                key={court.court_source_id}
                className="absolute group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className={`h-4 w-4 rounded-full ${config.color} border-2 border-background cursor-pointer animate-pulse hover:scale-125 transition-transform`} />
                <div className="absolute left-1/2 -translate-x-1/2 top-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <Card className="w-48 shadow-lg">
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm mb-1">{court.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      {court.available_courts !== null && court.total_courts !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {court.available_courts}/{court.total_courts} available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span>Unknown</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
