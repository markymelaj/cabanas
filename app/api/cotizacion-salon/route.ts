import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendSalonQuoteConfirmation, sendAdminNotification } from '@/lib/resend'
import { calcSalonPrice } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, telefono, fechaEvento, tipoEvento, numInvitados, horario, servicios, mensaje } = body

    if (!nombre || !email || !fechaEvento || !tipoEvento || !numInvitados) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Calcular precio estimado
    const pricing = calcSalonPrice(numInvitados, servicios ?? [], horario ?? 'completo')

    // Crear o recuperar cliente
    let clientId: string
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      clientId = existing.id
    } else {
      const { data: newClient, error } = await supabaseAdmin
        .from('clients')
        .insert({ nombre, email, telefono })
        .select('id')
        .single()
      if (error || !newClient) throw new Error('Error al crear cliente')
      clientId = newClient.id
    }

    // Crear cotización
    const { data: quote, error: qError } = await supabaseAdmin
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

    if (qError || !quote) throw new Error('Error al crear cotización')

    // Emails
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
