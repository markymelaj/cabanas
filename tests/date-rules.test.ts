import { describe, expect, it } from 'vitest'
import { hasOccupiedNight, nightsBetween, stayNights } from '@/lib/date-rules'
import { format } from 'date-fns'

describe('reglas de estadía', () => {
  it('calcula noches con check-out exclusivo', () => {
    expect(nightsBetween('2026-07-12', '2026-07-15')).toBe(3)
  })

  it('permite salir el mismo día en que comienza otra reserva', () => {
    const occupied = new Set(['2026-07-15', '2026-07-16'])
    const checkIn = new Date('2026-07-12T12:00:00')
    const checkOut = new Date('2026-07-15T12:00:00')
    expect(hasOccupiedNight(checkIn, checkOut, occupied)).toBe(false)
  })

  it('detecta una noche ocupada dentro del rango', () => {
    const occupied = new Set(['2026-07-14'])
    const checkIn = new Date('2026-07-12T12:00:00')
    const checkOut = new Date('2026-07-15T12:00:00')
    expect(hasOccupiedNight(checkIn, checkOut, occupied)).toBe(true)
  })

  it('no incluye el check-out en las noches', () => {
    const days = stayNights(new Date('2026-07-12T12:00:00'), new Date('2026-07-15T12:00:00'))
    expect(days.map((d) => format(d, 'yyyy-MM-dd'))).toEqual(['2026-07-12', '2026-07-13', '2026-07-14'])
  })
})
