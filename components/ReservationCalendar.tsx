'use client'
import { useState, useMemo } from 'react'
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, startOfDay, getDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { calcCabanaPrice, formatCLP } from '@/lib/pricing'
import type { Cabana } from '@/lib/supabase'

interface Props {
  cabana: Cabana
  occupiedDates: string[]
}

type Step = 'calendar' | 'form' | 'paying'

export default function ReservationCalendar({ cabana, occupiedDates }: Props) {
  const [step, setStep] = useState<Step>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [selectingCheckOut, setSelectingCheckOut] = useState(false)
  const [guests, setGuests] = useState(2)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })

  const occupied = useMemo(() => new Set(occupiedDates), [occupiedDates])

  const today = startOfDay(new Date())

  function isOccupied(date: Date) {
    return occupied.has(format(date, 'yyyy-MM-dd'))
  }

  function isDisabled(date: Date) {
    return isBefore(date, today) || isOccupied(date)
  }

  function isInRange(date: Date) {
    if (!checkIn || !checkOut) return false
    return isAfter(date, checkIn) && isBefore(date, checkOut)
  }

  function handleDayClick(date: Date) {
    if (isDisabled(date)) return
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date)
      setCheckOut(null)
      setSelectingCheckOut(true)
    } else if (selectingCheckOut) {
      if (isBefore(date, checkIn) || isSameDay(date, checkIn)) {
        setCheckIn(date)
        return
      }
      // Verificar que no haya fechas ocupadas en el rango
      const range = eachDayOfInterval({ start: checkIn, end: date })
      const hasConflict = range.some((d) => isOccupied(d))
      if (hasConflict) {
        setError('Hay fechas no disponibles en ese rango. Por favor elige otro perÃ­odo.')
        return
      }
      setError(null)
      setCheckOut(date)
      setSelectingCheckOut(false)
    }
  }

  const pricing = useMemo(() => {
    if (!checkIn || !checkOut) return null
    return calcCabanaPrice(checkIn, checkOut, cabana.precio_noche, cabana.precio_limpieza)
  }, [checkIn, checkOut, cabana])

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const firstDayOfWeek = useMemo(() => {
    const day = getDay(startOfMonth(currentMonth))
    return day === 0 ? 6 : day - 1 // lunes = 0
  }, [currentMonth])

  async function handleSubmit() {
    if (!checkIn || !checkOut || !pricing) return
    if (!form.nombre || !form.email || !form.telefono) {
      setError('Por favor completa todos los campos.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabanaId: cabana.id,
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(checkOut, 'yyyy-MM-dd'),
          guests,
          pricing,
          client: form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear reserva')
      setReservationId(data.reservationId)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const DAY_NAMES = ['Lun', 'Mar', 'MiÃ©', 'Jue', 'Vie', 'SÃ¡b', 'Dom']

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-10 text-center">
        <CheckCircle size={48} className="mx-auto text-lago-600 mb-4" />
        <h3 className="font-display text-3xl text-lago-900 mb-2">Solicitud recibida</h3>
        <p className="text-volcan-500 text-sm mb-6">
          Te contactaremos en menos de 24 horas para confirmar disponibilidad y pago.
        </p>
        {pricing && (
          <div className="bg-lago-50 rounded-xl p-5 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-volcan-500">Cabana</span><span>{cabana.nombre}</span></div>
            <div className="flex justify-between"><span className="text-volcan-500">Total estimado</span><span>{formatCLP(pricing.total)}</span></div>
            <div className="flex justify-between"><span className="text-volcan-500">Anticipo sugerido</span><span>{formatCLP(pricing.anticipo)}</span></div>
            {reservationId && <p className="text-xs text-volcan-400">Solicitud: {reservationId.slice(0, 8).toUpperCase()}</p>}
          </div>
        )}
        <a href="/cabanas" className="btn-outline text-sm">Volver a cabanas</a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Steps header */}
      <div className="flex border-b border-arena-100">
        {(['calendar', 'form'] as Step[]).map((s, i) => (
          <div key={s} className={`flex-1 py-4 px-5 text-sm font-medium border-b-2 transition-colors ${step === s || (step === 'paying' && i === 1) ? 'border-lago-600 text-lago-800' : 'border-transparent text-volcÃ¡n-400'}`}>
            <span className="mr-2 text-xs text-volcÃ¡n-400">{i + 1}.</span>
            {s === 'calendar' ? 'Elige fechas' : 'Tus datos'}
          </div>
        ))}
      </div>

      {step === 'calendar' && (
        <div className="p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))} className="p-2 rounded-lg hover:bg-arena-100 disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="font-display text-xl text-lago-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-arena-100 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-volcÃ¡n-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((date) => {
              const isCI = checkIn && isSameDay(date, checkIn)
              const isCO = checkOut && isSameDay(date, checkOut)
              const inRange = isInRange(date)
              const disabled = isDisabled(date)
              const occ = isOccupied(date)

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  disabled={disabled}
                  className={`
                    relative h-10 text-sm rounded-lg transition-all
                    ${isCI || isCO ? 'bg-lago-700 text-white font-medium' : ''}
                    ${inRange ? 'bg-lago-100 text-lago-800 rounded-none' : ''}
                    ${!isCI && !isCO && !inRange && !disabled ? 'hover:bg-arena-100 text-lago-900' : ''}
                    ${disabled && !occ ? 'text-volcÃ¡n-200 cursor-not-allowed' : ''}
                    ${occ ? 'text-volcÃ¡n-300 cursor-not-allowed line-through' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-xs text-volcÃ¡n-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-lago-700 inline-block" />Seleccionado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-lago-100 inline-block" />Tu estadÃ­a</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-volcÃ¡n-100 inline-block" />No disponible</span>
          </div>

          {/* Guests */}
          <div className="mt-6 pt-5 border-t border-arena-100">
            <label className="label-text">NÃºmero de huÃ©spedes</label>
            <div className="flex items-center gap-4 mt-1">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-full border border-volcÃ¡n-200 flex items-center justify-center hover:bg-arena-100 transition-colors text-lg">âˆ’</button>
              <span className="text-lg font-medium text-lago-900 w-8 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(cabana.capacidad, guests + 1))} className="w-9 h-9 rounded-full border border-volcÃ¡n-200 flex items-center justify-center hover:bg-arena-100 transition-colors text-lg">+</button>
              <span className="text-xs text-volcÃ¡n-500">mÃ¡x. {cabana.capacidad}</span>
            </div>
          </div>

          {/* Price summary */}
          {pricing && (
            <div className="mt-5 bg-lago-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-volcÃ¡n-600">{pricing.noches} noche{pricing.noches > 1 ? 's' : ''} Ã— {formatCLP(pricing.precioPorNoche)}</span>
                <span className="text-lago-900">{formatCLP(pricing.subtotalNoches)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-volcÃ¡n-600">Limpieza</span>
                <span className="text-lago-900">{formatCLP(pricing.limpieza)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-lago-100 pt-2">
                <span className="text-lago-900">Total</span>
                <span className="text-lago-900 text-base">{formatCLP(pricing.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-volcÃ¡n-500">
                <span>Anticipo referencial</span>
                <span className="text-lago-700 font-medium">{formatCLP(pricing.anticipo)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={() => setStep('form')}
            disabled={!checkIn || !checkOut || !pricing}
            className="btn-primary w-full mt-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className="p-6">
          <button onClick={() => setStep('calendar')} className="text-sm text-volcÃ¡n-500 hover:text-lago-700 flex items-center gap-1 mb-5 transition-colors">
            <ChevronLeft size={14} />Volver al calendario
          </button>

          {/* Resumen */}
          {checkIn && checkOut && pricing && (
            <div className="bg-arena-50 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-volcÃ¡n-500">Check-in</span>
                <span className="font-medium">{format(checkIn, "d 'de' MMMM", { locale: es })}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-volcÃ¡n-500">Check-out</span>
                <span className="font-medium">{format(checkOut, "d 'de' MMMM", { locale: es })}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-volcÃ¡n-500">HuÃ©spedes</span>
                <span className="font-medium">{guests}</span>
              </div>
              <div className="flex justify-between border-t border-arena-200 pt-2 mt-2">
                <span className="text-volcÃ¡n-500">Anticipo referencial</span>
                <span className="font-semibold text-lago-700 text-base">{formatCLP(pricing.anticipo)}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label-text">Nombre completo</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre completo" className="input-field" />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className="input-field" />
            </div>
            <div>
              <label className="label-text">TelÃ©fono / WhatsApp</label>
              <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+569 XXXX XXXX" className="input-field" />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <p className="text-xs text-volcÃ¡n-400 mt-4 mb-5">
            Te contactaremos para confirmar disponibilidad, anticipo y forma de pago.
          </p>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Procesando...</span>
            ) : (
              'Solicitar reserva'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

