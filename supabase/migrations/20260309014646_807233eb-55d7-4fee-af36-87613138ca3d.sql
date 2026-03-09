-- Ensure the view is accessible by anon/authenticated through their SELECT policy on the base tables
-- Existing policies already grant SELECT to anon/authenticated, just confirm the view grant too
GRANT SELECT ON public.public_court_availability TO anon, authenticated;

-- Also ensure we have the SELECT grants on the base tables (belt-and-suspenders)
GRANT SELECT ON public.court_sources TO anon, authenticated;
GRANT SELECT ON public.court_availability_snapshots TO anon, authenticated;