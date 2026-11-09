create table public.contact_submissions (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(trim(name)) between 2 and 100),
 email text not null check (char_length(email) between 3 and 254),
 message text not null check (char_length(trim(message)) between 10 and 5000),
 created_at timestamptz not null default now()
);
create index contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
alter table public.contact_submissions enable row level security;
revoke all on table public.contact_submissions from anon, authenticated;
grant all on table public.contact_submissions to service_role;
