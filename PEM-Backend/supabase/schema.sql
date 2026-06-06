
-- PEM – Supabase Schema
-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup(NAVO USER)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ENTRIES (expense / income)(MAIN KHATUU)
create table if not exists public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('expense', 'income')),
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  category text default 'General',
  date date not null default current_date,
  notes text default '',
  created_at timestamptz default now()
);

-- 3. UDHAR (lending / borrowing)(other khatuu)
create table if not exists public.udhar (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('gave', 'got')),
  person_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  description text default '',
  date date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  notes text default '',
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.udhar enable row level security;

-- Profiles: users see own, admins see all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Entries: users see own, admins see all
create policy "Users manage own entries"
  on public.entries for all
  using (auth.uid() = user_id);

create policy "Admins view all entries"
  on public.entries for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Udhar: users see own, admins see all
create policy "Users manage own udhar"
  on public.udhar for all
  using (auth.uid() = user_id);

create policy "Admins view all udhar"
  on public.udhar for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── INDEXES ───
create index if not exists idx_entries_user_id on public.entries(user_id);
create index if not exists idx_entries_date on public.entries(date desc);
create index if not exists idx_udhar_user_id on public.udhar(user_id);
create index if not exists idx_udhar_status on public.udhar(status);
