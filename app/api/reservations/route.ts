import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { createPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()
    const { cabanaId, checkIn, checkOut, guests, pricing, client } = body

    if (!cabanaId || !checkIn || !checkOut || !pricing || !client) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const { data: available, error: availabilityError } = await supabaseAdmin.rpc('check_cabana_availability', {
      p_cabana_id: cabanaId,
      p_check_in: checkIn,
      p_check_out: checkOut,
    })

    if (availabilityError) {
      logSupabaseError('check_cabana_availability', availabilityError)
      throw new Error('No pudimos verificar disponibilidad. Escribenos por WhatsApp para terminar la reserva.')
    }

    if (!available) {
      return NextResponse.json({ error: 'Las fechas seleccionadas ya no estan disponibles.' }, { status: 409 })
    }

    const { data: cabana, error: cabanaError } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .eq('id', cabanaId)
      .single()

    if (cabanaError) logSupabaseError('cabanas.single', cabanaError)

    if (!cabana) {
      return NextResponse.json({ error: 'Cabana no encontrada' }, { status: 404 })
    }

    const clientId = await getOrCreateClientId(supabaseAdmin, client)

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .insert({
        tipo: 'cabana',
        cabana_id: cabanaId,
        client_id: clientId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        precio_noche: pricing.precioPorNoche,
        precio_limpieza: pricing.limpieza,
        total_amount: pricing.total,
        anticipo_monto: pricing.anticipo,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (reservationError || !reservation) {
      logSupabaseError('reservations.insert', reservationError)
      throw new Error('No pudimos crear la reserva. Escribenos por WhatsApp para terminar la solicitud.')
    }

    const preference = await createPreference({
      reservationId: reservation.id,
      title: `${cabana.nombre} - ${checkIn} al ${checkOut}`,
      quantity: 1,
      unit_price: pricing.anticipo,
      payerEmail: client.email,
      payerName: client.nombre,
    })

    await supabaseAdmin
      .from('reservations')
      .update({ payment_url: preference.sandbox_init_point ?? preference.init_point })
      .eq('id', reservation.id)

    return NextResponse.json({
      reservationId: reservation.id,
      paymentUrl: preference.init_point,
    })
  } catch (err: any) {
    console.error('[POST /api/reservations]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}
