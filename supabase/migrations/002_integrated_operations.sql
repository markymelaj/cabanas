-- ============================================================
-- Operacion integral: catalogo, reservas manuales, pagos,
-- comprobantes, check-in, salon configurable y fichas.
-- Ejecutar completo en Supabase SQL Editor despues de 001.
-- No borra datos existentes.
-- ============================================================

create extension if not exists "uuid-ossp";

-- Nuevos estados operativos. Si Supabase avisa que un valor ya existe,
-- continuar con el resto del archivo.
alter type reservation_status add value if not exists 'standby';
alter type reservation_status add value if not exists 'checked_in';
alter type reservation_status add value if not exists 'checked_out';
alter type reservation_status add value if not exists 'completed';

alter type quote_status add value if not exists 'cotizada';
alter type quote_status add value if not exists 'reservada';
alter type quote_status add value if not exists 'pagada';
alter type quote_status add value if not exists 'realizada';
alter type quote_status add value if not exists 'cancelada';

-- Catalogo de cabanas editable
alter table public.cabanas add column if not exists subtitulo text;
alter table public.cabanas add column if not exists dormitorios int default 1;
alter table public.cabanas add column if not exists banos numeric(3,1) default 1;
alter table public.cabanas add column if not exists camas text;
alter table public.cabanas add column if not exists metros_cuadrados int;
alter table public.cabanas add column if not exists base_huespedes int default 2;
alter table public.cabanas add column if not exists precio_huesped_extra numeric(10,2) default 0;
alter table public.cabanas add column if not exists min_noches int default 1;
alter table public.cabanas add column if not exists check_in_hora text default '15:00';
alter table public.cabanas add column if not exists check_out_hora text default '11:00';
alter table public.cabanas add column if not exists destacada boolean default false;
alter table public.cabanas add column if not exists updated_at timestamptz default now();

drop trigger if exists cabanas_updated_at on public.cabanas;
create trigger cabanas_updated_at
  before update on public.cabanas
  for each row execute function public.set_updated_at();

-- Clientes como ficha operativa
alter table public.clients add column if not exists documento text;
alter table public.clients add column if not exists direccion text;
alter table public.clients add column if not exists notas text;
alter table public.clients add column if not exists updated_at timestamptz default now();

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Reservas operativas
alter table public.reservations add column if not exists source text default 'web';
alter table public.reservations add column if not exists hold_alert boolean default false;
alter table public.reservations add column if not exists hold_until timestamptz;
alter table public.reservations add column if not exists base_guests int;
alter table public.reservations add column if not exists extra_guest_fee numeric(10,2) default 0;
alter table public.reservations add column if not exists subtotal_amount numeric(10,2);
alter table public.reservations add column if not exists adjustment_amount numeric(10,2) default 0;
alter table public.reservations add column if not exists adjustment_note text;
alter table public.reservations add column if not exists paid_amount numeric(10,2) default 0;
alter table public.reservations add column if not exists balance_amount numeric(10,2);
alter table public.reservations add column if not exists internal_notes text;
alter table public.reservations add column if not exists checkin_token text unique;
alter table public.reservations add column if not exists checkin_status text default 'pending';
alter table public.reservations add column if not exists checkin_submitted_at timestamptz;
alter table public.reservations add column if not exists checked_in_at timestamptz;
alter table public.reservations add column if not exists checked_out_at timestamptz;
alter table public.reservations add column if not exists guest_details jsonb default '[]'::jsonb;
alter table public.reservations add column if not exists arrival_time text;
alter table public.reservations add column if not exists vehicle_plate text;

create index if not exists reservations_checkin_token_idx on public.reservations(checkin_token);
create index if not exists reservations_source_idx on public.reservations(source);

update public.reservations
set
  subtotal_amount = coalesce(subtotal_amount, total_amount),
  balance_amount = coalesce(balance_amount, total_amount - coalesce(paid_amount, 0)),
  checkin_token = coalesce(checkin_token, replace(uuid_generate_v4()::text, '-', ''))
where subtotal_amount is null
   or balance_amount is null
   or checkin_token is null;

