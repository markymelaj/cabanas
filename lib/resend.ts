import { Resend } from 'resend'
import { DEMO_CONFIG } from './demo-config'

let resendClient: Resend | null = null
const FROM = process.env.RESEND_FROM || DEMO_CONFIG.email
const ADMIN = process.env.RESEND_ADMIN_EMAIL || DEMO_CONFIG.email

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

function escapeHtml(value: string) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function clp(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
}

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
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Reserva recibida — ${cabanaNombre}`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;color:#1b3b32">
  <div style="background:#265a4c;padding:28px;text-align:center;color:#fff">
    <h1 style="margin:0;font-size:22px">${escapeHtml(DEMO_CONFIG.brandName)}</h1>
    <p style="margin:8px 0 0;color:#d9bf98">Solicitud de reserva recibida</p>
  </div>
  <div style="padding:28px">
    <p>Hola <strong>${escapeHtml(nombre)}</strong>, recibimos tu solicitud. El equipo confirmará disponibilidad y condiciones por WhatsApp o correo.</p>
    <p><strong>Cabaña:</strong> ${escapeHtml(cabanaNombre)}</p>
    <p><strong>Llegada:</strong> ${fmt(checkIn)}</p>
    <p><strong>Salida:</strong> ${fmt(checkOut)}</p>
    <p><strong>Huéspedes:</strong> ${guests}</p>
    <p><strong>Total estimado:</strong> ${clp(total)}</p>
    <p><strong>Anticipo sugerido:</strong> ${clp(anticipo)}</p>
    <p style="font-size:12px;color:#746a5f;margin-top:24px">Solicitud: ${reservationId.slice(0, 8).toUpperCase()} · ${escapeHtml(DEMO_CONFIG.brandName)}</p>
  </div>
</div>
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
    ? `Nueva reserva cabaña — ${nombre}`
    : `Nueva cotización salón — ${nombre}`

  await getResend().emails.send({
    from: FROM,
    to: ADMIN,
    subject,
    html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
  <h2 style="color:#265a4c;margin-bottom:16px">${escapeHtml(subject)}</h2>
  <p><strong>Cliente:</strong> ${escapeHtml(nombre)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
  <hr style="border:none;border-top:1px solid #e8d9c0;margin:16px 0">
  <pre style="background:#f8f7f6;padding:12px;border-radius:6px;font-size:13px;white-space:pre-wrap">${escapeHtml(detail)}</pre>
  <p style="font-size:12px;color:#746a5f">Referencia: ${reservationId.slice(0, 8).toUpperCase()}</p>
  <p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_BASE_URL || DEMO_CONFIG.baseUrl}/admin" style="background:#265a4c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">Ver en panel admin →</a></p>
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
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Cotización recibida — Salón de eventos',
    html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;color:#1b3b32">
  <h2 style="color:#265a4c">Cotización recibida</h2>
  <p>Hola <strong>${escapeHtml(nombre)}</strong>, recibimos tu solicitud para el salón de eventos. Te contactaremos para revisar disponibilidad, servicios y condiciones.</p>
  <div style="background:#f0f7f4;border-radius:8px;padding:16px;margin:20px 0">
    <p><strong>Fecha del evento:</strong> ${fmt(fechaEvento)}</p>
    <p><strong>Tipo:</strong> ${escapeHtml(tipoEvento)}</p>
    <p><strong>Invitados:</strong> ${numInvitados} personas</p>
    <p><strong>Estimado referencial:</strong> ${clp(montoEstimado)}</p>
  </div>
  <p style="font-size:13px;color:#60412c">Contacto comercial: ${escapeHtml(DEMO_CONFIG.phoneDisplay)}</p>
  <p style="font-size:12px;color:#978c7e;margin-top:24px">N° cotización: ${quoteId.slice(0, 8).toUpperCase()}</p>
</div>
    `,
  })
}

export default getResend
