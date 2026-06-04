-- Ejecutar en Supabase SQL Editor si /cabanas aparece vacio.
-- Este archivo asume que ya se ejecuto 001_initial_schema.sql.

insert into cabanas (
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
  'Perfecta para parejas o familias pequenas. Despierta cada manana con una vista panoramica al volcan Osorno y el lago Llanquihue desde tu terraza privada.',
  ARRAY['1 habitacion doble', '1 habitacion con cama 2 plazas', '1 bano completo', 'Cocina equipada', 'Terraza con parrilla', 'Estacionamiento', 'WiFi', 'Ropa de cama incluida'],
  true,
  1
),
(
  'cabana-6',
  'Cabana para 6 personas',
  6,
  120000,
  20000,
  'Amplia cabana con suite, ideal para familias o grupos de amigos.',
  'Espacio, confort y naturaleza en perfecta armonia. Con una suite principal con bano privado, dos habitaciones dobles y un living comedor amplio, esta cabana es ideal para grupos que buscan disfrutar juntos sin renunciar a la privacidad.',
  ARRAY['1 suite con bano privado', '2 habitaciones dobles', '2 banos', 'Living y comedor', 'Cocina completamente equipada', 'Terraza con parrilla', 'Estacionamiento doble', 'WiFi', 'Lavanderia', 'Ropa de cama incluida'],
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

-- Si el formulario de salon o reservas falla al crear clientes, revisa en Vercel
-- que SUPABASE_SERVICE_ROLE_KEY sea la secret/service_role key, no la anon key.
drop policy if exists "clients_service_role" on clients;
create policy "clients_service_role" on clients
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "clients_public_insert" on clients;
create policy "clients_public_insert" on clients
  for insert to anon
  with check (
    length(trim(nombre)) > 0
    and email like '%@%'
  );

drop policy if exists "reservations_service_role" on reservations;
create policy "reservations_service_role" on reservations
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "reservations_public_insert" on reservations;
create policy "reservations_public_insert" on reservations
  for insert to anon
  with check (
    tipo = 'cabana'
    and status = 'pending'
    and payment_status = 'pending'
    and check_out > check_in
    and guests > 0
  );

drop policy if exists "salon_quotes_service_role" on salon_quotes;
create policy "salon_quotes_service_role" on salon_quotes
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "salon_quotes_public_insert" on salon_quotes;
create policy "salon_quotes_public_insert" on salon_quotes
  for insert to anon
  with check (
    status = 'nueva'
    and length(trim(tipo_evento)) > 0
    and num_invitados > 0
  );

create or replace function check_cabana_availability(
  p_cabana_id uuid,
  p_check_in date,
  p_check_out date,
  p_exclude_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflicts int;
begin
  select count(*) into v_conflicts
  from reservations
  where cabana_id = p_cabana_id
    and status not in ('cancelled')
    and (id != coalesce(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid))
    and (check_in < p_check_out and check_out > p_check_in);

  return v_conflicts = 0;
end;
$$;

create or replace function get_occupied_dates(
  p_cabana_id uuid,
  p_from date default current_date,
  p_to date default current_date + interval '6 months'
)
returns setof date
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select generate_series(check_in, check_out - 1, '1 day'::interval)::date
    from reservations
    where cabana_id = p_cabana_id
      and status not in ('cancelled')
      and check_in < p_to
      and check_out > p_from
  union
    select fecha
    from blocked_dates
    where (cabana_id = p_cabana_id or (cabana_id is null and tipo = 'cabana'))
      and fecha between p_from and p_to;
end;
$$;

create or replace function get_salon_occupied_dates(
  p_from date default current_date,
  p_to date default current_date + interval '12 months'
)
returns setof date
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select fecha_evento
    from salon_quotes
    where status in ('confirmada')
      and fecha_evento between p_from and p_to
  union
    select fecha
    from blocked_dates
    where tipo = 'salon'
      and fecha between p_from and p_to;
end;
$$;
