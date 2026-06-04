// Tipos de la base de datos
export type Cabana = {
  id: string
  slug: string
  nombre: string
  capacidad: number
  precio_noche: number
  precio_limpieza: number
  descripcion: string | null
  descripcion_corta: string | null
  amenidades: string[]
  fotos: string[]
  activa: boolean
  orden: number
}

export type Reservation = {
  id: string
  tipo: 'cabana' | 'salon'
  cabana_id: string | null
  client_id: string | null
  check_in: string
  check_out: string
  guests: number
  noches: number
  precio_noche: number | null
  precio_limpieza: number | null
  total_amount: number
  anticipo_monto: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
  payment_status: 'pending' | 'approved' | 'rejected' | 'refunded'
  payment_id: string | null
  payment_url: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export type SalonQuote = {
  id: string
  client_id: string | null
  fecha_evento: string
  tipo_evento: string
  num_invitados: number
  horario: string
  servicios: string[]
  monto_estimado: number | null
  mensaje: string | null
  status: 'nueva' | 'contactada' | 'confirmada' | 'rechazada'
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  origen: string
  created_at: string
}

export type ReservationFull = Reservation & {
  client_nombre: string
  client_email: string
  client_telefono: string | null
  cabana_nombre: string | null
  cabana_slug: string | null
}
