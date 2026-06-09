import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'
import { getClaudeConflictAdvice, type ConflictAdviceContext } from '@/lib/anthropic'

const CABANA_IGNORED_STATUSES = '(cancelled,no_show,completed)'
const SALON_IGNORED_STATUSES = '(rechazada,cancelada,realizada)'

function slimPayment(payment: any) {
  return {
    id: payment.id,
    amount: payment.amount,
    method: payment.method,
    paid_at: payment.paid_at,
    note: payment.note,
    reservation_id: payment.reservation_id,
    salon_quote_id: payment.salon_quote_id,
    has_voucher: Boolean(payment.voucher_path),
  }
}

function slimReservation(item: any) {
  return {
    id: item.id,
    cabana_id: item.cabana_id,
    cabana_nombre: item.cabana_nombre,
    client_nombre: item.client_nombre,
    client_email: item.client_email,
    client_telefono: item.client_telefono,
    check_in: item.check_in,
    check_out: item.check_out,
    guests: item.guests,
    noches: item.noches,
    total_amount: item.total_amount,
    paid_amount: item.paid_amount,
    balance_amount: item.balance_amount,
    anticipo_monto: item.anticipo_monto,
    status: item.status,
    payment_status: item.payment_status,
    source: item.source,
    hold_alert: item.hold_alert,
    internal_notes: item.internal_notes,
    notas: item.notas,
    created_at: item.created_at,
  }
}

function slimSalon(item: any) {
  const client = Array.isArray(item.clients) ? item.clients[0] : item.clients

  return {
    id: item.id,
    client_nombre: client?.nombre,
    client_email: client?.email,
    client_telefono: client?.telefono,
    fecha_evento: item.fecha_evento,
    tipo_evento: item.tipo_evento,
    num_invitados: item.num_invitados,
    horario: item.horario,
    servicios: item.servicios,
    monto_estimado: item.monto_estimado,
    total_amount: item.total_amount,
    paid_amount: item.paid_amount,
    balance_amount: item.balance_amount,
    status: item.status,
    source: item.source,
    hold_alert: item.hold_alert,
    mensaje: item.mensaje,
    notas_admin: item.notas_admin,
    internal_notes: item.internal_notes,
    created_at: item.created_at,
  }
}

async function buildCabanaContext(supabaseAdmin: any, reservationId: string): Promise<ConflictAdviceContext | NextResponse> {
  const { data: current, error: currentError } = await supabaseAdmin
    .from('reservations_full')
    .select('*')
    .eq('id', reservationId)
    .maybeSingle()

  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 400 })
  if (!current) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  const { data: conflicts } = await supabaseAdmin
    .from('reservations_full')
    .select('*')
    .eq('cabana_id', current.cabana_id)
    .neq('id', current.id)
    .not('status', 'in', CABANA_IGNORED_STATUSES)
    .lt('check_in', current.check_out)
    .gt('check_out', current.check_in)
    .order('check_in', { ascending: true })

  const { data: blockedDates } = await supabaseAdmin
    .from('blocked_dates')
    .select('*')
    .or(`cabana_id.eq.${current.cabana_id},and(cabana_id.is.null,tipo.eq.cabana)`)
    .gte('fecha', current.check_in)
    .lt('fecha', current.check_out)
    .order('fecha', { ascending: true })

  const reservationIds = [current.id, ...(conflicts ?? []).map((item: any) => item.id)]
  const { data: payments } = reservationIds.length
    ? await supabaseAdmin
        .from('reservation_payments')
        .select('*')
        .in('reservation_id', reservationIds)
        .order('paid_at', { ascending: false })
    : { data: [] }

  return {
    type: 'cabana',
    current: slimReservation(current),
    conflicts: (conflicts ?? []).map(slimReservation),
    blockedDates: blockedDates ?? [],
    payments: (payments ?? []).map(slimPayment),
    generatedAt: new Date().toISOString(),
  }
}

async function buildSalonContext(supabaseAdmin: any, salonQuoteId: string): Promise<ConflictAdviceContext | NextResponse> {
  const { data: current, error: currentError } = await supabaseAdmin
    .from('salon_quotes')
    .select('*, clients(*)')
    .eq('id', salonQuoteId)
    .maybeSingle()

  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 400 })
  if (!current) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  const { data: conflicts } = await supabaseAdmin
    .from('salon_quotes')
    .select('*, clients(*)')
    .eq('fecha_evento', current.fecha_evento)
    .neq('id', current.id)
    .not('status', 'in', SALON_IGNORED_STATUSES)
    .order('created_at', { ascending: true })

  const { data: blockedDates } = await supabaseAdmin
    .from('blocked_dates')
    .select('*')
    .eq('tipo', 'salon')
    .eq('fecha', current.fecha_evento)

  const quoteIds = [current.id, ...(conflicts ?? []).map((item: any) => item.id)]
  const { data: payments } = quoteIds.length
    ? await supabaseAdmin
        .from('reservation_payments')
        .select('*')
        .in('salon_quote_id', quoteIds)
        .order('paid_at', { ascending: false })
    : { data: [] }

  return {
    type: 'salon',
    current: slimSalon(current),
    conflicts: (conflicts ?? []).map(slimSalon),
    blockedDates: blockedDates ?? [],
    payments: (payments ?? []).map(slimPayment),
    generatedAt: new Date().toISOString(),
  }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const reservationId = typeof body.reservationId === 'string' ? body.reservationId : ''
  const salonQuoteId = typeof body.salonQuoteId === 'string' ? body.salonQuoteId : ''

  if (!reservationId && !salonQuoteId) {
    return NextResponse.json({ error: 'Debes enviar reservationId o salonQuoteId.' }, { status: 400 })
  }

  const context = reservationId
    ? await buildCabanaContext(supabaseAdmin!, reservationId)
    : await buildSalonContext(supabaseAdmin!, salonQuoteId)

  if (context instanceof NextResponse) return context

  const advice = await getClaudeConflictAdvice(context)
  return NextResponse.json({ ok: true, advice, context })
}
