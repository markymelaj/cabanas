import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { sendSalonQuoteConfirmation, sendAdminNotification } from '@/lib/resend'
import { calcSalonPrice } from '@/lib/pricing'
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
    const pricing = calcSalonPrice(numInvitados, serviciosSeleccionados, horario ?? 'completo')
    const quoteId = crypto.randomUUID()
    let savedToAdmin = false
    let adminError: string | null = null

    try {
      const supabaseAdmin = getSupabaseAdmin()
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
          mensaje,
          status: 'nueva',
        })

      if (quoteError) {
        logSupabaseError('salon_quotes.insert', quoteError)
        throw quoteError
      }

      savedToAdmin = true
    } catch (error: any) {
      adminError = error?.message ?? 'No se pudo guardar en Supabase'
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
