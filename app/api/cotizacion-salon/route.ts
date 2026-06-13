import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { sendSalonQuoteConfirmation, sendAdminNotification } from '@/lib/resend'
import { buildSalonQuoteRequestMessage, buildWhatsAppLink } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nombre,
      email,
      telefono,
      fechaEvento,
      tipoEvento,
      numInvitados,
      horario,
      servicios,
      mensaje,
    } = body

    if (!nombre || !email || !telefono || !fechaEvento || !tipoEvento || !numInvitados) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const serviciosSeleccionados = Array.isArray(servicios) ? servicios : []
    const quoteId = crypto.randomUUID()
    let savedToAdmin = false
    let adminError: string | null = null
    let pricing = calcSalonPriceFallback(Number(numInvitados), serviciosSeleccionados, horario ?? 'completo')

    try {
      const supabaseAdmin = getSupabaseAdmin()
      pricing = await calcSalonPriceFromDb(supabaseAdmin, Number(numInvitados), serviciosSeleccionados, horario ?? 'completo')
      const clientId = await getOrCreateClientId(supabaseAdmin, { nombre, email, telefono })
      const { error: quoteError } = await supabaseAdmin
        .from('salon_quotes')
        .insert({
          id: quoteId,
          client_id: clientId,
          fecha_evento: fechaEvento,
          tipo_evento: tipoEvento,
          num_invitados: numInvitados,
          horario: horario ?? 'completo',
          servicios: serviciosSeleccionados,
          monto_estimado: pricing.total,
          subtotal_amount: pricing.total,
          total_amount: pricing.total,
          paid_amount: 0,
          balance_amount: pricing.total,
          mensaje,
          status: 'nueva',
          source: 'web',
          hold_alert: true,
        })

      if (quoteError) {
        logSupabaseError('salon_quotes.insert', quoteError)
        throw quoteError
      }

      savedToAdmin = true
    } catch (error: any) {
      adminError = 'No se pudo guardar en el panel'
      console.error('[cotizacion-salon.admin.save]', error)
    }

    const whatsappMessage = buildSalonQuoteRequestMessage({
      quoteId,
      nombre,
      email,
      telefono,
      fechaEvento,
      tipoEvento,
      numInvitados,
      horario: horario ?? 'completo',
      servicios: serviciosSeleccionados,
      monto: pricing.total,
      mensaje,
      savedToAdmin,
    })
    const whatsappUrl = buildWhatsAppLink(whatsappMessage)

    if (savedToAdmin) {
      await sendSalonQuoteConfirmation({
        to: email,
        nombre,
        fechaEvento,
        tipoEvento,
        numInvitados,
        montoEstimado: pricing.total,
        quoteId,
      }).catch(console.error)

      await sendAdminNotification({
        type: 'cotizacion_salon',
        nombre,
        email,
        telefono,
        detail: `Fecha: ${fechaEvento}\nTipo: ${tipoEvento}\nInvitados: ${numInvitados}\nHorario: ${horario}\nServicios: ${serviciosSeleccionados.join(', ')}\nEstimado: $${pricing.total.toLocaleString('es-CL')}\nMensaje: ${mensaje ?? ''}`,
        reservationId: quoteId,
      }).catch(console.error)
    }

    return NextResponse.json(
      {
        quoteId,
        pricing,
        savedToAdmin,
        whatsappUrl,
        adminError: savedToAdmin ? null : adminError,
      },
      { status: savedToAdmin ? 200 : 202 }
    )
  } catch (err: any) {
    console.error('[cotizacion-salon]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}

async function calcSalonPriceFromDb(supabaseAdmin: any, guests: number, selected: string[], schedule: string) {
  const [{ data: settings }, { data: services }] = await Promise.all([
    supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
    selected.length > 0
      ? supabaseAdmin.from('salon_services').select('*').in('nombre', selected)
      : Promise.resolve({ data: [] }),
  ])

  const arriendoSalon = schedule === 'medio'
    ? Number(settings?.precio_media_jornada ?? 520000)
    : Number(settings?.precio_jornada_completa ?? 800000)

  const dbServices = services ?? []
  const selectedFallback = calcSalonPriceFallback(guests, selected, schedule)
  const extras = dbServices.length > 0
    ? dbServices.reduce((sum: number, service: any) => {
        const price = Number(service.precio ?? 0)
        return sum + (service.precio_por_persona ? price * guests : price)
      }, 0)
    : selectedFallback.banqueteria

  const total = arriendoSalon + extras
  return {
    arriendoSalon,
    banqueteria: extras,
    total,
    porPersona: Math.round(total / Math.max(1, guests)),
  }
}


function calcSalonPriceFallback(guests: number, selected: string[], schedule: string) {
  const base = schedule === 'medio' ? 520000 : 800000
  const normalized = selected.map((item) => item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  const banqueteria = normalized.includes('banqueteria') ? guests * 12000 : 0
  const total = base + banqueteria
  return {
    arriendoSalon: base,
    banqueteria,
    total,
    porPersona: Math.round(total / Math.max(1, guests)),
  }
}
