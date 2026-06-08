import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const { reservationId, status } = await req.json()
  if (!reservationId || !status) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const payload: Record<string, any> = { status }
  if (status === 'checked_in') {
    payload.checked_in_at = new Date().toISOString()
    payload.checkin_status = 'approved'
  }
  if (status === 'checked_out' || status === 'completed') {
    payload.checked_out_at = new Date().toISOString()
  }
  if (status === 'confirmed') {
    payload.hold_alert = false
  }

  const { error: updateError } = await supabaseAdmin!
    .from('reservations')
    .update(payload)
    .eq('id', reservationId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
