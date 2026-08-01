-- ==========================================================================
-- GoodChord - Base de Datos en Supabase (SQL Schema)
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase
-- ==========================================================================

-- 1. Tabla de Canciones (Songs)
create table public.songs (
  id text primary key,
  title text not null,
  artist text not null,
  genre text default 'General',
  rhythm text default '4/4',
  key text default 'C',
  bpm integer default 120,
  capo text default 'Sin capo',
  raw_text text not null,
  is_favorite boolean default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Setlists (Playlists)
create table public.setlists (
  id text primary key,
  title text not null,
  description text,
  song_ids jsonb default '[]'::jsonb,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.songs enable row level security;
alter table public.setlists enable row level security;

-- Politicas de Acceso Abierto para Pruebas (Lectura y Escritura Publica)
create policy "Acceso total lectura publica en canciones"
  on public.songs for select using (true);

create policy "Acceso total insercion publica en canciones"
  on public.songs for insert with check (true);

create policy "Acceso total actualizacion publica en canciones"
  on public.songs for update using (true);

create policy "Acceso total lectura publica en setlists"
  on public.setlists for select using (true);

create policy "Acceso total insercion publica en setlists"
  on public.setlists for insert with check (true);
