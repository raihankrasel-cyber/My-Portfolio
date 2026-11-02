create policy "Blog inserts require two-step verification"
  on public.blog_posts as restrictive
  for insert
  to authenticated
  with check ((select auth.jwt()->>'aal') = 'aal2');

create policy "Blog updates require two-step verification"
  on public.blog_posts as restrictive
  for update
  to authenticated
  using ((select auth.jwt()->>'aal') = 'aal2')
  with check ((select auth.jwt()->>'aal') = 'aal2');

create policy "Blog deletes require two-step verification"
  on public.blog_posts as restrictive
  for delete
  to authenticated
  using ((select auth.jwt()->>'aal') = 'aal2');