// Tipos de la base de datos
export type Cabana = {
  id: string
  slug: string
  nombre: string
  subtitulo?: string | null
  capacidad: number
  dormitorios?: number | null
  banos?: number | null
  camas?: string | null
  metros_cuadrados?: number | null
  base_huespedes?: number | null
  precio_huesped_extra?: number | null
  min_noches?: number | null
  check_in_hora?: string | null
  check_out_hora?: string | null
  precio_noche: number
  precio_limpieza: number
  descripcion: string | null
  descripcion_corta: string | null
  amenidades: string[]
  fotos: string[]
  activa: boolean
  orden: number
  destacada?: boolean | null
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
  subtotal_amount?: number | null
  adjustment_amount?: number | null
  adjustment_note?: string | null
  total_amount: number
  anticipo_monto: number | null
  paid_amount?: number | null
  balance_amount?: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
    | 'standby' | 'checked_in' | 'checked_out' | 'completed'
  payment_status: 'pending' | 'approved' | 'rejected' | 'refunded'
  payment_id: string | null
  payment_url: string | null
  notas: string | null
  internal_notes?: string | null
  checkin_token?: string | null
  checkin_status?: string | null
  checkin_submitted_at?: string | null
  checked_in_at?: string | null
  checked_out_at?: string | null
  guest_details?: any
  arrival_time?: string | null
  vehicle_plate?: string | null
  source?: string | null
  hold_alert?: boolean | null
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
  subtotal_amount?: number | null
  adjustment_amount?: number | null
  total_amount?: number | null
  paid_amount?: number | null
  balance_amount?: number | null
  mensaje: string | null
  status: 'nueva' | 'contactada' | 'cotizada' | 'reservada' | 'confirmada'
    | 'pagada' | 'realizada' | 'rechazada' | 'cancelada'
  notas_admin: string | null
  internal_notes?: string | null
  source?: string | null
  hold_alert?: boolean | null
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  documento?: string | null
  direccion?: string | null
  notas?: string | null
  origen: string
  created_at: string
}

export type ReservationFull = Reservation & {
  client_nombre: string
  client_email: string
  client_telefono: string | null
  client_documento?: string | null
  client_direccion?: string | null
  cabana_nombre: string | null
  cabana_slug: string | null
  cabana_fotos?: string[] | null
}
