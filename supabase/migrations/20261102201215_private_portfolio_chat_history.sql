create table if not exists public.chat_conversations (
  id uuid primary key,
  language text not null default 'en' check (language in ('en','bn')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.chat_conversations, public.chat_messages from anon, authenticated;
grant select, delete on public.chat_conversations to authenticated;
grant select, delete on public.chat_messages to authenticated;

create policy "portfolio owner reads chat conversations"
  on public.chat_conversations for select to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'raihan.k.rasel@gmail.com'
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );

create policy "portfolio owner deletes chat conversations"
  on public.chat_conversations for delete to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'raihan.k.rasel@gmail.com'
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );

create policy "portfolio owner reads chat messages"
  on public.chat_messages for select to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'raihan.k.rasel@gmail.com'
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );

create policy "portfolio owner deletes chat messages"
  on public.chat_messages for delete to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'raihan.k.rasel@gmail.com'
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
  );