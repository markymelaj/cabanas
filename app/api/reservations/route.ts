import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { getDefaultCabanaByIdOrSlug } from '@/lib/default-cabanas'
import { sendAdminNotification } from '@/lib/resend'
import { calcCabanaPrice } from '@/lib/pricing'
import { buildReservationRequestMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import { firstZodError, normalizePhone, reservationRequestSchema } from '@/lib/validation'
import { nightsBetween, todayInChile } from '@/lib/date-rules'
import { enforceRateLimit, looksAutomated } from '@/lib/request-security'

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, 'reservation-request', { limit: 5, windowMs: 10 * 60 * 1000 })
  if (rateLimited) return rateLimited

  try {
    const json = await req.json().catch(() => null)
    const parsed = reservationRequestSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 })

    const { cabanaId, checkIn, checkOut, guests, client, website, submittedAt } = parsed.data
    if (website || looksAutomated(submittedAt)) return NextResponse.json({ error: 'No pudimos validar el envío. Recarga la página e inténtalo nuevamente.' }, { status: 400 })
    if (checkIn < todayInChile()) return NextResponse.json({ error: 'El check-in no puede estar en el pasado.' }, { status: 400 })

    const fallbackCabana = getDefaultCabanaByIdOrSlug(cabanaId)
    let cabana: any = fallbackCabana
    let dbCabanaId: string | null = null
    let supabaseAdmin: ReturnType<typeof getSupabaseAdmin> | null = null

    try {
      supabaseAdmin = getSupabaseAdmin()
      const { data: dbCabana, error: cabanaError } = await supabaseAdmin.from('cabanas').select('*').eq('id', cabanaId).eq('activa', true).maybeSingle()
      if (cabanaError) logSupabaseError('cabanas.maybeSingle', cabanaError)
      if (dbCabana) { cabana = dbCabana; dbCabanaId = dbCabana.id }
    } catch (lookupError) {
      console.error('[reservations.cabana.lookup]', lookupError)
    }

    if (!cabana || cabana.activa === false) return NextResponse.json({ error: 'Cabaña no encontrada o no disponible.' }, { status: 404 })

    const guestCount = Number(guests)
    if (guestCount > Number(cabana.capacidad)) return NextResponse.json({ error: `La capacidad máxima es de ${cabana.capacidad} personas.` }, { status: 400 })

    const nights = nightsBetween(checkIn, checkOut)
    const minNights = Math.max(1, Number(cabana.min_noches ?? 1))
    if (nights < minNights) return NextResponse.json({ error: `La estadía mínima es de ${minNights} noche${minNights === 1 ? '' : 's'}.` }, { status: 400 })

    const pricing = calcCabanaPrice(new Date(`${checkIn}T12:00:00`), new Date(`${checkOut}T12:00:00`), Number(cabana.precio_noche), Number(cabana.precio_limpieza), {
      guests: guestCount,
      baseGuests: Number(cabana.base_huespedes ?? cabana.capacidad),
      extraGuestFee: Number(cabana.precio_huesped_extra ?? 0),
    })

    const reservationId = crypto.randomUUID()
    const cleanClient = { nombre: client.nombre.trim(), email: client.email.trim().toLowerCase(), telefono: normalizePhone(client.telefono) }
    let savedToAdmin = false
    let adminError: string | null = null

    try {
      if (!supabaseAdmin) supabaseAdmin = getSupabaseAdmin()

      if (dbCabanaId) {
        const { data: available, error: availabilityError } = await supabaseAdmin.rpc('check_cabana_availability', { p_cabana_id: dbCabanaId, p_check_in: checkIn, p_check_out: checkOut })
        if (availabilityError) {
          logSupabaseError('check_cabana_availability', availabilityError)
          return NextResponse.json({ error: 'No pudimos verificar disponibilidad. Inténtalo nuevamente en unos minutos.' }, { status: 503 })
        }
        if (!available) return NextResponse.json({ error: 'Las fechas seleccionadas ya no están disponibles.' }, { status: 409 })
      }

      const clientId = await getOrCreateClientId(supabaseAdmin, cleanClient)
      const { error: reservationError } = await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        tipo: 'cabana',
        cabana_id: dbCabanaId,
        client_id: clientId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guestCount,
        precio_noche: pricing.precioPorNoche,
        precio_limpieza: pricing.limpieza,
        base_guests: Number(cabana.base_huespedes ?? cabana.capacidad),
        extra_guest_fee: Number(cabana.precio_huesped_extra ?? 0),
        subtotal_amount: pricing.subtotalNoches + pricing.extraHuespedes + pricing.limpieza,
        adjustment_amount: 0,
        total_amount: pricing.total,
        anticipo_monto: pricing.anticipo,
        paid_amount: 0,
        balance_amount: pricing.total,
        status: 'pending',
        payment_status: 'pending',
        source: 'web',
        hold_alert: true,
        checkin_token: crypto.randomUUID().replace(/-/g, ''),
        notas: dbCabanaId ? null : `Solicitud para ${cabana.nombre} (${cabana.slug})`,
      })

      if (reservationError?.code === '23P01') return NextResponse.json({ error: 'Esas fechas acaban de ocuparse. Elige otro periodo.' }, { status: 409 })
      if (reservationError) { logSupabaseError('reservations.insert', reservationError); throw reservationError }
      savedToAdmin = true
    } catch (saveError) {
      adminError = 'No se pudo guardar en el panel.'
      console.error('[reservations.admin.save]', saveError)
    }

    const whatsappUrl = buildWhatsAppLink(buildReservationRequestMessage({
      requestId: reservationId,
      ...cleanClient,
      cabanaNombre: cabana.nombre,
      checkIn,
      checkOut,
      guests: guestCount,
      noches: pricing.noches,
      total: pricing.total,
      anticipo: pricing.anticipo,
      savedToAdmin,
    }))

    if (savedToAdmin) {
      await sendAdminNotification({
        type: 'reserva_cabana',
        ...cleanClient,
        detail: `Cabaña: ${cabana.nombre}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nHuéspedes: ${guestCount}\nTotal: $${pricing.total.toLocaleString('es-CL')}\nAnticipo sugerido: $${pricing.anticipo.toLocaleString('es-CL')}`,
        reservationId,
      }).catch((notificationError) => console.error('[reservation.notification]', notificationError))
    }

    return NextResponse.json({ reservationId, pricing, savedToAdmin, whatsappUrl, adminError: savedToAdmin ? null : adminError }, { status: savedToAdmin ? 200 : 202 })
  } catch (error) {
    console.error('[POST /api/reservations]', error)
    return NextResponse.json({ error: 'No pudimos procesar la solicitud.' }, { status: 500 })
  }
}
