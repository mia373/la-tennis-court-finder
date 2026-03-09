CREATE OR REPLACE VIEW public.public_court_availability
WITH (security_invoker = true) AS
SELECT DISTINCT ON (cs.id)
  cs.id AS court_source_id,
  cs.name,
  cs.area,
  cs.address,
  cs.latitude,
  cs.longitude,
  cs.source_url,
  cs.booking_url,
  cs.is_active,
  cas.status,
  cas.available_courts,
  cas.total_courts,
  cas.details,
  cas.observed_at,
  cas.created_at AS snapshot_created_at
FROM public.court_sources cs
LEFT JOIN public.court_availability_snapshots cas
  ON cas.court_source_id = cs.id
WHERE cs.is_active = true
ORDER BY cs.id, cas.observed_at DESC NULLS LAST;