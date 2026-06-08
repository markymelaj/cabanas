import { NextRequest, NextResponse } from 'next/server'
import { addDays } from 'date-fns'
import { requireAdminApi } from '@/lib/admin-api'
import { calcCabanaPrice } from '@/lib/pricing'
import { getOrCreateClientId } from '@/lib/supabase-errors'

const BLOCKING_STATUSES = ['confirmed', 'checked_in', 'checked_out']

function token() {
  return crypto.randomUUID().replace(/-/g, '')
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function hasCabanaConflict(
  supabaseAdmin: any,
  cabanaId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
) {
  let query = supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('cabana_id', cabanaId)
    .in('status', BLOCKING_STATUSES)
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)
    .limit(1)

  if (excludeId) query = query.neq('id', excludeId)

  const { data: reservations } = await query
  if ((reservations ?? []).length > 0) return true

  const { data: blocked } = await supabaseAdmin
    .from('blocked_dates')
    .select('id')
    .or(`cabana_id.eq.${cabanaId},and(cabana_id.is.null,tipo.eq.cabana)`)
    .gte('fecha', checkIn)
    .lt('fecha', checkOut)
    .limit(1)

  return (blocked ?? []).length > 0
}

function buildPricing(cabana: any, body: any) {
  const pricing = calcCabanaPrice(
    new Date(`${body.check_in}T12:00:00`),
    new Date(`${body.check_out}T12:00:00`),
    num(body.precio_noche, num(cabana.precio_noche)),
    num(body.precio_limpieza, num(cabana.precio_limpieza)),
    {
      guests: num(body.guests, 1),
      baseGuests: num(body.base_guests, num(cabana.base_huespedes, cabana.capacidad)),
      extraGuestFee: num(body.extra_guest_fee, num(cabana.precio_huesped_extra)),
      adjustment: num(body.adjustment_amount, 0),
    }
  )

  const manualTotal = body.total_amount === '' || body.total_amount == null
    ? null
    : num(body.total_amount)

  return {
    pricing,
    total: manualTotal ?? pricing.total,
    anticipo: body.anticipo_monto === '' || body.anticipo_monto == null
      ? pricing.anticipo
      : num(body.anticipo_monto),
  }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.cabana_id || !body.check_in || !body.check_out || !body.client?.nombre || !body.client?.email) {
    return NextResponse.json({ error: 'Faltan datos de reserva' }, { status: 400 })
  }

  const { data: cabana, error: cabanaError } = await supabaseAdmin!
    .from('cabanas')
    .select('*')
    .eq('id', body.cabana_id)
    .single()

  if (cabanaError || !cabana) return NextResponse.json({ error: 'Cabana no encontrada' }, { status: 404 })

  const status = body.status || 'standby'
  const conflict = await hasCabanaConflict(supabaseAdmin, body.cabana_id, body.check_in, body.check_out)
  if (conflict && status === 'confirmed') {
    return NextResponse.json({ error: 'La cabana ya tiene bloqueo o reserva confirmada en ese rango.' }, { status: 409 })
  }

  const clientId = await getOrCreateClientId(supabaseAdmin!, {
    nombre: body.client.nombre,
    email: body.client.email,
    telefono: body.client.telefono,
  })

  if (body.client.documento || body.client.direccion || body.client.notas) {
    await supabaseAdmin!
      .from('clients')
      .update({
        documento: body.client.documento || null,
        direccion: body.client.direccion || null,
        notas: body.client.notas || null,
      })
      .eq('id', clientId)
  }

  const { pricing, total, anticipo } = buildPricing(cabana, body)

  const payload = {
    id: crypto.randomUUID(),
    tipo: 'cabana',
    cabana_id: body.cabana_id,
    client_id: clientId,
    check_in: body.check_in,
    check_out: body.check_out,
    guests: num(body.guests, 1),
    precio_noche: num(body.precio_noche, num(cabana.precio_noche)),
    precio_limpieza: num(body.precio_limpieza, num(cabana.precio_limpieza)),
    base_guests: num(body.base_guests, num(cabana.base_huespedes, cabana.capacidad)),
    extra_guest_fee: num(body.extra_guest_fee, num(cabana.precio_huesped_extra)),
    subtotal_amount: pricing.subtotalNoches + pricing.extraHuespedes + pricing.limpieza,
    adjustment_amount: num(body.adjustment_amount, 0),
    adjustment_note: body.adjustment_note || null,
    total_amount: total,
    anticipo_monto: anticipo,
    balance_amount: total,
    status,
    payment_status: 'pending',
    source: 'manual',
    hold_alert: conflict || status === 'standby',
    hold_until: status === 'standby' ? addDays(new Date(), 2).toISOString() : null,
    internal_notes: body.internal_notes || null,
    notas: body.notas || null,
    checkin_token: token(),
  }

  const { data, error: insertError } = await supabaseAdmin!
    .from('reservations')
    .insert(payload)
    .select('id')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  return NextResponse.json({ ok: true, reservationId: data.id, holdAlert: payload.hold_alert })
}

