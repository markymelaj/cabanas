-- Verificacion rapida si admin/reservas/nueva muestra:
-- "Could not find the 'adjustment_amount' column..."

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reservations'
      and column_name = 'adjustment_amount'
  ) as has_reservation_adjustment_amount,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reservations'
      and column_name = 'checkin_token'
  ) as has_reservation_checkin_token,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'reservation_payments'
  ) as has_reservation_payments;

-- Si alguno sale false, ejecutar completo:
-- supabase/migrations/002_integrated_operations.sql
--
-- Si todos salen true pero Vercel sigue mostrando schema cache:
notify pgrst, 'reload schema';
