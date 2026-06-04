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

drop policy if exists "reservations_service_role" on reservations;
create policy "reservations_service_role" on reservations
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "salon_quotes_service_role" on salon_quotes;
create policy "salon_quotes_service_role" on salon_quotes
  for all to service_role
  using (true)
  with check (true);
