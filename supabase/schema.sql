-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);

create policy "Users can insert their own profile."
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Peaks table
create table public.peaks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  height integer not null,
  primary_factor integer,
  secondary_factor integer,
  nearest_higher_peak text,
  county text,
  municipality text not null,
  lat double precision,
  lng double precision,
  peakbagger_id integer,
  topo_map text,
  description text,
  image_url text,
  created_at timestamptz default now() not null
);

alter table public.peaks enable row level security;

create policy "Peaks are viewable by everyone."
  on public.peaks for select using (true);

-- Only admins can insert/update/delete peaks (handled via service role)

-- Ascents table
create table public.ascents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  peak_id uuid references public.peaks(id) on delete cascade not null,
  date date not null,
  notes text,
  weather text,
  created_at timestamptz default now() not null
);

alter table public.ascents enable row level security;

create policy "Users can view their own ascents."
  on public.ascents for select using (auth.uid() = user_id);

create policy "Users can insert their own ascents."
  on public.ascents for insert with check (auth.uid() = user_id);

create policy "Users can update their own ascents."
  on public.ascents for update using (auth.uid() = user_id);

create policy "Users can delete their own ascents."
  on public.ascents for delete using (auth.uid() = user_id);

-- Index for faster peak lookup by height
create index peaks_height_idx on public.peaks (height desc);

-- Index for user ascents
create index ascents_user_id_idx on public.ascents (user_id);
create index ascents_peak_id_idx on public.ascents (peak_id);
create index ascents_user_peak_idx on public.ascents (user_id, peak_id);
