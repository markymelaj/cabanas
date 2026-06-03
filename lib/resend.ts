import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'reservas@cabanaspuertovaras.cl'
const ADMIN = process.env.RESEND_ADMIN_EMAIL || 'contacto@cabanaspuertovaras.cl'

export async function sendReservationConfirmation({
  to,
  nombre,
  cabanaNombre,
  checkIn,
  checkOut,
  guests,
  total,
  anticipo,
  reservationId,
}: {
  to: string
  nombre: string
  cabanaNombre: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  anticipo: number
  reservationId: string
}) {
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const clp = (n: number) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Reserva confirmada — ${cabanaNombre}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Georgia, serif; color: #1b3b32; background: #f0f7f4; margin: 0; padding: 0; }
  .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
  .header { background: #265a4c; padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: normal; letter-spacing: 0.5px; }
  .header p { color: #8fc5b4; margin: 8px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0ede6; font-size: 14px; }
  .row:last-child { border-bottom: none; }
  .label { color: #978c7e; }
  .value { color: #1b3b32; font-weight: bold; }
  .total { background: #f0f7f4; border-radius: 8px; padding: 16px; margin-top: 20px; text-align: center; }
  .total .monto { font-size: 28px; color: #265a4c; font-weight: bold; }
  .footer { background: #f8f7f6; padding: 20px 32px; text-align: center; font-size: 12px; color: #978c7e; }
  .btn { display: inline-block; background: #265a4c; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Cabañas Puerto Varas</h1>
    <p>Reserva confirmada</p>
  </div>
  <div class="body">
    <p style="font-size:16px; margin-bottom:24px;">Hola <strong>${nombre}</strong>, tu reserva fue confirmada exitosamente. ¡Te esperamos!</p>
    <div class="row"><span class="label">Cabaña</span><span class="value">${cabanaNombre}</span></div>
    <div class="row"><span class="label">Llegada</span><span class="value">${fmt(checkIn)}</span></div>
    <div class="row"><span class="label">Salida</span><span class="value">${fmt(checkOut)}</span></div>
    <div class="row"><span class="label">Huéspedes</span><span class="value">${guests} personas</span></div>
    <div class="row"><span class="label">Anticipo pagado</span><span class="value">${clp(anticipo)}</span></div>
    <div class="total">
      <div style="color:#978c7e; font-size:12px; margin-bottom:4px;">TOTAL RESERVA</div>
      <div class="monto">${clp(total)}</div>
      <div style="color:#978c7e; font-size:12px; margin-top:4px;">El saldo restante se paga al llegar</div>
    </div>
    <p style="font-size:13px; color:#60412c; margin-top:24px;">
      <strong>Dirección:</strong> Camino a Ensenada S/N km 17.5, Ruta 225, Puerto Varas<br>
      <strong>Contacto:</strong> +569 6588 0268 · ${FROM}
    </p>
    <div style="text-align:center">
      <a href="https://maps.app.goo.gl/4YxTYtfonpoMj6rKA" class="btn">Ver en mapa</a>
    </div>
  </div>
  <div class="footer">
    N° de reserva: ${reservationId.slice(0, 8).toUpperCase()} · Cabañas Puerto Varas · cabanaspuertovaras.cl
  </div>
</div>
</body></html>
    `,
  })
}

export async function sendAdminNotification({
  type,
  nombre,
  email,
  telefono,
  detail,
  reservationId,
}: {
  type: 'reserva_cabana' | 'cotizacion_salon'
  nombre: string
  email: string
  telefono: string
  detail: string
  reservationId: string
}) {
  const subject = type === 'reserva_cabana'
    ? `🏡 Nueva reserva cabaña — ${nombre}`
    : `🎉 Nueva cotización salón — ${nombre}`

  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject,
    html: `
<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#265a4c;margin-bottom:16px">${subject}</h2>
  <p><strong>Cliente:</strong> ${nombre}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Teléfono:</strong> ${telefono}</p>
  <hr style="border:none;border-top:1px solid #e8d9c0;margin:16px 0">
  <pre style="background:#f8f7f6;padding:12px;border-radius:6px;font-size:13px;white-space:pre-wrap">${detail}</pre>
  <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background:#265a4c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">Ver en panel admin →</a></p>
</div>
    `,
  })
}

export async function sendSalonQuoteConfirmation({
  to,
  nombre,
  fechaEvento,
  tipoEvento,
  numInvitados,
  montoEstimado,
  quoteId,
}: {
  to: string
  nombre: string
  fechaEvento: string
  tipoEvento: string
  numInvitados: number
  montoEstimado: number
  quoteId: string
}) {
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const clp = (n: number) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

  await resend.emails.send({
    from: FROM,
    to,
    subject: `📋 Cotización recibida — Salón de Eventos Puerto Varas`,
    html: `
<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;background:#fff">
  <h2 style="color:#265a4c">Cotización recibida</h2>
  <p>Hola <strong>${nombre}</strong>, recibimos tu solicitud para el salón de eventos. Te contactaremos en menos de 24 horas para confirmar disponibilidad.</p>
  <div style="background:#f0f7f4;border-radius:8px;padding:16px;margin:20px 0">
    <p style="margin:4px 0"><strong>Fecha del evento:</strong> ${fmt(fechaEvento)}</p>
    <p style="margin:4px 0"><strong>Tipo:</strong> ${tipoEvento}</p>
    <p style="margin:4px 0"><strong>Invitados:</strong> ${numInvitados} personas</p>
    <p style="margin:4px 0"><strong>Estimado referencial:</strong> ${clp(montoEstimado)}</p>
  </div>
  <p style="font-size:13px;color:#60412c">¿Tienes preguntas? Escríbenos al +569 6588 0268</p>
  <p style="font-size:12px;color:#978c7e;margin-top:24px">N° cotización: ${quoteId.slice(0, 8).toUpperCase()}</p>
</div>
    `,
  })
}

export default resend
