'use client'
import { useState, useMemo } from 'react'
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { calcSalonPrice, formatCLP } from '@/lib/pricing'

const TIPOS_EVENTO = ['Matrimonio', 'Aniversario', 'Cumpleaños', 'Evento corporativo', 'Reunión de empresa', 'Otro']
const SERVICIOS = [
  { id: 'banqueteria', label: 'Banquetería', emoji: '🍽️' },
  { id: 'sonido', label: 'DJ / Sonido', emoji: '🎵' },
  { id: 'decoracion', label: 'Decoración', emoji: '💐' },
  { id: 'fotografia', label: 'Fotografía', emoji: '📷' },
]

export default function SalonQuoteForm() {
  const [step, setStep] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(addMonths(new Date(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tipoEvento, setTipoEvento] = useState('')
  const [numInvitados, setNumInvitados] = useState(80)
  const [horario, setHorario] = useState<'completo' | 'medio'>('completo')
  const [servicios, setServicios] = useState<string[]>([])
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [savedToAdmin, setSavedToAdmin] = useState(true)

  const today = startOfDay(new Date())

  const pricing = useMemo(() =>
    calcSalonPrice(numInvitados, servicios, horario),
    [numInvitados, servicios, horario]
  )

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const firstDayOfWeek = useMemo(() => {
    const day = getDay(startOfMonth(currentMonth))
    return day === 0 ? 6 : day - 1
  }, [currentMonth])

  function toggleServicio(id: string) {
    setServicios((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!form.nombre || !form.email || !form.telefono) {
      setError('Por favor completa nombre, email y teléfono.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/cotizacion-salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          fechaEvento: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
          tipoEvento,
          numInvitados,
          horario,
          servicios,
          mensaje: form.mensaje,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      setQuoteResult(data)
      setWhatsappUrl(data.whatsappUrl ?? null)
      setSavedToAdmin(data.savedToAdmin !== false)
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
      }
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-10 text-center">
        <CheckCircle size={48} className="mx-auto text-lago-600 mb-4" />
        <h3 className="font-display text-3xl text-lago-900 mb-2">¡Cotización recibida!</h3>
        <p className="text-volcán-500 text-sm mb-6">
          Te contactaremos en menos de 24 horas a <strong>{form.email}</strong>.
        </p>
        {quoteResult?.pricing && (
          <div className="bg-lago-50 rounded-xl p-5 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-volcán-500">Arriendo salón</span>
              <span>{formatCLP(quoteResult.pricing.arriendoSalon)}</span>
            </div>
            {quoteResult.pricing.banqueteria > 0 && (
              <div className="flex justify-between">
                <span className="text-volcán-500">Banquetería ({numInvitados} pax)</span>
                <span>{formatCLP(quoteResult.pricing.banqueteria)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-lago-100 pt-2 text-base">
              <span>Total estimado</span>
              <span className="text-lago-700">{formatCLP(quoteResult.pricing.total)}</span>
            </div>
            <p className="text-xs text-volcán-400">Cotización referencial, no vinculante</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              Abrir WhatsApp
            </a>
          )}
          <a href="/salon" className="btn-outline text-sm">Volver al salón</a>
        </div>
        {!savedToAdmin && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mt-4">
            La cotizacion quedo lista para WhatsApp. El panel admin necesita revisar la conexion de Supabase.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Progress */}
      <div className="flex border-b border-arena-100">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 py-3 text-center text-xs font-medium transition-colors border-b-2 ${step === s ? 'border-lago-600 text-lago-800' : step > s ? 'border-lago-300 text-lago-500' : 'border-transparent text-volcán-400'}`}>
            {s === 1 ? 'Evento' : s === 2 ? 'Fecha y detalles' : 'Tus datos'}
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Tipo de evento */}
        {step === 1 && (
          <div>
            <h3 className="font-display text-2xl text-lago-900 mb-5">¿Qué tipo de evento?</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {TIPOS_EVENTO.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoEvento(t)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${tipoEvento === t ? 'border-lago-600 bg-lago-50 text-lago-800' : 'border-volcán-200 text-volcán-600 hover:border-lago-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <h3 className="font-display text-xl text-lago-900 mb-4">Servicios adicionales</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {SERVICIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleServicio(s.id)}
                  className={`py-3 px-4 rounded-xl border text-sm flex items-center gap-2 transition-all ${servicios.includes(s.id) ? 'border-lago-600 bg-lago-50 text-lago-800' : 'border-volcán-200 text-volcán-600 hover:border-lago-300'}`}
                >
                  <span>{s.emoji}</span>{s.label}
                  {servicios.includes(s.id) && <CheckCircle size={14} className="ml-auto text-lago-600" />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!tipoEvento} className="btn-primary w-full disabled:opacity-40">
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Fecha, invitados y horario */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-sm text-volcán-500 hover:text-lago-700 flex items-center gap-1 mb-5">
              <ChevronLeft size={14} />Volver
            </button>

            <h3 className="font-display text-xl text-lago-900 mb-4">¿Cuándo es tu evento?</h3>

            {/* Mini calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} disabled={isBefore(startOfMonth(currentMonth), startOfMonth(addMonths(today, 1)))} className="p-1.5 rounded hover:bg-arena-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-display text-lg capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-arena-100 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {['L','M','X','J','V','S','D'].map((d) => (
                  <div key={d} className="text-center text-xs text-volcán-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={i} />)}
                {daysInMonth.map((date) => {
                  const disabled = isBefore(date, today)
                  const sel = selectedDate && isSameDay(date, selectedDate)
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !disabled && setSelectedDate(date)}
                      disabled={disabled}
                      className={`h-9 text-sm rounded-lg transition-all ${sel ? 'bg-lago-700 text-white font-medium' : disabled ? 'text-volcán-200 cursor-not-allowed' : 'hover:bg-arena-100 text-lago-900'}`}
                    >
                      {format(date, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Invitados */}
            <div className="mb-5">
              <label className="label-text">Número estimado de invitados</label>
              <div className="flex items-center gap-4 mt-2">
                <button onClick={() => setNumInvitados(Math.max(20, numInvitados - 10))} className="w-9 h-9 rounded-full border border-volcán-200 hover:bg-arena-100 transition-colors text-lg">−</button>
                <span className="text-2xl font-display text-lago-900 w-12 text-center">{numInvitados}</span>
                <button onClick={() => setNumInvitados(Math.min(200, numInvitados + 10))} className="w-9 h-9 rounded-full border border-volcán-200 hover:bg-arena-100 transition-colors text-lg">+</button>
                <span className="text-xs text-volcán-500">máx. 200</span>
              </div>
            </div>

            {/* Horario */}
            <div className="mb-6">
              <label className="label-text">Horario</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[{ id: 'completo', label: 'Jornada completa', sub: '10:00 - 05:00' }, { id: 'medio', label: 'Media jornada', sub: '10:00 - 18:00' }].map((h) => (
                  <button key={h.id} onClick={() => setHorario(h.id as any)} className={`py-3 px-4 rounded-xl border text-sm transition-all text-left ${horario === h.id ? 'border-lago-600 bg-lago-50' : 'border-volcán-200 hover:border-lago-300'}`}>
                    <p className="font-medium text-lago-900">{h.label}</p>
                    <p className="text-xs text-volcán-500">{h.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Precio estimado */}
            <div className="bg-lago-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-volcán-500">Arriendo salón</span>
                <span>{formatCLP(pricing.arriendoSalon)}</span>
              </div>
              {pricing.banqueteria > 0 && (
                <div className="flex justify-between">
                  <span className="text-volcán-500">Banquetería ({numInvitados} pax)</span>
                  <span>{formatCLP(pricing.banqueteria)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t border-lago-100 pt-2 text-base">
                <span>Total estimado</span>
                <span className="text-lago-700">{formatCLP(pricing.total)}</span>
              </div>
              <p className="text-xs text-volcán-400">Referencial, no vinculante. Confirmamos en 24h.</p>
            </div>

            <button onClick={() => setStep(3)} disabled={!selectedDate} className="btn-primary w-full disabled:opacity-40">
              Continuar
            </button>
          </div>
        )}

        {/* Step 3: Datos personales */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="text-sm text-volcán-500 hover:text-lago-700 flex items-center gap-1 mb-5">
              <ChevronLeft size={14} />Volver
            </button>

            {/* Resumen */}
            <div className="bg-arena-50 rounded-xl p-4 mb-6 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-volcán-500">Tipo</span><span>{tipoEvento}</span></div>
              <div className="flex justify-between"><span className="text-volcán-500">Fecha</span><span>{selectedDate ? format(selectedDate, "d 'de' MMMM yyyy", { locale: es }) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-volcán-500">Invitados</span><span>{numInvitados}</span></div>
              <div className="flex justify-between font-semibold pt-1 border-t border-arena-200">
                <span>Total estimado</span>
                <span className="text-lago-700">{formatCLP(pricing.total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Nombre completo</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre completo" className="input-field" />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.cl" className="input-field" />
              </div>
              <div>
                <label className="label-text">Teléfono / WhatsApp</label>
                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+569 XXXX XXXX" className="input-field" />
              </div>
              <div>
                <label className="label-text">Mensaje adicional (opcional)</label>
                <textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} placeholder="¿Algo que debamos saber sobre tu evento?" rows={3} className="input-field resize-none" />
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Enviando...</span> : 'Solicitar cotización →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
