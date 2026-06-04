-- ============================================================
-- Fix definitivo para acceso API / Vercel
-- Ejecutar completo en Supabase SQL Editor.
-- No borra datos. Repara grants, RLS, policies, funciones y cache REST.
-- ============================================================

-- 1) Permisos base de schema
grant usage on schema public to anon, authenticated, service_role;

-- 2) Grants de tablas para REST/API
grant select on public.cabanas to anon, authenticated, service_role;
grant select on public.blocked_dates to anon, authenticated, service_role;

grant insert on public.clients to anon, authenticated;
grant insert on public.reservations to anon, authenticated;
grant insert on public.salon_quotes to anon, authenticated;

grant all privileges on public.cabanas to service_role;
grant all privileges on public.clients to service_role;
grant all privileges on public.reservations to service_role;
grant all privileges on public.salon_quotes to service_role;
grant all privileges on public.blocked_dates to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- 3) Grants de vistas del panel
grant select on public.reservations_full to service_role;

-- 4) Grants de funciones usadas por disponibilidad
grant execute on function public.check_cabana_availability(uuid, date, date, uuid) to anon, authenticated, service_role;
grant execute on function public.get_occupied_dates(uuid, date, date) to anon, authenticated, service_role;
grant execute on function public.get_salon_occupied_dates(date, date) to anon, authenticated, service_role;

-- 5) RLS activo y politicas consistentes
alter table public.cabanas enable row level security;
alter table public.clients enable row level security;
alter table public.reservations enable row level security;
alter table public.salon_quotes enable row level security;
alter table public.blocked_dates enable row level security;

drop policy if exists "cabanas_public_read" on public.cabanas;
create policy "cabanas_public_read" on public.cabanas
  for select to anon, authenticated
  using (activa = true);

drop policy if exists "cabanas_admin_all" on public.cabanas;
create policy "cabanas_admin_all" on public.cabanas
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "clients_service_role" on public.clients;
create policy "clients_service_role" on public.clients
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "clients_public_insert" on public.clients;
create policy "clients_public_insert" on public.clients
  for insert to anon, authenticated
  with check (
    length(trim(nombre)) > 0
    and email like '%@%'
  );

drop policy if exists "reservations_service_role" on public.reservations;
create policy "reservations_service_role" on public.reservations
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "reservations_public_insert" on public.reservations;
create policy "reservations_public_insert" on public.reservations
  for insert to anon, authenticated
  with check (
    tipo = 'cabana'
    and status = 'pending'
    and payment_status = 'pending'
    and check_out > check_in
    and guests > 0
  );

drop policy if exists "salon_quotes_service_role" on public.salon_quotes;
create policy "salon_quotes_service_role" on public.salon_quotes
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "salon_quotes_public_insert" on public.salon_quotes;
create policy "salon_quotes_public_insert" on public.salon_quotes
  for insert to anon, authenticated
  with check (
    status = 'nueva'
    and length(trim(tipo_evento)) > 0
    and num_invitados > 0
  );

drop policy if exists "blocked_dates_public_read" on public.blocked_dates;
create policy "blocked_dates_public_read" on public.blocked_dates
  for select to anon, authenticated
  using (true);

drop policy if exists "blocked_dates_admin_write" on public.blocked_dates;
create policy "blocked_dates_admin_write" on public.blocked_dates
  for all to service_role
  using (true)
  with check (true);

-- 6) Asegurar cabanas activas y datos minimos si ya existe la tabla vacia/parcial
insert into public.cabanas (
  slug,
  nombre,
  capacidad,
  precio_noche,
  precio_limpieza,
  descripcion_corta,
  descripcion,
  amenidades,
  activa,
  orden
) values
(
  'cabana-2-4',
  'Cabana para 2 y 4 personas',
  4,
  85000,
  15000,
  'Acogedora cabana con vista al lago Llanquihue y los volcanes.',
  'Perfecta para parejas o familias pequenas. Vista al volcan Osorno y al lago Llanquihue desde la terraza privada.',
  array['1 habitacion doble', '1 habitacion con cama 2 plazas', '1 bano completo', 'Cocina equipada', 'Terraza con parrilla', 'Estacionamiento', 'WiFi'],
  true,
  1
),
(
  'cabana-6',
  'Cabana para 6 personas',
  6,
  120000,
  20000,
  'Amplia cabana con suite, ideal para familias o grupos.',
  'Espacio, confort y naturaleza con suite principal, habitaciones dobles y living comedor amplio.',
  array['1 suite con bano privado', '2 habitaciones dobles', '2 banos', 'Living y comedor', 'Cocina equipada', 'Terraza con parrilla', 'Estacionamiento doble', 'WiFi'],
  true,
  2
)
on conflict (slug) do update set
  nombre = excluded.nombre,
  capacidad = excluded.capacidad,
  precio_noche = excluded.precio_noche,
  precio_limpieza = excluded.precio_limpieza,
  descripcion_corta = excluded.descripcion_corta,
  descripcion = excluded.descripcion,
  amenidades = excluded.amenidades,
  activa = true,
  orden = excluded.orden;

-- 7) Recargar schema cache de PostgREST/Supabase API
notify pgrst, 'reload schema';

-- 8) Comprobacion esperada: debe devolver 2 o mas
select count(*) as cabanas_activas_api_ready
from public.cabanas
where activa = true;
