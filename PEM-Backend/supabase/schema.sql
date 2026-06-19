
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
  paid_amount numeric(12,2) not null default 0,
  description text default '',
  date date not null default current_date,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid')),
  paid_at timestamptz,
  notes text default '',
  created_at timestamptz default now()
);

-- 4. UDHAR PAYMENTS (part payment tracking)
create table if not exists public.udhar_payments (
  id uuid default gen_random_uuid() primary key,
  udhar_id uuid references public.udhar(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  notes text default '',
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.udhar enable row level security;
alter table public.udhar_payments enable row level security;

-- Helper function to check if the current user is an admin without recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users manage own entries" on public.entries;
drop policy if exists "Admins view all entries" on public.entries;
drop policy if exists "Users manage own udhar" on public.udhar;
drop policy if exists "Admins view all udhar" on public.udhar;

-- Profiles: users see own, admins see all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Entries: users see own, admins see all
create policy "Users manage own entries"
  on public.entries for all
  using (auth.uid() = user_id);

create policy "Admins view all entries"
  on public.entries for select
  using (public.is_admin());

-- Udhar: users see own, admins see all
create policy "Users manage own udhar"
  on public.udhar for all
  using (auth.uid() = user_id);

create policy "Admins view all udhar"
  on public.udhar for select
  using (public.is_admin());

-- Udhar payments: users manage own (via udhar ownership)
drop policy if exists "Users manage own udhar_payments" on public.udhar_payments;
drop policy if exists "Admins view all udhar_payments" on public.udhar_payments;

create policy "Users manage own udhar_payments"
  on public.udhar_payments for all
  using (
    exists (
      select 1 from public.udhar
      where udhar.id = udhar_payments.udhar_id
        and udhar.user_id = auth.uid()
    )
  );

create policy "Admins view all udhar_payments"
  on public.udhar_payments for select
  using (public.is_admin());

-- ─── INDEXES ───
create index if not exists idx_entries_user_id on public.entries(user_id);
create index if not exists idx_entries_date on public.entries(date desc);
create index if not exists idx_udhar_user_id on public.udhar(user_id);
create index if not exists idx_udhar_status on public.udhar(status);
create index if not exists idx_udhar_payments_udhar_id on public.udhar_payments(udhar_id);
