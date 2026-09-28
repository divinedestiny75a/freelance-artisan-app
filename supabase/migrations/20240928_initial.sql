-- supabase/migrations/20240928_initial.sql
-- This migration sets up the core tables for the Freelance Artisan Marketplace.

-- Table to store artisan profile details (additional to auth.users)
create table public.artisan_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  location text,
  skill_tags text[],
  bio text,
  portfolio_url text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Table for gigs (jobs) posted by clients
create table public.gigs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  budget numeric not null,
  location text,
  required_skills text[],
  status text check (status in ('open','in_progress','completed','cancelled')) default 'open',
  created_at timestamp with time zone default now(),
  deadline timestamp with time zone
);

-- Junction table linking gigs to artisans (applications)
create table public.gig_applications (
  id uuid primary key default uuid_generate_v4(),
  gig_id uuid references public.gigs(id) on delete cascade not null,
  artisan_id uuid references public.artisan_profiles(id) on delete cascade not null,
  cover_letter text,
  proposed_price numeric,
  status text check (status in ('pending','accepted','rejected','withdrawn')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Table for escrow payments (Paystack integration placeholders)
create table public.escrows (
  id uuid primary key default uuid_generate_v4(),
  gig_id uuid references public.gigs(id) on delete cascade not null,
  amount numeric not null,
  paystack_ref text,
  status text check (status in ('initialized','paid','released','refunded')) default 'initialized',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) – simple policies for now
alter table public.artisan_profiles enable row level security;
create policy "public read" on public.artisan_profiles for select using (true);

alter table public.gigs enable row level security;
create policy "public read gigs" on public.gigs for select using (true);
create policy "owner modify" on public.gigs for all using (auth.uid() = client_id);

alter table public.gig_applications enable row level security;
create policy "owner read" on public.gig_applications for select using (auth.uid() = artisan_id or auth.uid() = (select client_id from public.gigs where id = gig_id));
create policy "owner modify" on public.gig_applications for all using (auth.uid() = artisan_id);

alter table public.escrows enable row level security;
create policy "owner read" on public.escrows for select using (auth.uid() = (select client_id from public.gigs where id = gig_id));
create policy "owner modify" on public.escrows for all using (auth.uid() = (select client_id from public.gigs where id = gig_id));
