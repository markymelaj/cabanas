import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'
import { getOrCreateClientId } from '@/lib/supabase-errors'

const BLOCKING_STATUSES = ['confirmada', 'pagada', 'realizada']

function num(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function hasSalonConflict(supabaseAdmin: any, fecha: string, excludeId?: string) {
  let query = supabaseAdmin
    .from('salon_quotes')
    .select('id')
    .eq('fecha_evento', fecha)
    .in('status', BLOCKING_STATUSES)
    .limit(1)

  if (excludeId) query = query.neq('id', excludeId)

  const { data: quotes } = await query
  if ((quotes ?? []).length > 0) return true

  const { data: blocked } = await supabaseAdmin
    .from('blocked_dates')
    .select('id')
    .eq('tipo', 'salon')
    .eq('fecha', fecha)
    .limit(1)

  return (blocked ?? []).length > 0
}

async function calcSalonTotal(supabaseAdmin: any, body: any) {
  const { data: settings } = await supabaseAdmin
    .from('salon_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  const selectedServices = Array.isArray(body.servicios) ? body.servicios : []
  const { data: services } = selectedServices.length
    ? await supabaseAdmin.from('salon_services').select('*').in('nombre', selectedServices)
    : { data: [] }

  const base = body.horario === 'medio'
    ? num(settings?.precio_media_jornada, 520000)
    : num(settings?.precio_jornada_completa, 800000)

  const serviceAmount = (services ?? []).reduce((sum: number, service: any) => {
    const price = num(service.precio, 0)
    return sum + (service.precio_por_persona ? price * num(body.num_invitados, 1) : price)
  }, 0)

  const subtotal = base + serviceAmount
  const adjustment = num(body.adjustment_amount, 0)
  const total = body.total_amount === '' || body.total_amount == null
    ? Math.max(0, subtotal + adjustment)
    : num(body.total_amount, subtotal)

  return { subtotal, total, adjustment }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.fecha_evento || !body.tipo_evento || !body.client?.nombre || !body.client?.email) {
    return NextResponse.json({ error: 'Faltan datos del evento' }, { status: 400 })
  }

  const status = body.status || 'reservada'
  const conflict = await hasSalonConflict(supabaseAdmin, body.fecha_evento)
  if (conflict && status === 'confirmada') {
    return NextResponse.json({ error: 'El salón ya tiene bloqueo o evento confirmado ese día.' }, { status: 409 })
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

  const pricing = await calcSalonTotal(supabaseAdmin, body)

  const { data, error: insertError } = await supabaseAdmin!
    .from('salon_quotes')
    .insert({
      client_id: clientId,
      fecha_evento: body.fecha_evento,
      tipo_evento: body.tipo_evento,
      num_invitados: num(body.num_invitados, 1),
      horario: body.horario || 'completo',
      servicios: Array.isArray(body.servicios) ? body.servicios : [],
      monto_estimado: pricing.total,
      subtotal_amount: pricing.subtotal,
      adjustment_amount: pricing.adjustment,
      total_amount: pricing.total,
      balance_amount: pricing.total,
      mensaje: body.mensaje || null,
      notas_admin: body.notas_admin || null,
      internal_notes: body.internal_notes || null,
      source: 'manual',
      hold_alert: conflict || status === 'reservada',
      status,
    })
    .select('id')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
  return NextResponse.json({ ok: true, quoteId: data.id, holdAlert: conflict || status === 'reservada' })
}

export async function PATCH(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { data: current, error: currentError } = await supabaseAdmin!
    .from('salon_quotes')
    .select('*')
    .eq('id', body.id)
    .single()

  if (currentError || !current) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  const nextFecha = body.fecha_evento ?? current.fecha_evento
  const nextStatus = body.status ?? current.status
  const conflict = await hasSalonConflict(supabaseAdmin, nextFecha, body.id)
  if (conflict && nextStatus === 'confirmada') {
    return NextResponse.json({ error: 'El salón ya tiene bloqueo o evento confirmado ese día.' }, { status: 409 })
  }

  const pricing = await calcSalonTotal(supabaseAdmin, {
    ...current,
    ...body,
    num_invitados: body.num_invitados ?? current.num_invitados,
    horario: body.horario ?? current.horario,
    servicios: body.servicios ?? current.servicios,
  })

  const { error: updateError } = await supabaseAdmin!
    .from('salon_quotes')
    .update({
      fecha_evento: nextFecha,
      tipo_evento: body.tipo_evento ?? current.tipo_evento,
      num_invitados: num(body.num_invitados, current.num_invitados),
      horario: body.horario ?? current.horario,
      servicios: body.servicios ?? current.servicios,
      monto_estimado: pricing.total,
      subtotal_amount: pricing.subtotal,
      adjustment_amount: pricing.adjustment,
      total_amount: pricing.total,
      balance_amount: Math.max(pricing.total - num(current.paid_amount, 0), 0),
      mensaje: body.mensaje ?? current.mensaje,
      notas_admin: body.notas_admin ?? current.notas_admin,
      internal_notes: body.internal_notes ?? current.internal_notes,
      status: nextStatus,
      hold_alert: conflict || nextStatus === 'reservada',
    })
    .eq('id', body.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  return NextResponse.json({ ok: true, holdAlert: conflict || nextStatus === 'reservada' })
}
