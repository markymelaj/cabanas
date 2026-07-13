export const DEMO_CONFIG = {
  brandName: 'Alto Cauce Reservas',
  brandAccent: 'Reservas para alojamientos',
  productName: 'Sistema de reservas para cabañas',
  businessType: 'Cabañas · Lodge · Complejos turísticos',
  phoneDisplay: '+56 9 5784 5292',
  phoneHref: '+56957845292',
  whatsappNumber: '56957845292',
  email: 'contacto@altocauce.cl',
  locationShort: 'Salto del Laja y alrededores · Región del Biobío',
  locationLong: 'Pensado para cabañas, lodge, hosterías, parcelas turísticas, tinajas y camping del Salto del Laja, Laja, Los Ángeles, Yumbel, Cabrero y alrededores.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://cabanas-theta.vercel.app',
  heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  cabanaImage: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=85',
  salonImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85',
  mapsUrl: 'https://altocauce.cl',
}

export const DEMO_MODES = [
  {
    title: 'Reservas de alojamiento',
    description: 'Consulta por fechas, cálculo de noches, disponibilidad, WhatsApp ordenado y panel de seguimiento.',
  },
  {
    title: 'Eventos y celebraciones',
    description: 'Cotizador para salón o restaurante, servicios adicionales, monto estimado y seguimiento comercial desde el mismo panel.',
  },
  {
    title: 'Implementación personalizada',
    description: 'Adaptación visual, carga inicial, dominio, capacitación y reglas propias de cada negocio.',
  },
]

export const SALES_PLANS = [
  {
    name: 'Reservas Base',
    price: '$490.000 CLP',
    detail: 'Sitio de presentación, flujo de consulta por fechas, WhatsApp ordenado y panel básico para cabañas.',
    badge: 'Incluido en la base',
  },
  {
    name: 'Reservas Pro',
    price: '$790.000 CLP',
    detail: 'Panel completo: disponibilidad, estados, pagos, notas internas, correos y capacitación de uso.',
    badge: 'Recomendado',
  },
  {
    name: 'Salón / Restaurante',
    price: '+ desde $290.000 CLP',
    detail: 'Módulo opcional. Cotizador de eventos, servicios adicionales, valor estimado y control de fechas. Se contrata solo si el negocio lo necesita.',
    badge: 'Módulo opcional',
  },
]
