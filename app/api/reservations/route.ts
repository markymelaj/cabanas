import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { getDefaultCabanaByIdOrSlug } from '@/lib/default-cabanas'
import { sendAdminNotification } from '@/lib/resend'
import { calcCabanaPrice } from '@/lib/pricing'
import { buildReservationRequestMessage, buildWhatsAppLink } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cabanaId, checkIn, checkOut, guests, client } = body

    if (!cabanaId || !checkIn || !checkOut || !client?.nombre || !client?.email || !client?.telefono) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const fallbackCabana = getDefaultCabanaByIdOrSlug(cabanaId)
    let cabana: any = fallbackCabana
    let dbCabanaId: string | null = null
    let supabaseAdmin: any = null

    try {
      supabaseAdmin = getSupabaseAdmin()
      const { data: dbCabana, error: cabanaError } = await supabaseAdmin
        .from('cabanas')
        .select('*')
        .eq('id', cabanaId)
        .maybeSingle()

      if (cabanaError) logSupabaseError('cabanas.maybeSingle', cabanaError)
      if (dbCabana) {
        cabana = dbCabana
        dbCabanaId = dbCabana.id
      }
    } catch (error) {
      console.error('[reservations.cabana.lookup]', error)
    }

    if (!cabana) {
      return NextResponse.json({ error: 'Cabana no encontrada' }, { status: 404 })
    }

    const guestCount = Number(guests)
    if (guestCount < 1 || guestCount > Number(cabana.capacidad)) {
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

    const reservationId = crypto.randomUUID()
    let savedToAdmin = false
    let adminError: string | null = null

    try {
      if (!supabaseAdmin) supabaseAdmin = getSupabaseAdmin()

      if (dbCabanaId) {
        const { data: available, error: availabilityError } = await supabaseAdmin.rpc('check_cabana_availability', {
          p_cabana_id: dbCabanaId,
          p_check_in: checkIn,
          p_check_out: checkOut,
        })

        if (availabilityError) {
          logSupabaseError('check_cabana_availability', availabilityError)
        } else if (!available) {
          return NextResponse.json({ error: 'Las fechas seleccionadas ya no estan disponibles.' }, { status: 409 })
        }
      }

      const clientId = await getOrCreateClientId(supabaseAdmin, client)
      const { error: reservationError } = await supabaseAdmin
        .from('reservations')
        .insert({
          id: reservationId,
          tipo: 'cabana',
          cabana_id: dbCabanaId,
          client_id: clientId,
          check_in: checkIn,
          check_out: checkOut,
          guests: guestCount,
          precio_noche: pricing.precioPorNoche,
          precio_limpieza: pricing.limpieza,
          total_amount: pricing.total,
          anticipo_monto: pricing.anticipo,
          status: 'pending',
          payment_status: 'pending',
          notas: dbCabanaId ? null : `Solicitud para ${cabana.nombre} (${cabana.slug})`,
        })

      if (reservationError) {
        logSupabaseError('reservations.insert', reservationError)
        throw reservationError
      }

      savedToAdmin = true
    } catch (error: any) {
      adminError = 'No se pudo guardar en el panel'
      console.error('[reservations.admin.save]', error)
    }

    const whatsappMessage = buildReservationRequestMessage({
      requestId: reservationId,
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono,
      cabanaNombre: cabana.nombre,
      checkIn,
      checkOut,
      guests: guestCount,
      noches: pricing.noches,
      total: pricing.total,
      anticipo: pricing.anticipo,
      savedToAdmin,
    })
    const whatsappUrl = buildWhatsAppLink(whatsappMessage)

    if (savedToAdmin) {
      await sendAdminNotification({
        type: 'reserva_cabana',
        nombre: client.nombre,
        email: client.email,
        telefono: client.telefono,
        detail: `Cabana: ${cabana.nombre}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nHuespedes: ${guestCount}\nTotal: $${pricing.total.toLocaleString('es-CL')}\nAnticipo sugerido: $${pricing.anticipo.toLocaleString('es-CL')}`,
        reservationId,
      }).catch(console.error)
    }

    return NextResponse.json(
      {
        reservationId,
        pricing,
        savedToAdmin,
        whatsappUrl,
        adminError: savedToAdmin ? null : adminError,
      },
      { status: savedToAdmin ? 200 : 202 }
    )
  } catch (err: any) {
    console.error('[POST /api/reservations]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}
