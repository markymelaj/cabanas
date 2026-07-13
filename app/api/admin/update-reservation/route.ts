import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

const ALLOWED_STATUSES = new Set(['standby', 'pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show'])
const BLOCKING_STATUSES = new Set(['confirmed', 'checked_in', 'checked_out'])

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json().catch(() => null)
  const reservationId = typeof body?.reservationId === 'string' ? body.reservationId : ''
  const status = typeof body?.status === 'string' ? body.status : ''
  if (!reservationId || !ALLOWED_STATUSES.has(status)) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })

  if (BLOCKING_STATUSES.has(status)) {
    const { data: reservation, error: readError } = await supabaseAdmin!.from('reservations').select('id,cabana_id,check_in,check_out').eq('id', reservationId).maybeSingle()
    if (readError || !reservation) return NextResponse.json({ error: 'No pudimos leer la reserva.' }, { status: 404 })
    if (reservation.cabana_id) {
      const { data: available, error: availabilityError } = await supabaseAdmin!.rpc('check_cabana_availability', { p_cabana_id: reservation.cabana_id, p_check_in: reservation.check_in, p_check_out: reservation.check_out, p_exclude_id: reservationId })
      if (availabilityError) return NextResponse.json({ error: 'No pudimos verificar disponibilidad. No se cambió el estado.' }, { status: 503 })
      if (!available) return NextResponse.json({ error: 'La reserva se superpone con otra estadía confirmada.' }, { status: 409 })
    }
  }

  const payload: Record<string, unknown> = { status }
  if (status === 'checked_in') { payload.checked_in_at = new Date().toISOString(); payload.checkin_status = 'approved' }
  if (status === 'checked_out' || status === 'completed') payload.checked_out_at = new Date().toISOString()
  if (status === 'confirmed') payload.hold_alert = false

  const { error: updateError } = await supabaseAdmin!.from('reservations').update(payload).eq('id', reservationId)
  if (updateError?.code === '23P01') return NextResponse.json({ error: 'La reserva se superpone con otra estadía confirmada.' }, { status: 409 })
  if (updateError) return NextResponse.json({ error: 'No se pudo actualizar la reserva.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
