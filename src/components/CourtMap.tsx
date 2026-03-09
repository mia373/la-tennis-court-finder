import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court';

// Fix default marker icon issue with webpack/vite
import 'leaflet/dist/leaflet.css';

interface CourtMapProps {
  courts: Court[];
}

type StatusKey = 'available' | 'limited' | 'full' | 'unknown';

const STATUS_COLORS: Record<StatusKey, string> = {
  available: '#22c55e',
  limited: '#eab308',
  full: '#ef4444',
  unknown: '#94a3b8',
};

const STATUS_LABELS: Record<StatusKey, string> = {
  available: 'Available',
  limited: 'Limited',
  full: 'Full',
  unknown: 'Checking…',
};

const createIcon = (color: string) =>
  L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
  });

// West LA center
const CENTER: [number, number] = [34.025, -118.43];

const FitBounds = ({ courts }: { courts: Court[] }) => {
  const map = useMap();
  useEffect(() => {
    const pts = courts.filter((c) => c.latitude && c.longitude);
    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts.map((c) => [c.latitude!, c.longitude!]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [courts, map]);
  return <></>;
};

export const CourtMap = ({ courts }: CourtMapProps) => {
  const courtsWithPos = courts.filter((c) => c.latitude && c.longitude);

  return (
    <div className="w-full rounded-xl overflow-hidden border" style={{ height: 500 }}>
      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
        />
        <FitBounds courts={courtsWithPos} />

        {courtsWithPos.map((court) => {
          const statusKey = (court.status as StatusKey) ?? 'unknown';
          const color = STATUS_COLORS[statusKey] ?? STATUS_COLORS.unknown;
          const label = STATUS_LABELS[statusKey] ?? STATUS_LABELS.unknown;

          return (
            <Marker
              key={court.court_source_id}
              position={[court.latitude!, court.longitude!]}
              icon={createIcon(color)}
            >
              <Popup>
                <div className="space-y-2 min-w-[180px]">
                  <p className="font-semibold text-sm leading-tight">{court.name}</p>
                  {court.address && (
                    <p className="text-xs text-muted-foreground">{court.address}</p>
                  )}
                  <Badge variant="outline" className="text-xs gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    {label}
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
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
