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

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function overlaps(a: any, b: any) {
  return a.check_in < b.check_out && a.check_out > b.check_in
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

async function buildOverviewContext(supabaseAdmin: any): Promise<ConflictAdviceContext | NextResponse> {
  const today = dateOnly(new Date())
  const until = dateOnly(addDays(new Date(), 90))

  const [
    { data: reservations, error: reservationsError },
    { data: salonQuotes, error: salonError },
    { data: blockedDates },
  ] = await Promise.all([
    supabaseAdmin
      .from('reservations_full')
      .select('*')
      .not('status', 'in', CABANA_IGNORED_STATUSES)
      .gte('check_out', today)
      .lte('check_in', until)
      .order('check_in', { ascending: true })
      .limit(80),
    supabaseAdmin
      .from('salon_quotes')
      .select('*, clients(*)')
      .not('status', 'in', SALON_IGNORED_STATUSES)
      .gte('fecha_evento', today)
      .lte('fecha_evento', until)
      .order('fecha_evento', { ascending: true })
      .limit(80),
    supabaseAdmin
      .from('blocked_dates')
      .select('*')
      .gte('fecha', today)
      .lte('fecha', until)
      .order('fecha', { ascending: true })
      .limit(80),
  ])

  if (reservationsError) return NextResponse.json({ error: reservationsError.message }, { status: 400 })
  if (salonError) return NextResponse.json({ error: salonError.message }, { status: 400 })

  const cabanaRows = reservations ?? []
  const salonRows = salonQuotes ?? []
  const blocks = blockedDates ?? []
  const conflicts: Record<string, any>[] = []

  for (let i = 0; i < cabanaRows.length; i += 1) {
    for (let j = i + 1; j < cabanaRows.length; j += 1) {
      const a = cabanaRows[i]
      const b = cabanaRows[j]
      if (a.cabana_id && a.cabana_id === b.cabana_id && overlaps(a, b)) {
        conflicts.push({
          kind: 'cabana_overlap',
          severity: a.status === 'confirmed' || b.status === 'confirmed' ? 'alta' : 'media',
          primary: slimReservation(a),
          conflict: slimReservation(b),
        })
      }
    }
  }

  const salonByDate = new Map<string, any[]>()
  salonRows.forEach((item: any) => {
    const list = salonByDate.get(item.fecha_evento) ?? []
    list.push(item)
    salonByDate.set(item.fecha_evento, list)
  })
  salonByDate.forEach((items, fecha) => {
    if (items.length > 1) {
      conflicts.push({
        kind: 'salon_same_date',
        severity: items.some((item) => item.status === 'confirmada' || item.status === 'pagada') ? 'alta' : 'media',
        fecha,
        events: items.map(slimSalon),
      })
    }
  })

  blocks.forEach((block: any) => {
    cabanaRows.forEach((reservation: any) => {
      const hitsRange = block.fecha >= reservation.check_in && block.fecha < reservation.check_out
      const hitsCabana = block.tipo === 'cabana' && (!block.cabana_id || block.cabana_id === reservation.cabana_id)
      if (hitsRange && hitsCabana) {
        conflicts.push({
          kind: 'cabana_blocked_date',
          severity: 'alta',
          block,
          reservation: slimReservation(reservation),
        })
      }
    })

    salonRows.forEach((quote: any) => {
      if (block.tipo === 'salon' && block.fecha === quote.fecha_evento) {
        conflicts.push({
          kind: 'salon_blocked_date',
          severity: 'alta',
          block,
          event: slimSalon(quote),
        })
      }
    })
  })

  const reservationIds = cabanaRows.map((item: any) => item.id)
  const salonIds = salonRows.map((item: any) => item.id)
  const [{ data: reservationPayments }, { data: salonPayments }] = await Promise.all([
    reservationIds.length
      ? supabaseAdmin.from('reservation_payments').select('*').in('reservation_id', reservationIds).order('paid_at', { ascending: false }).limit(80)
      : { data: [] },
    salonIds.length
      ? supabaseAdmin.from('reservation_payments').select('*').in('salon_quote_id', salonIds).order('paid_at', { ascending: false }).limit(80)
      : { data: [] },
  ])

  return {
    type: 'operaciones',
    current: {
      nombre: 'equipo de administración',
      date_range: `${today} a ${until}`,
      cabana_reservations: cabanaRows.length,
      salon_events: salonRows.length,
      blocked_dates: blocks.length,
      conflicts_detected: conflicts.length,
      cabana_standby: cabanaRows.filter((item: any) => item.status === 'standby').length,
      cabana_pending: cabanaRows.filter((item: any) => item.status === 'pending').length,
      salon_reserved: salonRows.filter((item: any) => item.status === 'reservada').length,
      salon_new: salonRows.filter((item: any) => item.status === 'nueva').length,
    },
    conflicts: conflicts.slice(0, 40),
    blockedDates: blocks.slice(0, 40),
    payments: [...(reservationPayments ?? []), ...(salonPayments ?? [])].map(slimPayment).slice(0, 80),
    generatedAt: new Date().toISOString(),
  }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const mode = body.mode === 'overview' ? 'overview' : ''
  const reservationId = typeof body.reservationId === 'string' ? body.reservationId : ''
  const salonQuoteId = typeof body.salonQuoteId === 'string' ? body.salonQuoteId : ''

  if (!mode && !reservationId && !salonQuoteId) {
    return NextResponse.json({ error: 'Debes enviar mode overview, reservationId o salonQuoteId.' }, { status: 400 })
  }

  const context = mode === 'overview'
    ? await buildOverviewContext(supabaseAdmin!)
    : reservationId
      ? await buildCabanaContext(supabaseAdmin!, reservationId)
      : await buildSalonContext(supabaseAdmin!, salonQuoteId)

  if (context instanceof NextResponse) return context

  const advice = await getClaudeConflictAdvice(context)
  return NextResponse.json({ ok: true, advice, context })
}
