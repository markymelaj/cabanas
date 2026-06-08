import type { Cabana } from './supabase'

export const DEFAULT_CABANAS: Cabana[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'cabana-2-4',
    nombre: 'Cabana para 2 y 4 personas',
    subtitulo: 'Ideal para parejas o familias pequenas',
    capacidad: 4,
    dormitorios: 2,
    banos: 1,
    camas: '2 camas',
    base_huespedes: 2,
    precio_huesped_extra: 0,
    min_noches: 1,
    precio_noche: 85000,
    precio_limpieza: 15000,
    descripcion_corta: 'Acogedora cabana con vista al lago Llanquihue y los volcanes.',
    descripcion:
      'Perfecta para parejas o familias pequenas. Vista panoramica al volcan Osorno y el lago Llanquihue desde la terraza.',
    amenidades: [
      '1 habitacion doble',
      '1 habitacion con cama 2 plazas',
      '1 bano completo',
      'Cocina equipada',
      'Terraza con parrilla',
      'Estacionamiento',
      'WiFi',
      'Ropa de cama incluida',
    ],
    fotos: [
      'https://cabanaspuertovaras.cl/wp-content/uploads/2025/12/Cabanas-para-2-y-4-scaled.jpeg',
      'https://cabanaspuertovaras.cl/wp-content/uploads/2025/12/Cabana-para-6-scaled.jpeg',
      'https://cabanaspuertovaras.cl/wp-content/uploads/2021/06/Cabanas-Puerto-Varas-1.jpg',
    ],
    activa: true,
    orden: 1,
    destacada: true,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'cabana-6',
    nombre: 'Cabana para 6 personas',
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
    descripcion_corta: 'Amplia cabana con suite, ideal para familias o grupos de amigos.',
    descripcion:
      'Espacio, confort y naturaleza en armonia. Ideal para grupos que buscan disfrutar juntos sin renunciar a la privacidad.',
    amenidades: [
      '1 suite con bano privado',
      '2 habitaciones dobles',
      '2 banos',
      'Living y comedor',
      'Cocina completamente equipada',
      'Terraza con parrilla',
      'Estacionamiento doble',
      'WiFi',
      'Lavanderia',
      'Ropa de cama incluida',
    ],
    fotos: [
      'https://cabanaspuertovaras.cl/wp-content/uploads/2025/12/Cabana-para-6-scaled.jpeg',
      'https://cabanaspuertovaras.cl/wp-content/uploads/2025/12/Cabanas-para-2-y-4-scaled.jpeg',
      'https://cabanaspuertovaras.cl/wp-content/uploads/2021/06/Cabanas-Puerto-Varas-2.jpg',
    ],
    activa: true,
    orden: 2,
    destacada: false,
  },
]

export function getDefaultCabanaByIdOrSlug(value: string) {
  return DEFAULT_CABANAS.find((cabana) => cabana.id === value || cabana.slug === value) ?? null
}
