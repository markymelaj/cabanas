import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getPayment } from '@/lib/mercadopago'
import { sendReservationConfirmation, sendAdminNotification } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()

    // MP envía distintos tipos de notificación
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const payment = await getPayment(String(paymentId))

    const reservationId = payment.external_reference
    if (!reservationId) return NextResponse.json({ ok: true })

    const mpStatus = payment.status // 'approved' | 'rejected' | 'pending' | etc.

    const paymentStatus =
      mpStatus === 'approved' ? 'approved' :
      mpStatus === 'rejected' ? 'rejected' :
      'pending'

    // Un intento de pago rechazado NO cancela la reserva: el huésped puede
    // reintentar con otro medio. Solo un pago aprobado confirma.
    const reservationStatus =
      mpStatus === 'approved' ? 'confirmed' : 'pending'

    // Actualizar reserva
    await supabaseAdmin
      .from('reservations')
      .update({
        payment_status: paymentStatus,
        payment_id: String(paymentId),
        status: reservationStatus,
      })
      .eq('id', reservationId)

    // Solo enviar emails/notificaciones cuando se aprueba
    if (mpStatus === 'approved') {
      const { data: res } = await supabaseAdmin
        .from('reservations_full')
        .select('*')
        .eq('id', reservationId)
        .single()

      if (res) {
        // Email al cliente
        await sendReservationConfirmation({
          to: res.client_email,
          nombre: res.client_nombre,
          cabanaNombre: res.cabana_nombre ?? 'Cabaña',
          checkIn: res.check_in,
          checkOut: res.check_out,
          guests: res.guests,
          total: res.total_amount,
          anticipo: res.anticipo_monto,
          reservationId: res.id,
        }).catch(console.error)

        // Email al admin
        await sendAdminNotification({
          type: 'reserva_cabana',
          nombre: res.client_nombre,
          email: res.client_email,
          telefono: res.client_telefono ?? '',
          detail: `Cabaña: ${res.cabana_nombre}\nCheck-in: ${res.check_in}\nCheck-out: ${res.check_out}\nHuéspedes: ${res.guests}\nTotal: $${res.total_amount.toLocaleString('es-CL')}\nAnticipo: $${res.anticipo_monto?.toLocaleString('es-CL')}`,
          reservationId: res.id,
        }).catch(console.error)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook-mp]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
