import type { Cabana } from './supabase'

export const DEFAULT_CABANAS: Cabana[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'cabana-2-4',
    nombre: 'Cabaña para 2 y 4 personas',
    subtitulo: 'Ideal para parejas o familias pequeñas',
    capacidad: 4,
    dormitorios: 2,
    banos: 1,
    camas: '2 camas',
    base_huespedes: 2,
    precio_huesped_extra: 0,
    min_noches: 1,
    precio_noche: 85000,
    precio_limpieza: 15000,
    descripcion_corta: 'Acogedora cabaña con vista al lago Llanquihue y los volcanes.',
    descripcion:
      'Perfecta para parejas o familias pequeñas. Vista panorámica al volcán Osorno y el lago Llanquihue desde la terraza.',
    amenidades: [
      '1 habitación doble',
      '1 habitación con cama 2 plazas',
      '1 baño completo',
      'Cocina equipada',
      'Terraza con parrilla',
      'Estacionamiento',
      'WiFi',
      'Ropa de cama incluida',
    ],
    fotos: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ],
    activa: true,
    orden: 1,
    destacada: true,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'cabana-6',
    nombre: 'Cabaña para 6 personas',
    subtitulo: 'Amplia, familiar y con espacios independientes',
    capacidad: 6,
    dormitorios: 3,
    banos: 2,
    camas: 'Suite y dormitorios dobles',
    base_huespedes: 6,
    precio_huesped_extra: 0,
    min_noches: 1,
    precio_noche: 120000,
    precio_limpieza: 20000,
    descripcion_corta: 'Amplia cabaña con suite, ideal para familias o grupos de amigos.',
    descripcion:
      'Espacio, confort y naturaleza en armonía. Ideal para grupos que buscan disfrutar juntos sin renunciar a la privacidad.',
    amenidades: [
      '1 suite con baño privado',
      '2 habitaciones dobles',
      '2 baños',
      'Living y comedor',
      'Cocina completamente equipada',
      'Terraza con parrilla',
      'Estacionamiento doble',
      'WiFi',
      'Lavanderia',
      'Ropa de cama incluida',
    ],
    fotos: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
    activa: true,
    orden: 2,
    destacada: false,
  },
]

export function getDefaultCabanaByIdOrSlug(value: string) {
  return DEFAULT_CABANAS.find((cabana) => cabana.id === value || cabana.slug === value) ?? null
}
