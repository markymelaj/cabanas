-- ============================================================
-- Alto Cauce Reservas — Operación integrada
-- Ejecutar después de 001_initial_schema.sql.
-- Esta migración deja el producto listo para demo y para cliente real.
-- ============================================================

-- Estados ampliados
alter type reservation_status add value if not exists 'standby';
alter type reservation_status add value if not exists 'checked_in';
alter type reservation_status add value if not exists 'checked_out';
alter type reservation_status add value if not exists 'completed';

alter type quote_status add value if not exists 'cotizada';
alter type quote_status add value if not exists 'reservada';
alter type quote_status add value if not exists 'pagada';
alter type quote_status add value if not exists 'realizada';
alter type quote_status add value if not exists 'cancelada';

-- Cabañas más completas
alter table cabanas add column if not exists subtitulo text;
alter table cabanas add column if not exists dormitorios int;
alter table cabanas add column if not exists banos int;
alter table cabanas add column if not exists camas text;
alter table cabanas add column if not exists metros_cuadrados int;
alter table cabanas add column if not exists base_huespedes int;
alter table cabanas add column if not exists precio_huesped_extra numeric(10,2) default 0;
alter table cabanas add column if not exists min_noches int default 1;
alter table cabanas add column if not exists check_in_hora text default '15:00';
alter table cabanas add column if not exists check_out_hora text default '11:00';
alter table cabanas add column if not exists destacada boolean default false;

-- Clientes
alter table clients add column if not exists documento text;
alter table clients add column if not exists direccion text;
alter table clients add column if not exists notas text;

-- Reservas operativas
alter table reservations add column if not exists subtotal_amount numeric(10,2) default 0;
alter table reservations add column if not exists adjustment_amount numeric(10,2) default 0;
alter table reservations add column if not exists adjustment_note text;
alter table reservations add column if not exists base_guests int;
alter table reservations add column if not exists extra_guest_fee numeric(10,2) default 0;
alter table reservations add column if not exists paid_amount numeric(10,2) default 0;
alter table reservations add column if not exists balance_amount numeric(10,2) default 0;
alter table reservations add column if not exists source text default 'web';
alter table reservations add column if not exists hold_alert boolean default false;
alter table reservations add column if not exists hold_until timestamptz;
alter table reservations add column if not exists internal_notes text;
alter table reservations add column if not exists checkin_token text;
alter table reservations add column if not exists checkin_status text default 'pending';
alter table reservations add column if not exists checkin_submitted_at timestamptz;
alter table reservations add column if not exists checked_in_at timestamptz;
alter table reservations add column if not exists checked_out_at timestamptz;
alter table reservations add column if not exists guest_details jsonb;
alter table reservations add column if not exists arrival_time text;
alter table reservations add column if not exists vehicle_plate text;

update reservations
set balance_amount = greatest(coalesce(total_amount, 0) - coalesce(paid_amount, 0), 0)
where balance_amount is null or balance_amount = 0;

-- Cotizaciones / módulo salón
alter table salon_quotes add column if not exists subtotal_amount numeric(10,2) default 0;
alter table salon_quotes add column if not exists adjustment_amount numeric(10,2) default 0;
alter table salon_quotes add column if not exists total_amount numeric(10,2);
alter table salon_quotes add column if not exists paid_amount numeric(10,2) default 0;
alter table salon_quotes add column if not exists balance_amount numeric(10,2) default 0;
alter table salon_quotes add column if not exists source text default 'web';
alter table salon_quotes add column if not exists hold_alert boolean default false;
alter table salon_quotes add column if not exists internal_notes text;

update salon_quotes
set total_amount = coalesce(total_amount, monto_estimado, 0),
    balance_amount = greatest(coalesce(total_amount, monto_estimado, 0) - coalesce(paid_amount, 0), 0)
where total_amount is null;

