import { z } from 'zod'
import { isISODate } from '@/lib/date-rules'

const isoDate = z.string().refine(isISODate, 'Fecha inválida')
const cleanText = (min: number, max: number) => z.string().trim().min(min).max(max)
const email = z.string().trim().toLowerCase().email().max(160)
const phone = z.string().trim().min(8).max(30)

export const reservationRequestSchema = z.object({
  cabanaId: z.string().trim().min(1).max(100),
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1).max(30),
  client: z.object({
    nombre: cleanText(2, 100),
    email,
    telefono: phone,
  }),
  website: z.string().max(0).optional().default(''),
  submittedAt: z.coerce.number().int().positive().optional(),
}).strict()

export const salonQuoteRequestSchema = z.object({
  nombre: cleanText(2, 100),
  email,
  telefono: phone,
  fechaEvento: isoDate,
  tipoEvento: cleanText(2, 80),
  numInvitados: z.coerce.number().int().min(1).max(1000),
  horario: z.enum(['completo', 'medio']).default('completo'),
  servicios: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  mensaje: z.string().trim().max(1200).optional().default(''),
  website: z.string().max(0).optional().default(''),
  submittedAt: z.coerce.number().int().positive().optional(),
}).strict()

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('56')) return `+${digits}`
  if (digits.startsWith('9') && digits.length === 9) return `+56${digits}`
  return value.trim()
}

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Revisa los datos ingresados.'
}
