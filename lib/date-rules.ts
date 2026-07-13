import { addDays, differenceInCalendarDays, eachDayOfInterval, format, isValid, parseISO, subDays } from 'date-fns'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isISODate(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const parsed = parseISO(value)
  return isValid(parsed) && format(parsed, 'yyyy-MM-dd') === value
}

export function todayInChile(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  return differenceInCalendarDays(end, start)
}

export function stayNights(checkIn: Date, checkOut: Date): Date[] {
  if (differenceInCalendarDays(checkOut, checkIn) <= 0) return []
  return eachDayOfInterval({ start: checkIn, end: subDays(checkOut, 1) })
}

export function hasOccupiedNight(checkIn: Date, checkOut: Date, occupied: Set<string>): boolean {
  return stayNights(checkIn, checkOut).some((date) => occupied.has(format(date, 'yyyy-MM-dd')))
}

export function earliestCheckout(checkIn: Date, minNights: number): Date {
  return addDays(checkIn, Math.max(1, minNights))
}
