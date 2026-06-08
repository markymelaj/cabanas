import { differenceInCalendarDays } from 'date-fns'

export const SALON_BASE_PRICE = 800_000
export const SALON_BANQUETERIA_PER_PAX = 12_000
export const ANTICIPO_PERCENT = 0.30 // 30% de anticipo

export interface PriceBreakdown {
  noches: number
  precioPorNoche: number
  subtotalNoches: number
  extraHuespedes: number
  limpieza: number
  ajuste: number
  total: number
  anticipo: number
  saldo: number
}

export function calcCabanaPrice(
  checkIn: Date,
  checkOut: Date,
  precioPorNoche: number,
  precioLimpieza: number,
  options: {
    guests?: number
    baseGuests?: number
    extraGuestFee?: number
    adjustment?: number
    anticipoPercent?: number
  } = {}
): PriceBreakdown {
  const noches = differenceInCalendarDays(checkOut, checkIn)
  const subtotalNoches = noches * precioPorNoche
  const guests = Math.max(0, Number(options.guests ?? 0))
  const baseGuests = Math.max(0, Number(options.baseGuests ?? guests))
  const extraGuestFee = Math.max(0, Number(options.extraGuestFee ?? 0))
  const extraGuests = Math.max(0, guests - baseGuests)
  const extraHuespedes = noches * extraGuests * extraGuestFee
  const ajuste = Number(options.adjustment ?? 0)
  const total = Math.max(0, subtotalNoches + extraHuespedes + precioLimpieza + ajuste)
  const anticipoRatio = Number(options.anticipoPercent ?? ANTICIPO_PERCENT)
  const anticipo = Math.round(total * anticipoRatio)
  return {
    noches,
    precioPorNoche,
    subtotalNoches,
    extraHuespedes,
    limpieza: precioLimpieza,
    ajuste,
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
