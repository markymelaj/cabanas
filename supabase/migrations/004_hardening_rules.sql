-- ============================================================
-- Alto Cauce Reservas — Reglas de negocio y endurecimiento
-- Ejecutar después de 003_no_double_booking.sql.
-- ============================================================

-- Normaliza clientes existentes y consolida duplicados por email para que
-- dos solicitudes concurrentes no creen fichas separadas del mismo huésped.
update clients
set email = lower(trim(email))
where email is distinct from lower(trim(email));

do $$
declare
  duplicate_group record;
begin
  for duplicate_group in
    select lower(trim(email)) as normalized_email,
           min(id::text)::uuid as keeper_id
    from clients
    group by lower(trim(email))
    having count(*) > 1
  loop
    update reservations
      set client_id = duplicate_group.keeper_id
      where client_id in (
        select id from clients
        where lower(trim(email)) = duplicate_group.normalized_email
          and id <> duplicate_group.keeper_id
      );

    update salon_quotes
      set client_id = duplicate_group.keeper_id
      where client_id in (
        select id from clients
        where lower(trim(email)) = duplicate_group.normalized_email
          and id <> duplicate_group.keeper_id
      );

    update operation_notes
      set client_id = duplicate_group.keeper_id
      where client_id in (
        select id from clients
        where lower(trim(email)) = duplicate_group.normalized_email
          and id <> duplicate_group.keeper_id
      );

    delete from clients
      where lower(trim(email)) = duplicate_group.normalized_email
        and id <> duplicate_group.keeper_id;
  end loop;
end $$;

create unique index if not exists clients_email_normalized_unique
  on clients (lower(trim(email)));

-- Las escrituras públicas directas ya no son necesarias: los formularios pasan
-- por rutas de servidor que recalculan precios y validan disponibilidad.
drop policy if exists "clients_public_insert" on clients;
drop policy if exists "reservations_public_insert" on reservations;
drop policy if exists "salon_quotes_public_insert" on salon_quotes;

create unique index if not exists reservations_checkin_token_unique
  on reservations (checkin_token)
  where checkin_token is not null;

-- Restricciones nuevas se agregan NOT VALID: protegen escrituras futuras sin
-- impedir el despliegue por registros históricos que deban corregirse aparte.
alter table cabanas
  drop constraint if exists cabanas_capacity_positive,
  add constraint cabanas_capacity_positive check (capacidad > 0) not valid;

alter table cabanas
  drop constraint if exists cabanas_min_nights_positive,
  add constraint cabanas_min_nights_positive check (coalesce(min_noches, 1) > 0) not valid;

alter table reservations
  drop constraint if exists reservations_guests_positive,
  add constraint reservations_guests_positive check (guests > 0) not valid;

alter table salon_quotes
  drop constraint if exists salon_quotes_guests_positive,
  add constraint salon_quotes_guests_positive check (num_invitados > 0) not valid;

alter table reservation_payments
  drop constraint if exists reservation_payments_amount_positive,
  add constraint reservation_payments_amount_positive check (amount > 0) not valid;

-- Un bloqueo general usa cabana_id NULL; un UNIQUE común no considera NULL
-- como igual. Estos índices evitan duplicados globales de salón o cabañas.
create unique index if not exists blocked_dates_global_unique
  on blocked_dates (fecha, tipo)
  where cabana_id is null;

create unique index if not exists blocked_dates_cabana_unique
  on blocked_dates (fecha, cabana_id)
  where cabana_id is not null;

-- La base replica las reglas críticas del servidor. Solo se ejecuta cuando
-- cambian los datos que afectan disponibilidad/capacidad, para no bloquear
-- cambios de estado sobre registros históricos.
create or replace function validate_cabana_reservation_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_min_nights integer;
  v_active boolean;
begin
  if new.tipo <> 'cabana' or new.cabana_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.cabana_id is not distinct from old.cabana_id
     and new.check_in is not distinct from old.check_in
     and new.check_out is not distinct from old.check_out
     and new.guests is not distinct from old.guests then
    return new;
  end if;

  select capacidad, greatest(coalesce(min_noches, 1), 1), coalesce(activa, false)
    into v_capacity, v_min_nights, v_active
  from cabanas
  where id = new.cabana_id;

  if not found then
    raise exception using errcode = '23503', message = 'La cabaña seleccionada no existe.';
  end if;

  if not v_active and coalesce(new.source, 'web') = 'web' then
    raise exception using errcode = '23514', message = 'La cabaña seleccionada no está activa.';
  end if;

  if new.check_out <= new.check_in then
    raise exception using errcode = '23514', message = 'El check-out debe ser posterior al check-in.';
  end if;

  if (new.check_out - new.check_in) < v_min_nights then
    raise exception using errcode = '23514', message = format('La estadía mínima es de %s noche(s).', v_min_nights);
  end if;

  if new.guests < 1 or new.guests > v_capacity then
    raise exception using errcode = '23514', message = format('La capacidad máxima de la cabaña es de %s persona(s).', v_capacity);
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_validate_business_rules on reservations;
create trigger reservations_validate_business_rules
before insert or update of cabana_id, check_in, check_out, guests
on reservations
for each row execute function validate_cabana_reservation_rules();

create or replace function validate_salon_quote_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
begin
  if tg_op = 'UPDATE'
     and new.num_invitados is not distinct from old.num_invitados then
    return new;
  end if;

  select greatest(coalesce(capacidad, 1), 1)
    into v_capacity
  from salon_settings
  where activa = true
  order by created_at asc
  limit 1;

  v_capacity := coalesce(v_capacity, 200);

  if new.num_invitados < 1 or new.num_invitados > v_capacity then
    raise exception using errcode = '23514', message = format('La capacidad máxima del salón es de %s persona(s).', v_capacity);
  end if;

  return new;
end;
$$;

drop trigger if exists salon_quotes_validate_business_rules on salon_quotes;
create trigger salon_quotes_validate_business_rules
before insert or update of num_invitados
on salon_quotes
for each row execute function validate_salon_quote_rules();

comment on function validate_cabana_reservation_rules() is
  'Valida fechas, estadía mínima, capacidad y estado de la cabaña a nivel de base de datos.';
comment on function validate_salon_quote_rules() is
  'Valida la capacidad del salón a nivel de base de datos.';

notify pgrst, 'reload schema';
