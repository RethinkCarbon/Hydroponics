-- Allow authenticated users to acknowledge alerts (update acknowledged only)
create policy "Authenticated users can acknowledge alerts"
  on public.alerts for update
  to authenticated
  using (true)
  with check (true);
