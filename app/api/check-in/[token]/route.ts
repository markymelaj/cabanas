import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

  const body = await req.json()
  const guests = Array.isArray(body.guests) ? body.guests : []
  const accepted = Boolean(body.accepted)

  if (!accepted) return NextResponse.json({ error: 'Debes aceptar las condiciones.' }, { status: 400 })
  if (guests.length === 0) return NextResponse.json({ error: 'Ingresa al menos un huesped.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: reservation, error: lookupError } = await supabaseAdmin
    .from('reservations')
    .select('id, client_id')
    .eq('checkin_token', token)
    .maybeSingle()

  if (lookupError || !reservation) {
    return NextResponse.json({ error: 'Link no valido o expirado.' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('reservations')
    .update({
      guest_details: guests,
      arrival_time: body.arrivalTime || null,
      vehicle_plate: body.vehiclePlate || null,
      checkin_status: 'submitted',
      checkin_submitted_at: new Date().toISOString(),
    })
    .eq('id', reservation.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (reservation.client_id && (body.documento || body.direccion)) {
    await supabaseAdmin
      .from('clients')
      .update({
        documento: body.documento || null,
        direccion: body.direccion || null,
      })
      .eq('id', reservation.client_id)
  }

  return NextResponse.json({ ok: true })
}
