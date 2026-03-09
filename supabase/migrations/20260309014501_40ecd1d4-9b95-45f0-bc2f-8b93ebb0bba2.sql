-- Replace restrictive blanket policies with explicit read-only policies
DROP POLICY IF EXISTS "No direct read/write for browser roles on court_sources" ON public.court_sources;
DROP POLICY IF EXISTS "No direct read/write for browser roles on court_availability_snapshots" ON public.court_availability_snapshots;

CREATE POLICY "Public can read court sources"
ON public.court_sources
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Public can read snapshots"
ON public.court_availability_snapshots
FOR SELECT
TO anon, authenticated
USING (true);

-- Recreate public view without security_invoker so safe projection can be read by anon/authenticated
CREATE OR REPLACE VIEW public.public_court_availability AS
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

GRANT SELECT ON public.public_court_availability TO anon, authenticated;