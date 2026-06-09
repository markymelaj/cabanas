'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader2, TreePine } from 'lucide-react'
import { calcCabanaPrice, formatCLP } from '@/lib/pricing'
import type { Cabana } from '@/lib/supabase'
import { displayCabana, polishCabanaText } from '@/lib/cabana-display'

type Step = 'cabana' | 'dates' | 'details'

type Props = {
  cabanas: Cabana[]
  initialCabanaId?: string
}

export default function CabanaReservationForm({ cabanas, initialCabanaId }: Props) {
  const polishedCabanas = cabanas.map(displayCabana)
  const [step, setStep] = useState<Step>('cabana')
  const [selectedCabanaId, setSelectedCabanaId] = useState(initialCabanaId || polishedCabanas[0]?.id || '')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [occupiedDates, setOccupiedDates] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [selectingCheckOut, setSelectingCheckOut] = useState(false)
  const [guests, setGuests] = useState(2)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [savedToAdmin, setSavedToAdmin] = useState(true)

  const selectedCabana = polishedCabanas.find((cabana) => cabana.id === selectedCabanaId) ?? polishedCabanas[0]
  const occupied = useMemo(() => new Set(occupiedDates), [occupiedDates])
  const today = startOfDay(new Date())

  useEffect(() => {
    if (!selectedCabanaId) return

    let cancelled = false
    setLoadingAvailability(true)
    setOccupiedDates([])
    setCheckIn(null)
    setCheckOut(null)
    setSelectingCheckOut(false)

    fetch(`/api/availability?cabana_id=${selectedCabanaId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOccupiedDates(Array.isArray(data.occupied) ? data.occupied : [])
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar disponibilidad. Puedes enviar la solicitud igual.')
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedCabanaId])

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const firstDayOfWeek = useMemo(() => {
    const day = getDay(startOfMonth(currentMonth))
    return day === 0 ? 6 : day - 1
  }, [currentMonth])

  const pricing = useMemo(() => {
    if (!selectedCabana || !checkIn || !checkOut) return null
    return calcCabanaPrice(
      checkIn,
      checkOut,
      Number(selectedCabana.precio_noche),
      Number(selectedCabana.precio_limpieza),
      {
        guests,
        baseGuests: Number(selectedCabana.base_huespedes ?? selectedCabana.capacidad),
        extraGuestFee: Number(selectedCabana.precio_huesped_extra ?? 0),
      }
    )
  }, [selectedCabana, checkIn, checkOut, guests])

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
      setError(null)
      return
    }

    if (!selectingCheckOut) return

    if (isBefore(date, checkIn) || isSameDay(date, checkIn)) {
      setCheckIn(date)
      return
    }

    const range = eachDayOfInterval({ start: checkIn, end: date })
    const hasConflict = range.some((day) => isOccupied(day))
    if (hasConflict) {
      setError('Hay fechas no disponibles en ese rango. Elige otro periodo.')
      return
    }

    setError(null)
    setCheckOut(date)
    setSelectingCheckOut(false)
  }

  async function handleSubmit() {
    if (!selectedCabana || !checkIn || !checkOut || !pricing) return
    if (!form.nombre || !form.email || !form.telefono) {
      setError('Completa nombre, email y teléfono.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabanaId: selectedCabana.id,
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(checkOut, 'yyyy-MM-dd'),
          guests,
          pricing,
          client: form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar la reserva')
      setReservationId(data.reservationId)
      setWhatsappUrl(data.whatsappUrl ?? null)
      setSavedToAdmin(data.savedToAdmin !== false)
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedCabana) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-8 text-center">
        <TreePine size={40} className="mx-auto text-lago-400 mb-4" />
        <h3 className="font-display text-3xl text-lago-900 mb-3">Reservas por WhatsApp</h3>
        <p className="text-volcÃ¡n-500 text-sm mb-6">Estamos cargando las cabañas disponibles.</p>
        <a href="https://wa.me/56957845292" className="btn-primary inline-flex">Consultar disponibilidad</a>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-10 text-center">
        <CheckCircle size={48} className="mx-auto text-lago-600 mb-4" />
        <h3 className="font-display text-3xl text-lago-900 mb-2">Solicitud recibida</h3>
        <p className="text-volcÃ¡n-500 text-sm mb-6">
          Te contactaremos en menos de 24 horas para confirmar disponibilidad y pago.
        </p>
        <div className="bg-lago-50 rounded-xl p-5 text-left space-y-2 text-sm mb-6">
          <div className="flex justify-between"><span className="text-volcÃ¡n-500">Cabaña</span><span>{polishCabanaText(selectedCabana.nombre)}</span></div>
          <div className="flex justify-between"><span className="text-volcÃ¡n-500">Check-in</span><span>{checkIn ? format(checkIn, "d 'de' MMMM yyyy", { locale: es }) : ''}</span></div>
          <div className="flex justify-between"><span className="text-volcÃ¡n-500">Check-out</span><span>{checkOut ? format(checkOut, "d 'de' MMMM yyyy", { locale: es }) : ''}</span></div>
          {pricing && (
            <div className="flex justify-between font-semibold border-t border-lago-100 pt-2">
              <span>Total estimado</span>
              <span className="text-lago-700">{formatCLP(pricing.total)}</span>
            </div>
          )}
          {reservationId && <p className="text-xs text-volcÃ¡n-400">Solicitud: {reservationId.slice(0, 8).toUpperCase()}</p>}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              Abrir WhatsApp
            </a>
          )}
          <button
            onClick={() => {
              setSubmitted(false)
              setStep('cabana')
              setCheckIn(null)
              setCheckOut(null)
              setForm({ nombre: '', email: '', telefono: '' })
              setWhatsappUrl(null)
              setSavedToAdmin(true)
            }}
            className="btn-outline text-sm"
          >
            Hacer otra solicitud
          </button>
        </div>
        {!savedToAdmin && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mt-4">
            La solicitud quedó lista para WhatsApp. También la revisaremos internamente para seguimiento.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="flex border-b border-arena-100">
        {(['cabana', 'dates', 'details'] as Step[]).map((item) => (
          <div
            key={item}
            className={`flex-1 py-3 text-center text-xs font-medium transition-colors border-b-2 ${step === item ? 'border-lago-600 text-lago-800' : 'border-transparent text-volcÃ¡n-400'}`}
          >
            {item === 'cabana' ? 'Cabaña' : item === 'dates' ? 'Fechas' : 'Tus datos'}
          </div>
        ))}
      </div>

      <div className="p-6">
        {step === 'cabana' && (
          <div>
            <h3 className="font-display text-2xl text-lago-900 mb-5">Elige tu cabaña</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {polishedCabanas.map((cabana) => (
                <button
                  key={cabana.id}
                  onClick={() => {
                    setSelectedCabanaId(cabana.id)
                    setGuests(Math.min(Math.max(1, Number(cabana.base_huespedes ?? guests)), cabana.capacidad))
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${selectedCabanaId === cabana.id ? 'border-lago-600 bg-lago-50' : 'border-volcÃ¡n-200 hover:border-lago-300'}`}
                >
                  <p className="font-display text-xl text-lago-900">{cabana.nombre}</p>
                  <p className="text-xs text-volcÃ¡n-500 mt-1">Hasta {cabana.capacidad} personas</p>
                  <p className="text-sm text-lago-700 mt-3">{formatCLP(Number(cabana.precio_noche))} / noche</p>
                  {Number(cabana.precio_huesped_extra ?? 0) > 0 && (
                    <p className="text-xs text-volcÃ¡n-400 mt-1">Huésped extra: {formatCLP(Number(cabana.precio_huesped_extra))}</p>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setStep('dates')} className="btn-primary w-full">
              Continuar
            </button>
          </div>
        )}

        {step === 'dates' && (
          <div>
            <button onClick={() => setStep('cabana')} className="text-sm text-volcÃ¡n-500 hover:text-lago-700 flex items-center gap-1 mb-5">
              <ChevronLeft size={14} />Volver
            </button>

            <div className="bg-arena-50 rounded-xl p-4 mb-5">
              <p className="font-display text-xl text-lago-900">{selectedCabana.nombre}</p>
              <p className="text-xs text-volcÃ¡n-500">Hasta {selectedCabana.capacidad} personas</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))} className="p-1.5 rounded hover:bg-arena-100 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="font-display text-lg capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-arena-100">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <div key={day} className="text-center text-xs text-volcÃ¡n-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfWeek }).map((_, index) => <div key={index} />)}
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
                    className={`h-9 text-sm rounded-lg transition-all ${isCI || isCO ? 'bg-lago-700 text-white font-medium' : ''} ${inRange ? 'bg-lago-100 text-lago-800 rounded-none' : ''} ${!isCI && !isCO && !inRange && !disabled ? 'hover:bg-arena-100 text-lago-900' : ''} ${disabled && !occ ? 'text-volcÃ¡n-200 cursor-not-allowed' : ''} ${occ ? 'text-volcÃ¡n-300 cursor-not-allowed line-through' : ''}`}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>

            {loadingAvailability && <p className="text-xs text-volcÃ¡n-400 mt-3">Cargando disponibilidad...</p>}

            <div className="mt-6">
              <label className="label-text">Huéspedes</label>
              <div className="flex items-center gap-4 mt-2">
                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-full border border-volcÃ¡n-200 hover:bg-arena-100 text-lg">-</button>
                <span className="text-2xl font-display text-lago-900 w-12 text-center">{guests}</span>
                <button onClick={() => setGuests(Math.min(selectedCabana.capacidad, guests + 1))} className="w-9 h-9 rounded-full border border-volcÃ¡n-200 hover:bg-arena-100 text-lg">+</button>
                <span className="text-xs text-volcÃ¡n-500">max. {selectedCabana.capacidad}</span>
              </div>
            </div>

            {pricing && (
              <div className="bg-lago-50 rounded-xl p-4 mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-volcÃ¡n-500">{pricing.noches} noche{pricing.noches > 1 ? 's' : ''}</span>
                  <span>{formatCLP(pricing.subtotalNoches)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-volcÃ¡n-500">Limpieza</span>
                  <span>{formatCLP(pricing.limpieza)}</span>
                </div>
                {pricing.extraHuespedes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-volcÃ¡n-500">Huéspedes extra</span>
                    <span>{formatCLP(pricing.extraHuespedes)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-lago-100 pt-2">
                  <span>Total estimado</span>
                  <span className="text-lago-700">{formatCLP(pricing.total)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button onClick={() => setStep('details')} disabled={!checkIn || !checkOut || !pricing} className="btn-primary w-full mt-5 disabled:opacity-40">
              Continuar
            </button>
          </div>
        )}

        {step === 'details' && (
          <div>
            <button onClick={() => setStep('dates')} className="text-sm text-volcÃ¡n-500 hover:text-lago-700 flex items-center gap-1 mb-5">
              <ChevronLeft size={14} />Volver
            </button>

            <div className="bg-arena-50 rounded-xl p-4 mb-6 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-volcÃ¡n-500">Cabaña</span><span>{selectedCabana.nombre}</span></div>
              <div className="flex justify-between"><span className="text-volcÃ¡n-500">Check-in</span><span>{checkIn ? format(checkIn, "d 'de' MMMM yyyy", { locale: es }) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-volcÃ¡n-500">Check-out</span><span>{checkOut ? format(checkOut, "d 'de' MMMM yyyy", { locale: es }) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-volcÃ¡n-500">Huéspedes</span><span>{guests}</span></div>
              {pricing && (
                <div className="flex justify-between font-semibold pt-1 border-t border-arena-200">
                  <span>Total estimado</span>
                  <span className="text-lago-700">{formatCLP(pricing.total)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Nombre completo</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Teléfono / WhatsApp</label>
                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field" />
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Enviando...</span> : 'Solicitar reserva'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

