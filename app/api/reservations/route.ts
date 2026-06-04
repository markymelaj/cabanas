import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { createPreference } from '@/lib/mercadopago'
import { sendReservationConfirmation, sendAdminNotification } from '@/lib/resend'
import { ANTICIPO_PERCENT } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()
    const { cabanaId, checkIn, checkOut, guests, pricing, client } = body

    // Validaciones básicas
    if (!cabanaId || !checkIn || !checkOut || !pricing || !client) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Verificar disponibilidad
    const { data: available } = await supabaseAdmin.rpc('check_cabana_availability', {
      p_cabana_id: cabanaId,
      p_check_in: checkIn,
      p_check_out: checkOut,
    })

    if (!available) {
      return NextResponse.json({ error: 'Las fechas seleccionadas ya no están disponibles.' }, { status: 409 })
    }

    // Obtener cabaña
    const { data: cabana } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .eq('id', cabanaId)
      .single()

    if (!cabana) {
      return NextResponse.json({ error: 'Cabaña no encontrada' }, { status: 404 })
    }

    // Crear o recuperar cliente
    let clientId: string
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', client.email)
      .maybeSingle()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({ nombre: client.nombre, email: client.email, telefono: client.telefono })
        .select('id')
        .single()
      if (clientError || !newClient) throw new Error('Error al crear cliente')
      clientId = newClient.id
    }

    // Crear reserva en estado pending
    const { data: reservation, error: resError } = await supabaseAdmin
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

    if (resError || !reservation) throw new Error('Error al crear reserva')

    // Crear preferencia de Mercado Pago
    const preference = await createPreference({
      reservationId: reservation.id,
      title: `${cabana.nombre} — ${checkIn} al ${checkOut}`,
      quantity: 1,
      unit_price: pricing.anticipo,
      payerEmail: client.email,
      payerName: client.nombre,
    })

    // Guardar payment_url en la reserva
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
