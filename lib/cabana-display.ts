import type { Cabana } from './supabase'

const GENERIC_CABIN_PHOTOS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
]

const FAMILY_CABIN_PHOTOS = [
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
]

export function polishCabanaText(value: unknown) {
  return String(value ?? '')
    .replace(/\bCabanas\b/g, 'Cabañas')
    .replace(/\bcabanas\b/g, 'cabañas')
    .replace(/\bCabana\b/g, 'Cabaña')
    .replace(/\bcabana\b/g, 'cabaña')
    .replace(/\bbanos\b/g, 'baños')
    .replace(/\bbano\b/g, 'baño')
    .replace(/\bhabitaciones\b/g, 'habitaciones')
    .replace(/\bhabitacion\b/g, 'habitación')
    .replace(/\bpequenas\b/g, 'pequeñas')
    .replace(/\bmanana\b/g, 'mañana')
    .replace(/\bvolcan\b/g, 'volcán')
    .replace(/\barmonia\b/g, 'armonía')
    .replace(/\bLavanderia\b/g, 'Lavandería')
}

export function displayCabana(cabana: Cabana) {
  return {
    ...cabana,
    nombre: polishCabanaText(cabana.nombre),
    subtitulo: cabana.subtitulo ? polishCabanaText(cabana.subtitulo) : cabana.subtitulo,
    camas: cabana.camas ? polishCabanaText(cabana.camas) : cabana.camas,
    descripcion: cabana.descripcion ? polishCabanaText(cabana.descripcion) : cabana.descripcion,
    descripcion_corta: cabana.descripcion_corta ? polishCabanaText(cabana.descripcion_corta) : cabana.descripcion_corta,
    amenidades: (cabana.amenidades ?? []).map(polishCabanaText),
  }
}

export function cabanaPhotos(cabana: Cabana) {
  const current = (cabana.fotos ?? []).filter(Boolean)
  if (current.length > 0) return current.slice(0, 3)

  const slug = cabana.slug || ''
  const name = String(cabana.nombre || '').toLowerCase()
  return slug.includes('6') || name.includes('6 personas')
    ? FAMILY_CABIN_PHOTOS
    : GENERIC_CABIN_PHOTOS
}
