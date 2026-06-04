import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { sendAdminNotification } from '@/lib/resend'
import { calcCabanaPrice } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()
    const { cabanaId, checkIn, checkOut, guests, client } = body

    if (!cabanaId || !checkIn || !checkOut || !client) {
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

    if (Number(guests) < 1 || Number(guests) > Number(cabana.capacidad)) {
      return NextResponse.json({ error: 'Cantidad de huespedes invalida' }, { status: 400 })
    }

    const pricing = calcCabanaPrice(
      new Date(`${checkIn}T12:00:00`),
      new Date(`${checkOut}T12:00:00`),
      Number(cabana.precio_noche),
      Number(cabana.precio_limpieza)
    )

    if (pricing.noches < 1) {
      return NextResponse.json({ error: 'Fechas invalidas' }, { status: 400 })
    }

    const clientId = await getOrCreateClientId(supabaseAdmin, client)
    const reservationId = crypto.randomUUID()

    const { error: reservationError } = await supabaseAdmin
      .from('reservations')
      .insert({
        id: reservationId,
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

    if (reservationError) {
      logSupabaseError('reservations.insert', reservationError)
      throw new Error('No pudimos crear la reserva. Escribenos por WhatsApp para terminar la solicitud.')
    }

    await sendAdminNotification({
      type: 'reserva_cabana',
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono ?? '',
      detail: `Cabana: ${cabana.nombre}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nHuespedes: ${guests}\nTotal: $${pricing.total.toLocaleString('es-CL')}\nAnticipo sugerido: $${pricing.anticipo.toLocaleString('es-CL')}`,
      reservationId,
    }).catch(console.error)

    return NextResponse.json({
      reservationId,
      pricing,
    })
  } catch (err: any) {
    console.error('[POST /api/reservations]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}
