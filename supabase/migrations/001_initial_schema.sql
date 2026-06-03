-- ============================================================
-- Cabañas Puerto Varas — Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type reservation_type as enum ('cabana', 'salon');
create type reservation_status as enum ('pending', 'confirmed', 'cancelled', 'no_show');
create type quote_status as enum ('nueva', 'contactada', 'confirmada', 'rechazada');
create type payment_status as enum ('pending', 'approved', 'rejected', 'refunded');

-- ============================================================
-- TABLA: cabanas
-- ============================================================
create table cabanas (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  nombre      text not null,
  capacidad   int not null,
  precio_noche numeric(10,2) not null,
  precio_limpieza numeric(10,2) not null default 15000,
  descripcion text,
  descripcion_corta text,
  amenidades  text[] default '{}',
  fotos       text[] default '{}',
  activa      boolean default true,
  orden       int default 0,
  created_at  timestamptz default now()
);

-- Cabañas iniciales
insert into cabanas (slug, nombre, capacidad, precio_noche, precio_limpieza, descripcion_corta, descripcion, amenidades, orden) values
(
  'cabana-2-4',
  'Cabaña para 2 y 4 personas',
  4,
  85000,
  15000,
  'Acogedora cabaña con vista al lago Llanquihue y los volcanes.',
  'Perfecta para parejas o familias pequeñas. Despierta cada mañana con una vista panorámica inigualable al volcán Osorno y el lago Llanquihue desde tu terraza privada.',
  ARRAY['1 habitación doble', '1 habitación con cama 2 plazas', '1 baño completo', 'Cocina equipada', 'Terraza con parrilla', 'Estacionamiento', 'WiFi', 'Ropa de cama incluida'],
  1
),
(
  'cabana-6',
  'Cabaña para 6 personas',
  6,
  120000,
  20000,
  'Amplia cabaña con suite, ideal para familias o grupos de amigos.',
  'Espacio, confort y naturaleza en perfecta armonía. Con una suite principal con baño privado, dos habitaciones dobles y un living comedor amplio, esta cabaña es ideal para grupos que buscan disfrutar juntos sin renunciar a la privacidad.',
  ARRAY['1 suite con baño privado', '2 habitaciones dobles', '2 baños', 'Living y comedor', 'Cocina completamente equipada', 'Terraza con parrilla', 'Estacionamiento doble', 'WiFi', 'Lavandería', 'Ropa de cama incluida'],
  2
);

-- ============================================================
-- TABLA: clients
-- ============================================================
create table clients (
  id         uuid primary key default uuid_generate_v4(),
  nombre     text not null,
  email      text not null,
  telefono   text,
  origen     text default 'web',
  created_at timestamptz default now()
);

create index clients_email_idx on clients(email);

-- ============================================================
-- TABLA: reservations
-- ============================================================
create table reservations (
  id               uuid primary key default uuid_generate_v4(),
  tipo             reservation_type not null,
  cabana_id        uuid references cabanas(id) on delete set null,
  client_id        uuid references clients(id) on delete set null,
  check_in         date not null,
  check_out        date not null,
  guests           int not null default 1,
  noches           int generated always as (check_out - check_in) stored,
  precio_noche     numeric(10,2),
  precio_limpieza  numeric(10,2) default 0,
  total_amount     numeric(10,2) not null,
  anticipo_monto   numeric(10,2),
  status           reservation_status default 'pending',
  payment_status   payment_status default 'pending',
  payment_id       text,
  payment_url      text,
  notas            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  constraint check_dates check (check_out > check_in)
);

create index reservations_cabana_idx on reservations(cabana_id);
create index reservations_status_idx on reservations(status);
create index reservations_checkin_idx on reservations(check_in);

-- ============================================================
-- TABLA: salon_quotes
-- ============================================================
create table salon_quotes (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid references clients(id) on delete set null,
  fecha_evento    date not null,
  tipo_evento     text not null,
  num_invitados   int not null,
  horario         text not null default 'completo',
  servicios       text[] default '{}',
  monto_estimado  numeric(10,2),
  mensaje         text,
  status          quote_status default 'nueva',
  notas_admin     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index salon_quotes_status_idx on salon_quotes(status);
create index salon_quotes_fecha_idx on salon_quotes(fecha_evento);

-- ============================================================
-- TABLA: blocked_dates
-- ============================================================
create table blocked_dates (
  id         uuid primary key default uuid_generate_v4(),
  fecha      date not null,
  cabana_id  uuid references cabanas(id) on delete cascade,
  tipo       text not null default 'cabana',  -- 'cabana' | 'salon'
  motivo     text,
  created_at timestamptz default now(),
  unique(fecha, cabana_id)
);

create index blocked_dates_fecha_idx on blocked_dates(fecha);

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reservations_updated_at
  before update on reservations
  for each row execute function set_updated_at();

create trigger salon_quotes_updated_at
  before update on salon_quotes
  for each row execute function set_updated_at();

-- ============================================================
-- FUNCIÓN: verificar disponibilidad de cabaña
-- ============================================================
create or replace function check_cabana_availability(
  p_cabana_id uuid,
  p_check_in date,
  p_check_out date,
  p_exclude_id uuid default null
)
returns boolean language plpgsql as $$
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

-- ============================================================
-- FUNCIÓN: obtener fechas ocupadas de una cabaña (rango)
-- ============================================================
create or replace function get_occupied_dates(
  p_cabana_id uuid,
  p_from date default current_date,
  p_to date default current_date + interval '6 months'
)
returns setof date language plpgsql as $$
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

-- ============================================================
-- FUNCIÓN: obtener fechas ocupadas del salón
-- ============================================================
create or replace function get_salon_occupied_dates(
  p_from date default current_date,
  p_to date default current_date + interval '12 months'
)
returns setof date language plpgsql as $$
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table cabanas enable row level security;
alter table clients enable row level security;
alter table reservations enable row level security;
alter table salon_quotes enable row level security;
alter table blocked_dates enable row level security;

-- Cabañas: lectura pública
create policy "cabanas_public_read" on cabanas
  for select using (activa = true);

-- Cabañas: escritura solo admin
create policy "cabanas_admin_all" on cabanas
  for all using (auth.role() = 'service_role');

-- Clients: solo service_role (servidor)
create policy "clients_service_role" on clients
  for all using (auth.role() = 'service_role');

-- Reservations: solo service_role
create policy "reservations_service_role" on reservations
  for all using (auth.role() = 'service_role');

-- Salon_quotes: solo service_role
create policy "salon_quotes_service_role" on salon_quotes
  for all using (auth.role() = 'service_role');

-- Blocked_dates: lectura pública (para mostrar disponibilidad), escritura solo admin
create policy "blocked_dates_public_read" on blocked_dates
  for select using (true);

create policy "blocked_dates_admin_write" on blocked_dates
  for all using (auth.role() = 'service_role');

-- ============================================================
-- VISTA: reservas completas para panel admin
-- ============================================================
create view reservations_full as
  select
    r.*,
    c.nombre as client_nombre,
    c.email as client_email,
    c.telefono as client_telefono,
    cab.nombre as cabana_nombre,
    cab.slug as cabana_slug
  from reservations r
  left join clients c on c.id = r.client_id
  left join cabanas cab on cab.id = r.cabana_id;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