-- Configuración editable de salón opcional
create table if not exists salon_settings (
  id uuid primary key default uuid_generate_v4(),
  nombre text default 'Cotizador para salón de eventos',
  descripcion text,
  capacidad int default 200,
  metros_cuadrados int default 290,
  precio_jornada_completa numeric(10,2) default 800000,
  precio_media_jornada numeric(10,2) default 520000,
  activa boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into salon_settings (nombre, descripcion)
select 'Módulo opcional de salón', 'Cotizador comercial para eventos. Se activa solo cuando el cliente también vende salón o celebraciones.'
where not exists (select 1 from salon_settings);

create table if not exists salon_services (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  precio numeric(10,2) not null default 0,
  precio_por_persona boolean default false,
  activa boolean default true,
  orden int default 0,
  created_at timestamptz default now()
);

insert into salon_services (nombre, precio, precio_por_persona, orden)
select 'Banquetería', 12000, true, 1
where not exists (select 1 from salon_services where nombre = 'Banquetería');

-- Pagos y comprobantes
create table if not exists reservation_payments (
  id uuid primary key default uuid_generate_v4(),
  reservation_id uuid references reservations(id) on delete cascade,
  salon_quote_id uuid references salon_quotes(id) on delete cascade,
  amount numeric(10,2) not null,
  method text default 'transferencia',
  paid_at timestamptz default now(),
  note text,
  voucher_path text,
  created_at timestamptz default now(),
  constraint payment_target check (reservation_id is not null or salon_quote_id is not null)
);

create index if not exists reservation_payments_reservation_idx on reservation_payments(reservation_id);
create index if not exists reservation_payments_salon_idx on reservation_payments(salon_quote_id);

-- Notas operativas / informes
create table if not exists operation_notes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete set null,
  reservation_id uuid references reservations(id) on delete cascade,
  salon_quote_id uuid references salon_quotes(id) on delete cascade,
  created_by text default 'sistema',
  note text not null,
  created_at timestamptz default now()
);

-- Recalcular pagos al insertar/editar
create or replace function sync_reservation_payment_totals()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.reservation_id, old.reservation_id) is not null then
    update reservations r
    set paid_amount = coalesce((select sum(amount) from reservation_payments p where p.reservation_id = r.id), 0),
        balance_amount = greatest(coalesce(r.total_amount, 0) - coalesce((select sum(amount) from reservation_payments p where p.reservation_id = r.id), 0), 0),
        payment_status = case
          when coalesce((select sum(amount) from reservation_payments p where p.reservation_id = r.id), 0) <= 0 then 'pending'::payment_status
          when coalesce((select sum(amount) from reservation_payments p where p.reservation_id = r.id), 0) >= coalesce(r.total_amount, 0) then 'approved'::payment_status
          else r.payment_status
        end
    where r.id = coalesce(new.reservation_id, old.reservation_id);
  end if;

  if coalesce(new.salon_quote_id, old.salon_quote_id) is not null then
    update salon_quotes q
    set paid_amount = coalesce((select sum(amount) from reservation_payments p where p.salon_quote_id = q.id), 0),
        balance_amount = greatest(coalesce(q.total_amount, q.monto_estimado, 0) - coalesce((select sum(amount) from reservation_payments p where p.salon_quote_id = q.id), 0), 0)
    where q.id = coalesce(new.salon_quote_id, old.salon_quote_id);
  end if;

  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists reservation_payments_sync on reservation_payments;
create trigger reservation_payments_sync
after insert or update or delete on reservation_payments
for each row execute function sync_reservation_payment_totals();

-- Disponibilidad: solo las reservas firmes bloquean calendario.
-- Pending/standby quedan como seguimiento comercial, no como bloqueo definitivo.
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
    and status in ('confirmed', 'checked_in', 'checked_out')
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
      and status in ('confirmed', 'checked_in', 'checked_out')
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
    where status in ('reservada', 'confirmada', 'pagada')
      and fecha_evento between p_from and p_to
  union
    select fecha
    from blocked_dates
    where tipo = 'salon'
      and fecha between p_from and p_to;
end;
$$;

-- Vista admin enriquecida
create or replace view reservations_full as
  select
    r.*,
    c.nombre as client_nombre,
    c.email as client_email,
    c.telefono as client_telefono,
    c.documento as client_documento,
    c.direccion as client_direccion,
    cab.nombre as cabana_nombre,
    cab.slug as cabana_slug,
    cab.fotos as cabana_fotos
  from reservations r
  left join clients c on c.id = r.client_id
  left join cabanas cab on cab.id = r.cabana_id;

-- RLS nuevas tablas
alter table salon_settings enable row level security;
alter table salon_services enable row level security;
alter table reservation_payments enable row level security;
alter table operation_notes enable row level security;


do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'salon_settings' and policyname = 'salon_settings_public_read') then
    create policy "salon_settings_public_read" on salon_settings for select using (activa = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'salon_settings' and policyname = 'salon_settings_admin') then
    create policy "salon_settings_admin" on salon_settings for all using (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'salon_services' and policyname = 'salon_services_public_read') then
    create policy "salon_services_public_read" on salon_services for select using (activa = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'salon_services' and policyname = 'salon_services_admin') then
    create policy "salon_services_admin" on salon_services for all using (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reservation_payments' and policyname = 'reservation_payments_admin') then
    create policy "reservation_payments_admin" on reservation_payments for all using (auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'operation_notes' and policyname = 'operation_notes_admin') then
    create policy "operation_notes_admin" on operation_notes for all using (auth.role() = 'service_role');
  end if;
end $$;

notify pgrst, 'reload schema';
