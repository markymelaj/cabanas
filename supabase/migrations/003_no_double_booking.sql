-- 003: Protección contra doble reserva a nivel de base de datos.
--
-- Contexto: /api/reservations valida disponibilidad con
-- check_cabana_availability() y luego inserta. Entre la validación y el
-- insert existe una ventana de carrera: dos solicitudes simultáneas para
-- las mismas fechas pueden pasar la validación y quedar ambas confirmadas.
--
-- Solución: constraint de exclusión con rango de fechas. Postgres garantiza
-- que dos reservas BLOQUEANTES (confirmed / checked_in / checked_out) de la
-- misma cabaña nunca se superpongan, sin importar cuántas requests lleguen
-- al mismo tiempo. Las reservas 'pending' no bloquean (igual que la lógica
-- actual de la app).
--
-- Ejecutar en el SQL Editor de Supabase y luego: notify pgrst, 'reload schema';

create extension if not exists btree_gist;

alter table reservations
  drop constraint if exists reservations_no_overlap;

alter table reservations
  add constraint reservations_no_overlap
  exclude using gist (
    cabana_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (
    cabana_id is not null
    and status in ('confirmed', 'checked_in', 'checked_out')
  );

-- Nota: si al aplicar el constraint hay datos históricos superpuestos,
-- Postgres lo rechazará y listará el conflicto. Resolver esos registros
-- (cancelar o corregir fechas) y volver a ejecutar.
comment on constraint reservations_no_overlap on reservations is
  'Impide superposición de fechas entre reservas firmes de una misma cabaña (protección contra race conditions).';