-- Salon configurable
create table if not exists public.salon_settings (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null default 'Salon de Eventos',
  capacidad int not null default 200,
  metros_cuadrados int default 290,
  precio_jornada_completa numeric(10,2) not null default 800000,
  precio_media_jornada numeric(10,2) not null default 520000,
  anticipo_porcentaje numeric(5,2) not null default 30,
  descripcion text,
  condiciones text,
  fotos text[] default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

drop trigger if exists salon_settings_updated_at on public.salon_settings;
create trigger salon_settings_updated_at
  before update on public.salon_settings
  for each row execute function public.set_updated_at();

insert into public.salon_settings (nombre)
select 'Salon de Eventos'
where not exists (select 1 from public.salon_settings);

create table if not exists public.salon_services (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null default 0,
  precio_por_persona boolean not null default false,
  activa boolean not null default true,
  orden int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists salon_services_updated_at on public.salon_services;
create trigger salon_services_updated_at
  before update on public.salon_services
  for each row execute function public.set_updated_at();

insert into public.salon_services (nombre, descripcion, precio, precio_por_persona, orden)
values
  ('Banqueteria', 'Servicio referencial por invitado', 12000, true, 1),
  ('Sonido e iluminacion', 'Apoyo tecnico para evento', 0, false, 2),
  ('Decoracion', 'Coordinacion de montaje y decoracion', 0, false, 3)
on conflict do nothing;

-- Cotizaciones salon como ficha editable
alter table public.salon_quotes add column if not exists source text default 'web';
alter table public.salon_quotes add column if not exists hold_alert boolean default false;
alter table public.salon_quotes add column if not exists subtotal_amount numeric(10,2);
alter table public.salon_quotes add column if not exists adjustment_amount numeric(10,2) default 0;
alter table public.salon_quotes add column if not exists total_amount numeric(10,2);
alter table public.salon_quotes add column if not exists paid_amount numeric(10,2) default 0;
alter table public.salon_quotes add column if not exists balance_amount numeric(10,2);
alter table public.salon_quotes add column if not exists internal_notes text;

update public.salon_quotes
set
  subtotal_amount = coalesce(subtotal_amount, monto_estimado),
  total_amount = coalesce(total_amount, monto_estimado),
  balance_amount = coalesce(balance_amount, coalesce(monto_estimado, 0) - coalesce(paid_amount, 0))
where total_amount is null
   or balance_amount is null
   or subtotal_amount is null;

-- Pagos y comprobantes, compartidos por cabanas y salon
create table if not exists public.reservation_payments (
  id uuid primary key default uuid_generate_v4(),
  reservation_id uuid references public.reservations(id) on delete cascade,
  salon_quote_id uuid references public.salon_quotes(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  amount numeric(10,2) not null,
  method text not null default 'transferencia',
  paid_at timestamptz not null default now(),
  note text,
  voucher_path text,
  voucher_name text,
  voucher_url text,
  created_at timestamptz default now(),
  constraint payment_target_check check (
    reservation_id is not null or salon_quote_id is not null
  )
);

create index if not exists reservation_payments_reservation_idx on public.reservation_payments(reservation_id);
create index if not exists reservation_payments_salon_idx on public.reservation_payments(salon_quote_id);

-- Notas de seguimiento por cliente/reserva/evento
create table if not exists public.operation_notes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete cascade,
  salon_quote_id uuid references public.salon_quotes(id) on delete cascade,
  note text not null,
  created_by text,
  created_at timestamptz default now()
);

create index if not exists operation_notes_client_idx on public.operation_notes(client_id);
create index if not exists operation_notes_reservation_idx on public.operation_notes(reservation_id);
create index if not exists operation_notes_salon_idx on public.operation_notes(salon_quote_id);

-- Disponibilidad firme: standby/pending alertan en admin, pero no bloquean venta publica.
create or replace function public.check_cabana_availability(
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
  from public.reservations
  where cabana_id = p_cabana_id
    and status::text in ('confirmed', 'checked_in', 'checked_out')
    and (id != coalesce(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid))
    and (check_in < p_check_out and check_out > p_check_in);

  return v_conflicts = 0;
end;
$$;

create or replace function public.get_occupied_dates(
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
    from public.reservations
    where cabana_id = p_cabana_id
      and status::text in ('confirmed', 'checked_in', 'checked_out')
      and check_in < p_to
      and check_out > p_from
  union
    select fecha
    from public.blocked_dates
    where (cabana_id = p_cabana_id or (cabana_id is null and tipo = 'cabana'))
      and fecha between p_from and p_to;
end;
$$;

create or replace function public.get_salon_occupied_dates(
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
    from public.salon_quotes
    where status::text in ('confirmada', 'pagada', 'realizada')
      and fecha_evento between p_from and p_to
  union
    select fecha
    from public.blocked_dates
    where tipo = 'salon'
      and fecha between p_from and p_to;
end;
$$;

-- Vista actualizada para reservas de cabanas
drop view if exists public.reservations_full;
create view public.reservations_full as
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
  from public.reservations r
  left join public.clients c on c.id = r.client_id
  left join public.cabanas cab on cab.id = r.cabana_id;

-- Recalculo de saldos al cargar pagos
create or replace function public.refresh_reservation_payment_totals()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_reservation uuid;
  v_salon uuid;
begin
  v_reservation := coalesce(new.reservation_id, old.reservation_id);
  v_salon := coalesce(new.salon_quote_id, old.salon_quote_id);

  if v_reservation is not null then
    update public.reservations r
    set
      paid_amount = coalesce((
        select sum(amount) from public.reservation_payments p
        where p.reservation_id = v_reservation
      ), 0),
      balance_amount = greatest(coalesce(r.total_amount, 0) - coalesce((
        select sum(amount) from public.reservation_payments p
        where p.reservation_id = v_reservation
      ), 0), 0),
      payment_status = case
        when coalesce((
          select sum(amount) from public.reservation_payments p
          where p.reservation_id = v_reservation
        ), 0) >= coalesce(r.total_amount, 0) then 'approved'::payment_status
        when coalesce((
          select sum(amount) from public.reservation_payments p
          where p.reservation_id = v_reservation
        ), 0) > 0 then 'pending'::payment_status
        else r.payment_status
      end
    where r.id = v_reservation;
  end if;

  if v_salon is not null then
    update public.salon_quotes q
    set
      paid_amount = coalesce((
        select sum(amount) from public.reservation_payments p
        where p.salon_quote_id = v_salon
      ), 0),
      balance_amount = greatest(coalesce(q.total_amount, q.monto_estimado, 0) - coalesce((
        select sum(amount) from public.reservation_payments p
        where p.salon_quote_id = v_salon
      ), 0), 0)
    where q.id = v_salon;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists reservation_payments_refresh_insert on public.reservation_payments;
create trigger reservation_payments_refresh_insert
  after insert on public.reservation_payments
  for each row execute function public.refresh_reservation_payment_totals();

drop trigger if exists reservation_payments_refresh_update on public.reservation_payments;
create trigger reservation_payments_refresh_update
  after update on public.reservation_payments
  for each row execute function public.refresh_reservation_payment_totals();

drop trigger if exists reservation_payments_refresh_delete on public.reservation_payments;
create trigger reservation_payments_refresh_delete
  after delete on public.reservation_payments
  for each row execute function public.refresh_reservation_payment_totals();

-- Storage para comprobantes
insert into storage.buckets (id, name, public)
values ('payment-vouchers', 'payment-vouchers', false)
on conflict (id) do nothing;

drop policy if exists "payment_vouchers_service_role" on storage.objects;
create policy "payment_vouchers_service_role" on storage.objects
  for all to service_role
  using (bucket_id = 'payment-vouchers')
  with check (bucket_id = 'payment-vouchers');

-- Grants y RLS
alter table public.salon_settings enable row level security;
alter table public.salon_services enable row level security;
alter table public.reservation_payments enable row level security;
alter table public.operation_notes enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.cabanas, public.blocked_dates, public.salon_settings, public.salon_services to anon, authenticated, service_role;
grant all privileges on public.cabanas, public.clients, public.reservations, public.salon_quotes, public.blocked_dates, public.salon_settings, public.salon_services, public.reservation_payments, public.operation_notes to service_role;
grant select on public.reservations_full to service_role;

drop policy if exists "salon_settings_public_read" on public.salon_settings;
create policy "salon_settings_public_read" on public.salon_settings
  for select to anon, authenticated using (true);

drop policy if exists "salon_settings_service_role" on public.salon_settings;
create policy "salon_settings_service_role" on public.salon_settings
  for all to service_role using (true) with check (true);

drop policy if exists "salon_services_public_read" on public.salon_services;
create policy "salon_services_public_read" on public.salon_services
  for select to anon, authenticated using (activa = true);

drop policy if exists "salon_services_service_role" on public.salon_services;
create policy "salon_services_service_role" on public.salon_services
  for all to service_role using (true) with check (true);

drop policy if exists "reservation_payments_service_role" on public.reservation_payments;
create policy "reservation_payments_service_role" on public.reservation_payments
  for all to service_role using (true) with check (true);

drop policy if exists "operation_notes_service_role" on public.operation_notes;
create policy "operation_notes_service_role" on public.operation_notes
  for all to service_role using (true) with check (true);

notify pgrst, 'reload schema';

select 'integrated_operations_ready' as status;
