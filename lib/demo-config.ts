export const DEMO_CONFIG = {
  brandName: 'Alto Cauce Reservas',
  brandAccent: 'Demo Comercial',
  productName: 'Sistema de reservas para cabañas y eventos',
  businessType: 'Cabañas · Salón de eventos · Complejo mixto',
  phoneDisplay: '+56 9 5784 5292',
  phoneHref: '+56957845292',
  whatsappNumber: '56957845292',
  email: 'contacto@altocauce.cl',
  locationShort: 'Demo adaptable para turismo y eventos',
  locationLong: 'Implementable para cabañas, salones de eventos, parcelas, camping, lodge o complejos turísticos.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://cabanas-theta.vercel.app',
  heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  salonImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85',
  mapsUrl: 'https://altocauce.cl',
}

export const DEMO_MODES = [
  {
    title: 'Cabañas y hospedaje',
    description: 'Reservas por fecha, cálculo de noches, anticipo sugerido, disponibilidad, pagos y check-in.',
  },
  {
    title: 'Salón de eventos',
    description: 'Cotización por tipo de evento, invitados, jornada, servicios adicionales y seguimiento comercial.',
  },
  {
    title: 'Complejo mixto',
    description: 'Un solo panel para manejar cabañas, salón, bloqueos, pagos, consultas y decisiones operativas.',
  },
]

export const SALES_PLANS = [
  { name: 'Base Reserva', price: '$490.000 CLP', detail: 'Web + reservas/cotización + WhatsApp ordenado + panel básico.' },
  { name: 'Plan Pro', price: '$790.000 CLP', detail: 'Panel completo, disponibilidad, pagos, estados, correos y personalización avanzada.' },
  { name: 'Integral', price: '$1.190.000 CLP', detail: 'Cabañas + salón/eventos + operaciones + IA + capacitación y puesta en marcha.' },
]
