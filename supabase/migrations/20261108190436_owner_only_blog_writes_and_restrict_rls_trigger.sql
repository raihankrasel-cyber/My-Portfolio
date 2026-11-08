alter policy "Signed-in users can create blog posts as themselves"
  on public.blog_posts
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'raihan.k.rasel@gmail.com'
  );

alter policy "Authors can edit their own blog posts"
  on public.blog_posts
  to authenticated
  using (
    (select auth.uid()) = author_id
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'raihan.k.rasel@gmail.com'
  )
  with check (
    (select auth.uid()) = author_id
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'raihan.k.rasel@gmail.com'
  );

alter policy "Authors can delete their own blog posts"
  on public.blog_posts
  to authenticated
  using (
    (select auth.uid()) = author_id
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'raihan.k.rasel@gmail.com'
  );

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
