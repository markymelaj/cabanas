import { DEMO_CONFIG } from './demo-config'

const ADMIN_WA = process.env.WHATSAPP_ADMIN_NUMBER?.replace(/\D/g, '') || DEMO_CONFIG.whatsappNumber

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || DEMO_CONFIG.baseUrl
}

function fmtDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-CL')
}

function clp(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CL')}`
}

export function buildWhatsAppLink(message: string, phone?: string): string {
  const to = (phone || ADMIN_WA).replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${to}?text=${encoded}`
}

export function buildReservationRequestMessage({
  requestId,
  nombre,
  email,
  telefono,
  cabanaNombre,
  checkIn,
  checkOut,
  guests,
  noches,
  total,
  anticipo,
  savedToAdmin,
}: {
  requestId: string
  nombre: string
  email: string
  telefono: string
  cabanaNombre: string
  checkIn: string
  checkOut: string
  guests: number
  noches: number
  total: number
  anticipo: number
  savedToAdmin: boolean
}) {
  return [
    '*Nueva solicitud de reserva - Demo Alto Cauce*',
    '',
    `Solicitud: ${requestId.slice(0, 8).toUpperCase()}`,
    `Cliente: ${nombre}`,
    `Email: ${email}`,
    `Teléfono: ${telefono}`,
    '',
    `Cabaña: ${cabanaNombre}`,
    `Check-in: ${fmtDate(checkIn)}`,
    `Check-out: ${fmtDate(checkOut)}`,
    `Noches: ${noches}`,
    `Huéspedes: ${guests}`,
    `Total estimado: ${clp(total)}`,
    `Anticipo sugerido: ${clp(anticipo)}`,
    '',
    `Admin: ${savedToAdmin ? 'guardada en panel' : 'pendiente de revisar/guardar'}`,
    `Panel: ${baseUrl()}/admin/reservas`,
  ].join('\n')
}

export function buildSalonQuoteRequestMessage({
  quoteId,
  nombre,
  email,
  telefono,
  fechaEvento,
  tipoEvento,
  numInvitados,
  horario,
  servicios,
  monto,
  mensaje,
  savedToAdmin,
}: {
  quoteId: string
  nombre: string
  email: string
  telefono: string
  fechaEvento: string
  tipoEvento: string
  numInvitados: number
  horario: string
  servicios: string[]
  monto: number
  mensaje?: string | null
  savedToAdmin: boolean
}) {
  return [
    '*Nueva cotización de evento - Demo Alto Cauce*',
    '',
    `Solicitud: ${quoteId.slice(0, 8).toUpperCase()}`,
    `Cliente: ${nombre}`,
    `Email: ${email}`,
    `Teléfono: ${telefono}`,
    '',
    `Fecha evento: ${fmtDate(fechaEvento)}`,
    `Tipo evento: ${tipoEvento}`,
    `Invitados: ${numInvitados}`,
    `Horario: ${horario}`,
    `Servicios: ${servicios.length ? servicios.join(', ') : 'sin adicionales'}`,
    `Estimado: ${clp(monto)}`,
    mensaje ? `Mensaje: ${mensaje}` : 'Mensaje: sin mensaje adicional',
    '',
    `Admin: ${savedToAdmin ? 'guardada en panel' : 'pendiente de revisar/guardar'}`,
    `Panel: ${baseUrl()}/admin/salon`,
  ].join('\n')
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
  return [
    '*Nueva reserva confirmada*',
    '',
    `Cliente: ${nombre} (${telefono})`,
    `Cabaña: ${cabanaNombre}`,
    `Check-in: ${fmtDate(checkIn)}`,
    `Check-out: ${fmtDate(checkOut)}`,
    `Huéspedes: ${guests}`,
    `Total: ${clp(total)}`,
    '',
    `Ver en panel: ${baseUrl()}/admin`,
  ].join('\n')
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
  return [
    '*Nueva cotización de salón*',
    '',
    `Cliente: ${nombre} (${telefono})`,
    `Fecha: ${fmtDate(fechaEvento)}`,
    `Tipo: ${tipoEvento}`,
    `Invitados: ${numInvitados}`,
    `Estimado: ${clp(monto)}`,
    '',
    `Ver en panel: ${baseUrl()}/admin/salon`,
  ].join('\n')
}