export async function PATCH(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { data: current, error: currentError } = await supabaseAdmin!
    .from('reservations')
    .select('*, cabanas(*)')
    .eq('id', body.id)
    .single()

  if (currentError || !current) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  const cabana = Array.isArray(current.cabanas) ? current.cabanas[0] : current.cabanas
  const next = {
    cabana_id: body.cabana_id ?? current.cabana_id,
    check_in: body.check_in ?? current.check_in,
    check_out: body.check_out ?? current.check_out,
    guests: num(body.guests, current.guests),
    precio_noche: num(body.precio_noche, current.precio_noche),
    precio_limpieza: num(body.precio_limpieza, current.precio_limpieza),
    base_guests: num(body.base_guests, current.base_guests ?? cabana?.base_huespedes ?? current.guests),
    extra_guest_fee: num(body.extra_guest_fee, current.extra_guest_fee ?? 0),
    adjustment_amount: num(body.adjustment_amount, current.adjustment_amount ?? 0),
    status: body.status ?? current.status,
  }

  const conflict = next.cabana_id
    ? await hasCabanaConflict(supabaseAdmin, next.cabana_id, next.check_in, next.check_out, body.id)
    : false

  if (conflict && next.status === 'confirmed') {
    return NextResponse.json({ error: 'La cabana ya tiene bloqueo o reserva confirmada en ese rango.' }, { status: 409 })
  }

  const pricing = calcCabanaPrice(
    new Date(`${next.check_in}T12:00:00`),
    new Date(`${next.check_out}T12:00:00`),
    next.precio_noche,
    next.precio_limpieza,
    {
      guests: next.guests,
      baseGuests: next.base_guests,
      extraGuestFee: next.extra_guest_fee,
      adjustment: next.adjustment_amount,
    }
  )

  const total = body.total_amount === '' || body.total_amount == null
    ? pricing.total
    : num(body.total_amount, pricing.total)

  const payload = {
    cabana_id: next.cabana_id,
    check_in: next.check_in,
    check_out: next.check_out,
    guests: next.guests,
    precio_noche: next.precio_noche,
    precio_limpieza: next.precio_limpieza,
    base_guests: next.base_guests,
    extra_guest_fee: next.extra_guest_fee,
    subtotal_amount: pricing.subtotalNoches + pricing.extraHuespedes + pricing.limpieza,
    adjustment_amount: next.adjustment_amount,
    adjustment_note: body.adjustment_note ?? current.adjustment_note,
    total_amount: total,
    anticipo_monto: body.anticipo_monto === '' || body.anticipo_monto == null
      ? pricing.anticipo
      : num(body.anticipo_monto),
    balance_amount: Math.max(total - num(current.paid_amount, 0), 0),
    status: next.status,
    hold_alert: conflict || next.status === 'standby',
    internal_notes: body.internal_notes ?? current.internal_notes,
    arrival_time: body.arrival_time ?? current.arrival_time,
    vehicle_plate: body.vehicle_plate ?? current.vehicle_plate,
  }

  const { error: updateError } = await supabaseAdmin!
    .from('reservations')
    .update(payload)
    .eq('id', body.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  return NextResponse.json({ ok: true, holdAlert: payload.hold_alert })
}
