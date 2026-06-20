-- ProofBell initial schema
-- Social-proof / live-activity widget for indie SaaS. Stripe-powered events.

-- 1) profiles: one row per auth user; holds $49 lifetime access flag
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  lifetime boolean not null default false,        -- true after $49 LTD purchase
  stripe_customer_id text,                         -- OUR Stripe customer (the purchase)
  created_at timestamptz not null default now()
);

-- 2) sites: a website/app the founder installs the widget on
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  domain text,
  public_key text not null unique,                 -- pk_... used by embed.js (read)
  ingest_secret text not null,                      -- sk_... used by server-side track API (write)
  settings jsonb not null default '{
    "position": "bottom-left",
    "theme": "light",
    "display_seconds": 5,
    "gap_seconds": 8,
    "max_events": 20,
    "show_recent_window_days": 30,
    "hide_branding": false
  }'::jsonb,
  -- THE differentiator: connect the founder''s OWN Stripe to auto-pull events
  stripe_account_id text,                           -- connected account (Stripe Connect)
  stripe_connected boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sites_owner_idx on public.sites(owner);

-- 3) events: the activity items the widget shows ("Someone in Tokyo just subscribed")
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  type text not null check (type in ('signup','subscribe','purchase','custom')),
  title text not null,                              -- e.g. "New subscription"
  name text,                                        -- anonymized actor e.g. "Someone" / first name
  location text,                                    -- e.g. "Tokyo, JP"
  amount_cents integer,                             -- for purchase/subscribe, optional
  currency text,
  source text not null default 'api' check (source in ('stripe','api','manual')),
  external_id text,                                 -- dedupe key (e.g. Stripe event id)
  created_at timestamptz not null default now()
);
create index if not exists events_site_created_idx on public.events(site_id, created_at desc);
create unique index if not exists events_site_external_uniq
  on public.events(site_id, external_id) where external_id is not null;

-- Row Level Security ------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.events enable row level security;

-- profiles: a user can see/update only their own row
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- sites: owner-only access (the public widget reads via service role API, not RLS)
create policy "sites_owner_all" on public.sites
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- events: owner can read/manage events for their sites
create policy "events_owner_select" on public.events
  for select using (
    exists (select 1 from public.sites s where s.id = events.site_id and s.owner = auth.uid())
  );
create policy "events_owner_modify" on public.events
  for all using (
    exists (select 1 from public.sites s where s.id = events.site_id and s.owner = auth.uid())
  ) with check (
    exists (select 1 from public.sites s where s.id = events.site_id and s.owner = auth.uid())
  );

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
