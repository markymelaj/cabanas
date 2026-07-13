import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { todayInChile } from '@/lib/date-rules'
import { enforceRateLimit } from '@/lib/request-security'

const guestSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  documento: z.string().trim().max(60).optional().default(''),
  edad: z.string().trim().max(3).optional().default(''),
}).strict()

const checkInSchema = z.object({
  guests: z.array(guestSchema).min(1).max(20),
  arrivalTime: z.string().trim().max(20).optional().default(''),
  vehiclePlate: z.string().trim().max(20).optional().default(''),
  documento: z.string().trim().max(60).optional().default(''),
  direccion: z.string().trim().max(240).optional().default(''),
  accepted: z.literal(true),
}).strict()

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!token || token.length > 128) return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })

  const rateLimited = enforceRateLimit(req, `guest-check-in:${token.slice(0, 16)}`, { limit: 8, windowMs: 15 * 60 * 1000 })
  if (rateLimited) return rateLimited

  const parsed = checkInSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Revisa los datos ingresados.' }, { status: 400 })

  const body = parsed.data
  const supabaseAdmin = getSupabaseAdmin()
  const { data: reservation, error: lookupError } = await supabaseAdmin
    .from('reservations')
    .select('id, client_id, status, check_out')
    .eq('checkin_token', token)
    .maybeSingle()

  if (lookupError || !reservation) return NextResponse.json({ error: 'Link no válido o expirado.' }, { status: 404 })
  if (['cancelled', 'no_show', 'completed', 'checked_out'].includes(String(reservation.status)) || String(reservation.check_out) < todayInChile()) {
    return NextResponse.json({ error: 'Este link de check-in ya no está activo.' }, { status: 410 })
  }

  const { error } = await supabaseAdmin
    .from('reservations')
    .update({
      guest_details: body.guests,
      arrival_time: body.arrivalTime || null,
      vehicle_plate: body.vehiclePlate.toUpperCase() || null,
      checkin_status: 'submitted',
      checkin_submitted_at: new Date().toISOString(),
    })
    .eq('id', reservation.id)

  if (error) return NextResponse.json({ error: 'No pudimos guardar el check-in.' }, { status: 400 })

  if (reservation.client_id && (body.documento || body.direccion)) {
    await supabaseAdmin
      .from('clients')
      .update({ documento: body.documento || null, direccion: body.direccion || null })
      .eq('id', reservation.client_id)
  }

  return NextResponse.json({ ok: true })
}
