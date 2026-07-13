'use client'

import { useEffect, useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isAfter, isBefore, isSameDay, startOfDay, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, MessageCircle, ShieldCheck } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { displayCabana } from '@/lib/cabana-display'
import { calcCabanaPrice, formatCLP } from '@/lib/pricing'
import { hasOccupiedNight, nightsBetween } from '@/lib/date-rules'

type Step = 'cabana' | 'dates' | 'details'
type ContactForm = { nombre: string; email: string; telefono: string; website: string }

export default function CabanaReservationForm({ cabanas, initialCabanaId }: { cabanas: Cabana[]; initialCabanaId?: string }) {
  const polishedCabanas = useMemo(() => cabanas.map(displayCabana), [cabanas])
  const [step, setStep] = useState<Step>(initialCabanaId ? 'dates' : 'cabana')
  const [selectedCabanaId, setSelectedCabanaId] = useState(initialCabanaId || polishedCabanas[0]?.id || '')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [occupiedDates, setOccupiedDates] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(2)
  const [form, setForm] = useState<ContactForm>({ nombre: '', email: '', telefono: '', website: '' })
  const [loading, setLoading] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [demoAvailability, setDemoAvailability] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; whatsappUrl: string | null; savedToAdmin: boolean } | null>(null)
  const [submittedAt] = useState(() => Date.now())

  const selectedCabana = polishedCabanas.find((cabana) => cabana.id === selectedCabanaId) ?? polishedCabanas[0]
  const occupied = useMemo(() => new Set(occupiedDates), [occupiedDates])
  const today = startOfDay(new Date())
  const minNights = Math.max(1, Number(selectedCabana?.min_noches ?? 1))

  useEffect(() => {
    if (!selectedCabanaId) return
    const controller = new AbortController()
    setLoadingAvailability(true)
    setAvailabilityError(null)
    setDemoAvailability(false)
    setError(null)
    setOccupiedDates([])
    setCheckIn(null)
    setCheckOut(null)

    fetch(`/api/availability?cabana_id=${encodeURIComponent(selectedCabanaId)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudo consultar la disponibilidad.')
        setOccupiedDates(Array.isArray(data.occupied) ? data.occupied : [])
        setDemoAvailability(Boolean(data.demoFallback))
      })
      .catch((fetchError: Error) => {
        if (fetchError.name !== 'AbortError') setAvailabilityError('No pudimos verificar las fechas. Reintenta antes de enviar la solicitud.')
      })
      .finally(() => setLoadingAvailability(false))

    return () => controller.abort()
  }, [selectedCabanaId])

  useEffect(() => {
    if (!selectedCabana) return
    setGuests(Math.min(selectedCabana.capacidad, Math.max(1, Number(selectedCabana.base_huespedes ?? 2))))
  }, [selectedCabana])

  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth])
  const firstDayOfWeek = useMemo(() => { const day = getDay(startOfMonth(currentMonth)); return day === 0 ? 6 : day - 1 }, [currentMonth])
  const pricing = useMemo(() => {
    if (!selectedCabana || !checkIn || !checkOut) return null
    return calcCabanaPrice(checkIn, checkOut, Number(selectedCabana.precio_noche), Number(selectedCabana.precio_limpieza), {
      guests,
      baseGuests: Number(selectedCabana.base_huespedes ?? selectedCabana.capacidad),
      extraGuestFee: Number(selectedCabana.precio_huesped_extra ?? 0),
    })
  }, [selectedCabana, checkIn, checkOut, guests])

  function isOccupied(date: Date) { return occupied.has(format(date, 'yyyy-MM-dd')) }
  function isDisabled(date: Date) {
    if (isBefore(date, today)) return true
    if (!checkIn || checkOut || !isAfter(date, checkIn)) return isOccupied(date)
    return false
  }
  function isInRange(date: Date) { return Boolean(checkIn && checkOut && isAfter(date, checkIn) && isBefore(date, checkOut)) }

  function handleDayClick(date: Date) {
    if (isBefore(date, today)) return
    setError(null)

    if (!checkIn || checkOut) {
      if (isOccupied(date)) return
      setCheckIn(date)
      setCheckOut(null)
      return
    }

    if (!isAfter(date, checkIn)) {
      if (isOccupied(date)) return
      setCheckIn(date)
      setCheckOut(null)
      return
    }

    const nights = nightsBetween(checkIn, date)
    if (nights < minNights) {
      setError(`Esta cabaña requiere al menos ${minNights} noche${minNights === 1 ? '' : 's'}.`)
      return
    }
    if (hasOccupiedNight(checkIn, date, occupied)) {
      setError('El rango incluye una noche no disponible. Elige otras fechas.')
      return
    }

    setCheckOut(date)
  }

  async function handleSubmit() {
    if (!selectedCabana || !checkIn || !checkOut || !pricing || availabilityError) return
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      setError('Completa nombre, email y teléfono.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabanaId: selectedCabana.id,
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(checkOut, 'yyyy-MM-dd'),
          guests,
          client: { nombre: form.nombre, email: form.email, telefono: form.telefono },
          website: form.website,
          submittedAt,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No pudimos enviar la solicitud.')
      setResult({ id: data.reservationId, whatsappUrl: data.whatsappUrl ?? null, savedToAdmin: data.savedToAdmin !== false })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos enviar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedCabana) return <div className="surface-card p-8 text-center text-volcan-600">No hay cabañas activas para reservar.</div>

  if (result) {
    return (
      <div className="surface-card p-7 text-center sm:p-10">
        <CheckCircle2 size={50} className="mx-auto text-lago-600" />
        <h3 className="mt-4 font-display text-4xl text-lago-950">Solicitud registrada</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-volcan-600">La estadía todavía no está confirmada. El alojamiento revisará el anticipo y responderá por WhatsApp.</p>
        <div className="mx-auto mt-7 max-w-md rounded-2xl bg-lago-50 p-5 text-left text-sm">
          <Summary label="Cabaña" value={selectedCabana.nombre} />
          <Summary label="Fechas" value={`${checkIn ? format(checkIn, 'd MMM', { locale: es }) : ''} — ${checkOut ? format(checkOut, 'd MMM yyyy', { locale: es }) : ''}`} />
          <Summary label="Total estimado" value={formatCLP(pricing?.total ?? 0)} strong />
          <p className="mt-3 font-mono text-[11px] text-volcan-500">Código #{result.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {result.whatsappUrl && <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={17} /> Continuar por WhatsApp</a>}
          <button type="button" onClick={() => { setResult(null); setStep('dates'); setCheckIn(null); setCheckOut(null); setForm({ nombre: '', email: '', telefono: '', website: '' }) }} className="btn-outline">Nueva consulta</button>
        </div>
        {!result.savedToAdmin && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">La consulta quedó preparada para WhatsApp, pero el panel no pudo registrarla. En una instalación real este estado debe revisarse.</p>}
      </div>
    )
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="grid grid-cols-3 border-b border-arena-100 bg-arena-50/70">
        {(['cabana', 'dates', 'details'] as Step[]).map((item, index) => <div key={item} className={`border-b-2 px-2 py-4 text-center text-xs font-bold ${step === item ? 'border-arena-600 text-lago-900' : 'border-transparent text-volcan-400'}`}><span className="mr-1 hidden sm:inline">{index + 1}.</span>{item === 'cabana' ? 'Cabaña' : item === 'dates' ? 'Fechas' : 'Tus datos'}</div>)}
      </div>

      <div className="p-5 sm:p-7">
        {step === 'cabana' && <div><h3 className="font-display text-3xl text-lago-950">Elige una unidad</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{polishedCabanas.map((cabana) => <button type="button" key={cabana.id} onClick={() => setSelectedCabanaId(cabana.id)} className={`rounded-2xl border p-4 text-left ${selectedCabanaId === cabana.id ? 'border-lago-600 bg-lago-50' : 'border-arena-200 hover:border-lago-300'}`}><p className="font-display text-xl text-lago-950">{cabana.nombre}</p><p className="mt-1 text-xs text-volcan-500">Hasta {cabana.capacidad} personas · {formatCLP(Number(cabana.precio_noche))}/noche</p></button>)}</div><button type="button" onClick={() => setStep('dates')} className="btn-primary mt-6 w-full">Revisar fechas</button></div>}

        {step === 'dates' && <div>
          {!initialCabanaId && <button type="button" onClick={() => setStep('cabana')} className="btn-ghost mb-4 -ml-3 min-h-9 px-3 py-1 text-xs"><ChevronLeft size={14} /> Cambiar cabaña</button>}
          <div className="mb-5 flex flex-col gap-2 rounded-2xl bg-lago-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-2xl text-lago-950">{selectedCabana.nombre}</p><p className="text-xs text-volcan-600">Hasta {selectedCabana.capacidad} personas · mínimo {minNights} noche{minNights === 1 ? '' : 's'}</p></div><p className="font-semibold text-lago-800">{formatCLP(Number(selectedCabana.precio_noche))}<span className="text-xs font-normal text-volcan-500"> / noche</span></p></div>

          <div className="flex items-center justify-between"><button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isBefore(startOfMonth(currentMonth), startOfMonth(today))} className="rounded-xl p-2 hover:bg-arena-100 disabled:opacity-30" aria-label="Mes anterior"><ChevronLeft size={18} /></button><p className="font-display text-xl capitalize text-lago-950">{format(currentMonth, 'MMMM yyyy', { locale: es })}</p><button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl p-2 hover:bg-arena-100" aria-label="Mes siguiente"><ChevronRight size={18} /></button></div>
          <div className="mt-3 grid grid-cols-7">{['L','M','X','J','V','S','D'].map((day) => <div key={day} className="py-2 text-center text-xs font-bold text-volcan-400">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{Array.from({ length: firstDayOfWeek }).map((_, index) => <span key={`empty-${index}`} />)}{daysInMonth.map((date) => { const ci = Boolean(checkIn && isSameDay(date, checkIn)); const co = Boolean(checkOut && isSameDay(date, checkOut)); const range = isInRange(date); const disabled = isDisabled(date); const occ = isOccupied(date); return <button type="button" key={date.toISOString()} onClick={() => handleDayClick(date)} disabled={disabled} aria-label={format(date, "d 'de' MMMM", { locale: es })} className={`relative aspect-square min-h-10 rounded-xl text-sm transition ${ci || co ? 'bg-lago-700 font-bold text-white' : ''} ${range ? 'rounded-md bg-lago-100 text-lago-900' : ''} ${!ci && !co && !range && !disabled ? 'text-lago-950 hover:bg-arena-100' : ''} ${disabled ? 'cursor-not-allowed text-volcan-300' : ''} ${occ && !co ? 'line-through' : ''}`}>{format(date, 'd')}</button>})}</div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-volcan-500"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-lago-700" /> Selección</span><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-lago-100" /> Estadía</span><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-volcan-100" /> No disponible</span></div>
          {loadingAvailability && <p className="mt-4 flex items-center gap-2 rounded-xl bg-arena-50 p-3 text-sm text-volcan-600"><Loader2 size={15} className="animate-spin" /> Verificando disponibilidad…</p>}
          {demoAvailability && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">Modo demostración: el calendario usa disponibilidad simulada. En una instalación real se consulta Supabase antes de permitir el envío.</p>}
          {availabilityError && <Alert text={availabilityError} />}

          <div className="mt-6 border-t border-arena-100 pt-5"><label className="label-text">Huéspedes</label><div className="flex items-center gap-4"><button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="h-11 w-11 rounded-full border border-volcan-200 text-xl hover:bg-arena-50">−</button><span className="w-8 text-center font-display text-2xl">{guests}</span><button type="button" onClick={() => setGuests(Math.min(selectedCabana.capacidad, guests + 1))} className="h-11 w-11 rounded-full border border-volcan-200 text-xl hover:bg-arena-50">+</button><span className="text-xs text-volcan-500">máximo {selectedCabana.capacidad}</span></div></div>
          {pricing && <div className="mt-5 rounded-2xl bg-lago-50 p-4 text-sm"><Summary label={`${pricing.noches} noche${pricing.noches === 1 ? '' : 's'}`} value={formatCLP(pricing.subtotalNoches)} /><Summary label="Limpieza" value={formatCLP(pricing.limpieza)} />{pricing.extraHuespedes > 0 && <Summary label="Huéspedes extra" value={formatCLP(pricing.extraHuespedes)} />}<Summary label="Total estimado" value={formatCLP(pricing.total)} strong /></div>}
          {error && <Alert text={error} />}
          <button type="button" onClick={() => setStep('details')} disabled={!checkIn || !checkOut || !pricing || Boolean(availabilityError) || loadingAvailability} className="btn-primary mt-5 w-full">Continuar con mis datos</button>
        </div>}

        {step === 'details' && <div><button type="button" onClick={() => setStep('dates')} className="btn-ghost mb-4 -ml-3 min-h-9 px-3 py-1 text-xs"><ChevronLeft size={14} /> Volver a fechas</button><div className="mb-6 rounded-2xl bg-arena-50 p-4 text-sm"><Summary label="Cabaña" value={selectedCabana.nombre} /><Summary label="Fechas" value={`${checkIn ? format(checkIn, 'd MMM', { locale: es }) : ''} — ${checkOut ? format(checkOut, 'd MMM yyyy', { locale: es }) : ''}`} /><Summary label="Huéspedes" value={String(guests)} />{pricing && <Summary label="Total estimado" value={formatCLP(pricing.total)} strong />}</div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre completo" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} autoComplete="name" maxLength={100} /><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" maxLength={160} /><Field label="Teléfono / WhatsApp" type="tel" value={form.telefono} onChange={(value) => setForm({ ...form, telefono: value })} autoComplete="tel" maxLength={30} /><label className="hidden" aria-hidden="true">Sitio web<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label></div>{error && <Alert text={error} />}<p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-volcan-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-lago-600" /> Al enviar aceptas que el alojamiento te contacte para confirmar disponibilidad, anticipo y condiciones. No se realiza un cobro automático.</p><button type="button" onClick={handleSubmit} disabled={loading || Boolean(availabilityError)} className="btn-primary mt-5 w-full">{loading ? <><Loader2 size={16} className="animate-spin" /> Enviando solicitud</> : 'Solicitar reserva'}</button></div>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', autoComplete, maxLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; maxLength?: number }) { return <label className={label.startsWith('Nombre') ? 'sm:col-span-2' : ''}><span className="label-text">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} maxLength={maxLength} className="input-field" /></label> }
function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'mt-1 border-t border-lago-100 pt-3 font-bold text-lago-950' : 'text-volcan-600'}`}><span>{label}</span><span className="text-right">{value}</span></div> }
function Alert({ text }: { text: string }) { return <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" />{text}</p> }
