-- Add explicit restrictive policies to satisfy RLS policy requirements
create policy "No direct read/write for browser roles on court_sources"
on public.court_sources
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy "No direct read/write for browser roles on court_availability_snapshots"
on public.court_availability_snapshots
as restrictive
for all
to anon, authenticated
using (false)
with check (false);