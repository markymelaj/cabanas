export const DEMO_CONFIG = {
  brandName: 'Alto Cauce Reservas',
  brandAccent: 'Producto para alojamientos',
  productName: 'Sistema de reservas para cabañas',
  businessType: 'Cabañas · Hospedaje · Complejos turísticos',
  phoneDisplay: '+56 9 5784 5292',
  phoneHref: '+56957845292',
  whatsappNumber: '56957845292',
  email: 'contacto@altocauce.cl',
  locationShort: 'Demo adaptable para alojamientos turísticos',
  locationLong: 'Implementable para cabañas, lodge, hosterías, parcelas turísticas, tinajas, camping o complejos mixtos.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://cabanas-theta.vercel.app',
  heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  cabanaImage: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=85',
  salonImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85',
  mapsUrl: 'https://altocauce.cl',
}

export const DEMO_MODES = [
  {
    title: 'Producto base: cabañas',
    description: 'Reserva por fechas, cálculo de noches, anticipo sugerido, disponibilidad, WhatsApp ordenado y panel de seguimiento.',
  },
  {
    title: 'Módulo opcional: salón',
    description: 'Cotizador para eventos, servicios adicionales, monto estimado y seguimiento comercial desde el mismo panel.',
  },
  {
    title: 'Implementación a medida',
    description: 'Adaptación visual, carga inicial, dominio, capacitación y reglas propias de cada negocio.',
  },
]

export const SALES_PLANS = [
  {
    name: 'Reservas Base',
    price: '$490.000 CLP',
    detail: 'Sitio + flujo de reservas + WhatsApp ordenado + panel básico para cabañas.',
    badge: 'Para partir rápido',
  },
  {
    name: 'Reservas Pro',
    price: '$790.000 CLP',
    detail: 'Panel completo, disponibilidad, estados, pagos, notas, correos y capacitación.',
    badge: 'Más vendible',
  },
  {
    name: 'Módulo Salón',
    price: '+ desde $290.000 CLP',
    detail: 'Cotizador de eventos, servicios, seguimiento comercial y control de fechas opcional.',
    badge: 'Opcional',
  },
]
