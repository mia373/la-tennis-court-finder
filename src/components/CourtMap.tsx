import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink } from 'lucide-react';
import type { Court } from '@/types/court';

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

const CENTER: L.LatLngExpression = [34.025, -118.43];

export const CourtMap = ({ courts }: CourtMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 13,
      scrollWheelZoom: true,
    });

    // Satellite imagery
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; <a href="https://www.esri.com/">Esri</a>' }
    ).addTo(map);

    // Road overlay
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; <a href="https://www.esri.com/">Esri</a>' }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when courts change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const courtsWithPos = courts.filter((c) => c.latitude && c.longitude);

    courtsWithPos.forEach((court) => {
      const statusKey = (court.status as StatusKey) ?? 'unknown';
      const color = STATUS_COLORS[statusKey] ?? STATUS_COLORS.unknown;
      const label = STATUS_LABELS[statusKey] ?? STATUS_LABELS.unknown;

      const icon = L.divIcon({
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

      const marker = L.marker([court.latitude!, court.longitude!], { icon }).addTo(map);

      const courtsInfo =
        court.available_courts !== null && court.total_courts !== null
          ? `<p style="font-size:12px;color:#666;margin:4px 0 0;">${court.available_courts}/${court.total_courts} courts open</p>`
          : '';

      marker.bindPopup(`
        <div style="min-width:180px;">
          <p style="font-weight:600;font-size:14px;margin:0 0 4px;">${court.name}</p>
          ${court.address ? `<p style="font-size:12px;color:#666;margin:0 0 8px;">${court.address}</p>` : ''}
          <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border:1px solid #e5e7eb;border-radius:9999px;font-size:12px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};"></span>
            ${label}
          </span>
          ${courtsInfo}
          <a href="${court.booking_url}" target="_blank" rel="noopener noreferrer" 
             style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:8px;padding:6px 12px;background:#18181b;color:white;border-radius:6px;text-decoration:none;font-size:12px;">
            Book <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Fit bounds
    if (courtsWithPos.length > 0) {
      const bounds = L.latLngBounds(courtsWithPos.map((c) => [c.latitude!, c.longitude!]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [courts]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border"
      style={{ height: 500 }}
    />
  );
};
