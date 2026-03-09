export interface Court {
  court_source_id: string;
  name: string;
  area: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  source_url: string;
  booking_url: string;
  is_active: boolean;
  status: 'available' | 'limited' | 'full' | 'unknown' | null;
  available_courts: number | null;
  total_courts: number | null;
  details: Record<string, unknown> | null;
  observed_at: string | null;
  snapshot_created_at: string | null;
}

export interface MapCourtMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'limited' | 'full' | 'unknown' | null;
  booking_url: string;
}
