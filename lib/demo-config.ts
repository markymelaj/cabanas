export const DEMO_CONFIG = {
  brandName: 'Alto Cauce Reservas',
  brandAccent: 'Reservas para alojamientos',
  productName: 'Sistema de reservas para cabañas',
  businessType: 'Cabañas · Lodge · Complejos turísticos',
  phoneDisplay: '+56 9 5784 5292',
  phoneHref: '+56957845292',
  whatsappNumber: '56957845292',
  email: 'contacto@altocauce.cl',
  locationShort: 'Sur de Chile · Implementación personalizada',
  locationLong: 'Soluciones digitales para cabañas, lodge, hosterías, parcelas turísticas, tinajas y camping del sur de Chile.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://cabanas-theta.vercel.app',
  heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88',
  cabanaImage: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=86',
  salonImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=86',
  mapsUrl: 'https://altocauce.cl',
}

export const DEMO_LODGING = {
  name: 'Refugios del Salto',
  tagline: 'Bosque, descanso y agua a minutos del Salto del Laja',
  location: 'Salto del Laja · Región del Biobío',
  phoneDisplay: '+56 9 5784 5292',
  phoneHref: '+56957845292',
  whatsappNumber: '56957845292',
  email: 'reservas@refugiosdelsalto.cl',
  heroImage: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1800&q=88',
  salonImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=88',
}

export const SALES_PLANS = [
  {
    name: 'Reservas Base',
    price: '$490.000 CLP',
    detail: 'Sitio de presentación, disponibilidad, consulta ordenada y panel para operar reservas.',
    badge: 'Para comenzar',
  },
  {
    name: 'Reservas Pro',
    price: '$790.000 CLP',
    detail: 'Operación completa: pagos, saldos, estados, notas, check-in, correos y capacitación.',
    badge: 'Recomendado',
  },
  {
    name: 'Eventos',
    price: '+ desde $290.000 CLP',
    detail: 'Cotizador de celebraciones, servicios configurables, fechas y seguimiento comercial.',
    badge: 'Módulo opcional',
  },
]
