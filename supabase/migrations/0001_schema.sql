-- ============================================================================
-- EmprendeIA — Schema inicial (Postgres en Supabase)
-- ============================================================================
-- Este archivo crea TODAS las tablas, índices, políticas RLS, triggers y
-- buckets de Storage para reemplazar Firestore.
--
-- Aplicar: pegar este archivo entero en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

-- ─── EXTENSIONES ───────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── LIMPIEZA (idempotencia) ───────────────────────────────────────────────
-- ⚠️ Este bloque tira TODO lo que crea este script, para poder re-ejecutarlo.
-- Es seguro pre-launch (no hay datos). Cuando ya haya usuarios reales, NO
-- vuelvas a correr este script tal cual; usa migraciones incrementales.

-- Drop trigger de auth.users primero (queda colgando si no)
drop trigger if exists trg_on_auth_user_created on auth.users;

-- Drop tablas (cascade tira sus triggers, índices, policies y FKs)
drop table if exists public.ai_usage            cascade;
drop table if exists public.search_history      cascade;
drop table if exists public.saved_suppliers     cascade;
drop table if exists public.learning_paths      cascade;
drop table if exists public.marketing_campaigns cascade;
drop table if exists public.transactions        cascade;
drop table if exists public.brand_identities    cascade;
drop table if exists public.viability_analyses  cascade;
drop table if exists public.profiles            cascade;

-- Drop funciones
drop function if exists public.handle_new_user()      cascade;
drop function if exists public.touch_updated_at()     cascade;

-- Drop tipos enum
drop type if exists transaction_type cascade;
drop type if exists logo_source      cascade;
drop type if exists venture_type     cascade;
drop type if exists plan_status      cascade;
drop type if exists plan_tier        cascade;

-- Drop policies de Storage (los buckets se mantienen — son data, no schema)
drop policy if exists "audios_owner_all"        on storage.objects;
drop policy if exists "logos_owner_all"         on storage.objects;
drop policy if exists "logos_public_read"       on storage.objects;
drop policy if exists "user_uploads_owner_all"  on storage.objects;

-- ============================================================================
-- 1. PROFILES — extensión de auth.users con datos de la app (plan, perfil)
-- ============================================================================
create type plan_tier as enum ('basico', 'oro', 'diamante');
create type plan_status as enum ('active', 'inactive', 'past_due', 'canceled');

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  username     text unique,
  age          int check (age is null or age >= 13),
  photo_url    text,
  plan         plan_tier   not null default 'basico',
  plan_status  plan_status not null default 'inactive',
  -- Stripe
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  current_period_end      timestamptz,
  -- meta
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_username_idx on public.profiles(username);
create index profiles_stripe_customer_idx on public.profiles(stripe_customer_id);

-- ============================================================================
-- 2. VIABILITY_ANALYSES — análisis FODA + semáforo (1 vigente por usuario)
-- ============================================================================
create type venture_type as enum ('new-venture', 'existing-venture');

create table public.viability_analyses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        venture_type not null,
  -- Output completo del flow IA (FODA, semáforo, presupuesto, etc.)
  analysis    jsonb not null,
  -- Inputs originales para poder re-analizar
  inputs      jsonb,
  saved_at    timestamptz not null default now()
);

create index viability_analyses_user_idx on public.viability_analyses(user_id, saved_at desc);

-- ============================================================================
-- 3. BRAND_IDENTITIES — 1 identidad de marca por usuario
-- ============================================================================
create type logo_source as enum ('ai_generated', 'user_uploaded');

create table public.brand_identities (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  brand_name     text not null,
  slogan         text,
  color_palette  jsonb not null default '[]'::jsonb,  -- [{hex, name}, ...]
  logo_prompt    text,
  logo_url       text,
  logo_source    logo_source,
  updated_at     timestamptz not null default now()
);

-- ============================================================================
-- 4. TRANSACTIONS — ingresos/egresos del negocio
-- ============================================================================
create type transaction_type as enum ('income', 'expense');

create table public.transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  description  text not null,
  amount       numeric(12,2) not null check (amount >= 0),
  type         transaction_type not null,
  category     text not null default 'Sin categoría',
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions(user_id, occurred_at desc);
create index transactions_user_type_idx on public.transactions(user_id, type);

