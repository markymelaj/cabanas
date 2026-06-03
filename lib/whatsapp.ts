// Notificaciones WhatsApp al dueño vía deep link o Twilio
// Por defecto usa deep link (gratis, abre WhatsApp Web/app)
// Para producción con envío automático: descomentar sección Twilio

const ADMIN_WA = process.env.WHATSAPP_ADMIN_NUMBER?.replace(/\D/g, '') || ''

export function buildWhatsAppLink(message: string, phone?: string): string {
  const to = (phone || ADMIN_WA).replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${to}?text=${encoded}`
}

export function buildReservationMessage({
  nombre,
  cabanaNombre,
  checkIn,
  checkOut,
  guests,
  total,
  telefono,
}: {
  nombre: string
  cabanaNombre: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  telefono: string
}): string {
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-CL')
  const clp = (n: number) => `$${n.toLocaleString('es-CL')}`
  return `🏡 *Nueva reserva confirmada*\n\n` +
    `👤 Cliente: ${nombre} (${telefono})\n` +
    `🏠 Cabaña: ${cabanaNombre}\n` +
    `📅 Check-in: ${fmt(checkIn)}\n` +
    `📅 Check-out: ${fmt(checkOut)}\n` +
    `👥 Huéspedes: ${guests}\n` +
    `💰 Total: ${clp(total)}\n\n` +
    `Ver en panel: ${process.env.NEXT_PUBLIC_BASE_URL}/admin`
}

export function buildQuoteMessage({
  nombre,
  telefono,
  fechaEvento,
  tipoEvento,
  numInvitados,
  monto,
}: {
  nombre: string
  telefono: string
  fechaEvento: string
  tipoEvento: string
  numInvitados: number
  monto: number
}): string {
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-CL')
  const clp = (n: number) => `$${n.toLocaleString('es-CL')}`
  return `🎉 *Nueva cotización salón*\n\n` +
    `👤 Cliente: ${nombre} (${telefono})\n` +
    `📅 Fecha: ${fmt(fechaEvento)}\n` +
    `🎊 Tipo: ${tipoEvento}\n` +
    `👥 Invitados: ${numInvitados}\n` +
    `💰 Estimado: ${clp(monto)}\n\n` +
    `Ver en panel: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/salon`
}

// Twilio (descomentar para envío automático en producción)
/*
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendWhatsAppMessage(to: string, message: string) {
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
  await twilioClient.messages.create({
    from,
    to: `whatsapp:+56${to.replace(/\D/g, '')}`,
    body: message,
  })
}
*/
