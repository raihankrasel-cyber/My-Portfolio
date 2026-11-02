create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 50),
  title text not null check (char_length(title) between 5 and 160),
  body text not null check (char_length(body) between 20 and 12000),
  created_at timestamptz not null default now()
);

create index blog_posts_created_at_idx on public.blog_posts (created_at desc);
create index blog_posts_author_id_idx on public.blog_posts (author_id);

alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

create policy "Anyone can read blog posts"
  on public.blog_posts for select
  to anon, authenticated
  using (true);

create policy "Signed-in users can create blog posts as themselves"
  on public.blog_posts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Authors can edit their own blog posts"
  on public.blog_posts for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own blog posts"
  on public.blog_posts for delete
  to authenticated
  using ((select auth.uid()) = author_id);