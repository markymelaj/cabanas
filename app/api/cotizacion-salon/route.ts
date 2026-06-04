import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { sendSalonQuoteConfirmation, sendAdminNotification } from '@/lib/resend'
import { calcSalonPrice } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
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

    if (!nombre || !email || !fechaEvento || !tipoEvento || !numInvitados) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const pricing = calcSalonPrice(numInvitados, servicios ?? [], horario ?? 'completo')
    const clientId = await getOrCreateClientId(supabaseAdmin, { nombre, email, telefono })

    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('salon_quotes')
      .insert({
        client_id: clientId,
        fecha_evento: fechaEvento,
        tipo_evento: tipoEvento,
        num_invitados: numInvitados,
        horario: horario ?? 'completo',
        servicios: servicios ?? [],
        monto_estimado: pricing.total,
        mensaje,
        status: 'nueva',
      })
      .select()
      .single()

    if (quoteError || !quote) {
      logSupabaseError('salon_quotes.insert', quoteError)
      throw new Error('No pudimos guardar la cotizacion. Escribenos por WhatsApp para terminar la solicitud.')
    }

    await sendSalonQuoteConfirmation({
      to: email,
      nombre,
      fechaEvento,
      tipoEvento,
      numInvitados,
      montoEstimado: pricing.total,
      quoteId: quote.id,
    }).catch(console.error)

    await sendAdminNotification({
      type: 'cotizacion_salon',
      nombre,
      email,
      telefono: telefono ?? '',
      detail: `Fecha: ${fechaEvento}\nTipo: ${tipoEvento}\nInvitados: ${numInvitados}\nHorario: ${horario}\nServicios: ${(servicios ?? []).join(', ')}\nEstimado: $${pricing.total.toLocaleString('es-CL')}\nMensaje: ${mensaje ?? ''}`,
      reservationId: quote.id,
    }).catch(console.error)

    return NextResponse.json({ quoteId: quote.id, pricing })
  } catch (err: any) {
    console.error('[cotizacion-salon]', err)
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 })
  }
}