-- ============================================================================
-- 5. MARKETING_CAMPAIGNS — campañas + plan de acción IA
-- ============================================================================
create table public.marketing_campaigns (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  campaign_idea   jsonb not null,   -- {title, channel, keyMessage, targetAudience}
  campaign_plan   jsonb not null,   -- {strategy, contentSuggestions, actionableTasks, kpis}
  completed_tasks text[] not null default array[]::text[],
  task_audios     jsonb not null default '[]'::jsonb,  -- [{taskKey, audioUrl}, ...]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index marketing_campaigns_user_idx on public.marketing_campaigns(user_id, created_at desc);

-- ============================================================================
-- 6. LEARNING_PATHS — rutas paso-a-paso (acción) generadas por IA
-- ============================================================================
create table public.learning_paths (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  path_data       jsonb not null,   -- output de generate-action-plan
  completed_tasks text[] not null default array[]::text[],
  task_audios     jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index learning_paths_user_idx on public.learning_paths(user_id, created_at desc);

-- ============================================================================
-- 7. SAVED_SUPPLIERS — proveedores guardados desde sugerencias IA
-- ============================================================================
create table public.saved_suppliers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  contact       text,
  location      text,
  reasoning     text,            -- "por qué es buen fit" desde la IA
  raw           jsonb not null,  -- objeto completo del flow IA
  saved_at      timestamptz not null default now()
);

create index saved_suppliers_user_idx on public.saved_suppliers(user_id, saved_at desc);

-- ============================================================================
-- 8. SEARCH_HISTORY — historial de búsquedas (proveedores, etc.)
-- ============================================================================
create table public.search_history (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  term                text not null,
  resulting_keywords  text[] default array[]::text[],
  created_at          timestamptz not null default now()
);

create index search_history_user_idx on public.search_history(user_id, created_at desc);

-- ============================================================================
-- 9. AI_USAGE — auditoría de calls a IA (rate-limit + control de costos)
-- ============================================================================
create table public.ai_usage (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  flow_name   text not null,
  tokens_in   int,
  tokens_out  int,
  duration_ms int,
  status      text not null,    -- 'success' | 'error'
  error       text,
  created_at  timestamptz not null default now()
);

create index ai_usage_user_time_idx on public.ai_usage(user_id, created_at desc);
create index ai_usage_flow_idx on public.ai_usage(flow_name, created_at desc);

-- ============================================================================
-- TRIGGERS — auto-actualizar updated_at + auto-crear profile al registrarse
-- ============================================================================

-- Función genérica para updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger trg_brand_identities_updated_at
  before update on public.brand_identities
  for each row execute function public.touch_updated_at();

create trigger trg_marketing_campaigns_updated_at
  before update on public.marketing_campaigns
  for each row execute function public.touch_updated_at();

create trigger trg_learning_paths_updated_at
  before update on public.learning_paths
  for each row execute function public.touch_updated_at();

-- Auto-crear profile cuando se crea un user en auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, photo_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY — cada usuario solo ve sus propios datos
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.viability_analyses  enable row level security;
alter table public.brand_identities    enable row level security;
alter table public.transactions        enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.learning_paths      enable row level security;
alter table public.saved_suppliers     enable row level security;
alter table public.search_history      enable row level security;
alter table public.ai_usage            enable row level security;

-- Profiles: el usuario puede leer/editar SU profile
create policy "profiles_owner_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_owner_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- (insert/delete los maneja el trigger handle_new_user / cascada de auth.users)

-- Helper macro: aplicar las 4 políticas (CRUD) sobre user_id = auth.uid()
do $$
declare
  t text;
  tables text[] := array[
    'viability_analyses',
    'brand_identities',
    'transactions',
    'marketing_campaigns',
    'learning_paths',
    'saved_suppliers',
    'search_history',
    'ai_usage'
  ];
begin
  foreach t in array tables loop
    -- brand_identities usa user_id como PK directo
    execute format('create policy "%I_owner_select" on public.%I for select using (auth.uid() = user_id);', t, t);
    execute format('create policy "%I_owner_insert" on public.%I for insert with check (auth.uid() = user_id);', t, t);
    execute format('create policy "%I_owner_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t, t);
    execute format('create policy "%I_owner_delete" on public.%I for delete using (auth.uid() = user_id);', t, t);
  end loop;
end $$;

-- ============================================================================
-- STORAGE BUCKETS — equivalente a Firebase Storage
-- ============================================================================

-- Bucket para audios generados (TTS de tareas y módulos)
insert into storage.buckets (id, name, public)
  values ('audios', 'audios', false)
  on conflict (id) do nothing;

-- Bucket para logos generados / subidos
insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)  -- public para mostrar el logo
  on conflict (id) do nothing;

-- Bucket general para uploads del usuario
insert into storage.buckets (id, name, public)
  values ('user-uploads', 'user-uploads', false)
  on conflict (id) do nothing;

-- Política Storage: usuario solo accede a su carpeta /{user_id}/...
-- (los buckets siguen el patrón: '<userId>/<filename>')

create policy "audios_owner_all" on storage.objects
  for all using (
    bucket_id = 'audios'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'audios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos_owner_all" on storage.objects
  for all using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Logos son public read (para mostrar en la UI)
create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');

create policy "user_uploads_owner_all" on storage.objects
  for all using (
    bucket_id = 'user-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'user-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- FIN
-- ============================================================================
-- Próximos pasos:
-- 1) En Supabase Dashboard → Authentication → Providers, habilitar Google y Email.
-- 2) Configurar Site URL y Redirect URLs (localhost:3000 y producción de Vercel).
-- 3) Variables de entorno en .env.local:
--      NEXT_PUBLIC_SUPABASE_URL=...
--      NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
--      SUPABASE_SERVICE_ROLE_KEY=...  (NO public)
-- ============================================================================
