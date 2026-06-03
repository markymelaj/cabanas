import { differenceInCalendarDays } from 'date-fns'

export const SALON_BASE_PRICE = 800_000
export const SALON_BANQUETERIA_PER_PAX = 12_000
export const ANTICIPO_PERCENT = 0.30 // 30% de anticipo

export interface PriceBreakdown {
  noches: number
  precioPorNoche: number
  subtotalNoches: number
  limpieza: number
  total: number
  anticipo: number
  saldo: number
}

export function calcCabanaPrice(
  checkIn: Date,
  checkOut: Date,
  precioPorNoche: number,
  precioLimpieza: number
): PriceBreakdown {
  const noches = differenceInCalendarDays(checkOut, checkIn)
  const subtotalNoches = noches * precioPorNoche
  const total = subtotalNoches + precioLimpieza
  const anticipo = Math.round(total * ANTICIPO_PERCENT)
  return {
    noches,
    precioPorNoche,
    subtotalNoches,
    limpieza: precioLimpieza,
    total,
    anticipo,
    saldo: total - anticipo,
  }
}

export interface SalonPriceBreakdown {
  arriendoSalon: number
  banqueteria: number
  total: number
  porPersona: number
}

export function calcSalonPrice(
  numInvitados: number,
  servicios: string[],
  horario: string
): SalonPriceBreakdown {
  const multiplier = horario === 'completo' ? 1 : 0.65
  const arriendoSalon = Math.round(SALON_BASE_PRICE * multiplier)
  const banqueteria = servicios.includes('banqueteria')
    ? numInvitados * SALON_BANQUETERIA_PER_PAX
    : 0
  const total = arriendoSalon + banqueteria
  return {
    arriendoSalon,
    banqueteria,
    total,
    porPersona: Math.round(total / numInvitados),
  }
}

export function formatCLP(amount: number): string {
  return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}
