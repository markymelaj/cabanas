'use client'

import { useMemo, useState } from 'react'
import { Check, CheckCircle2, Loader2, MessageCircle, ShieldCheck } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'

type Settings = { capacidad?: number | null; precio_jornada_completa?: number | null; precio_media_jornada?: number | null }
type Service = { id: string; nombre: string; precio: number; precio_por_persona: boolean; activa: boolean }

const TYPES = ['Matrimonio', 'Aniversario', 'Cumpleaños', 'Evento corporativo', 'Reunión de empresa', 'Otro']

export default function SalonQuoteFormV2({ settings, services }: { settings: Settings | null; services: Service[] }) {
  const maxGuests = Number(settings?.capacidad ?? 200)
  const activeServices = useMemo(() => services.length > 0 ? services.filter((service) => service.activa !== false) : [{ id: 'banqueteria', nombre: 'Banquetería', precio: 12000, precio_por_persona: true, activa: true }], [services])
  const [submittedAt] = useState(() => Date.now())
  const [form, setForm] = useState({ tipoEvento: '', fechaEvento: '', numInvitados: Math.min(80, maxGuests), horario: 'completo', servicios: [] as string[], nombre: '', email: '', telefono: '', mensaje: '', website: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ whatsappUrl: string | null; quoteId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pricing = useMemo(() => {
    const base = form.horario === 'medio' ? Number(settings?.precio_media_jornada ?? 520000) : Number(settings?.precio_jornada_completa ?? 800000)
    const extras = activeServices.filter((service) => form.servicios.includes(service.nombre)).reduce((sum, service) => sum + Number(service.precio ?? 0) * (service.precio_por_persona ? form.numInvitados : 1), 0)
    return { base, extras, total: base + extras }
  }, [form.horario, form.numInvitados, form.servicios, activeServices, settings])

  function toggleService(name: string) {
    setForm((current) => ({ ...current, servicios: current.servicios.includes(name) ? current.servicios.filter((item) => item !== name) : [...current.servicios, name] }))
  }

  async function submit() {
    setError(null)
    if (!form.tipoEvento || !form.fechaEvento || !form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      setError('Completa tipo de evento, fecha y datos de contacto.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/cotizacion-salon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, submittedAt }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No pudimos enviar la solicitud.')
      setResult({ whatsappUrl: data.whatsappUrl ?? null, quoteId: data.quoteId })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos enviar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  if (result) return <div className="surface-card p-8 text-center"><CheckCircle2 size={48} className="mx-auto text-lago-600" /><h3 className="mt-4 font-display text-4xl text-lago-950">Cotización registrada</h3><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-volcan-600">Revisaremos fecha, montaje y servicios antes de entregar una propuesta definitiva.</p><div className="mx-auto mt-6 max-w-sm rounded-2xl bg-lago-50 p-5 text-left text-sm"><Line label="Evento" value={form.tipoEvento} /><Line label="Invitados" value={String(form.numInvitados)} /><Line label="Estimado" value={formatCLP(pricing.total)} strong /><p className="mt-2 font-mono text-[11px] text-volcan-500">Código #{result.quoteId.slice(0, 8).toUpperCase()}</p></div>{result.whatsappUrl && <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6"><MessageCircle size={17} /> Continuar por WhatsApp</a>}</div>

  return (
    <div className="surface-card p-5 sm:p-7 lg:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className="label-text">Tipo de evento</span><select value={form.tipoEvento} onChange={(event) => setForm({ ...form, tipoEvento: event.target.value })} className="input-field"><option value="">Seleccionar</option>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label><span className="label-text">Fecha tentativa</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.fechaEvento} onChange={(event) => setForm({ ...form, fechaEvento: event.target.value })} className="input-field" /></label>
        <label><span className="label-text">Cantidad de invitados</span><input type="number" min={1} max={maxGuests} value={form.numInvitados} onChange={(event) => setForm({ ...form, numInvitados: Math.max(1, Math.min(maxGuests, Number(event.target.value) || 1)) })} className="input-field" /><span className="mt-1 block text-xs text-volcan-500">Capacidad máxima: {maxGuests}</span></label>
        <label><span className="label-text">Duración</span><select value={form.horario} onChange={(event) => setForm({ ...form, horario: event.target.value })} className="input-field"><option value="completo">Jornada completa</option><option value="medio">Media jornada</option></select></label>
      </div>

      <div className="mt-7"><span className="label-text">Servicios para cotizar</span><div className="mt-2 grid gap-3 sm:grid-cols-2">{activeServices.map((service) => { const checked = form.servicios.includes(service.nombre); return <button type="button" key={service.id} onClick={() => toggleService(service.nombre)} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left ${checked ? 'border-lago-600 bg-lago-50' : 'border-arena-200 hover:border-lago-300'}`}><span><span className="block font-semibold text-lago-950">{service.nombre}</span><span className="mt-1 block text-xs text-volcan-500">{formatCLP(Number(service.precio))}{service.precio_por_persona ? ' por persona' : ''}</span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${checked ? 'border-lago-700 bg-lago-700 text-white' : 'border-volcan-300'}`}>{checked && <Check size={14} />}</span></button> })}</div></div>

      <div className="mt-7 rounded-2xl bg-lago-50 p-5 text-sm"><Line label="Arriendo" value={formatCLP(pricing.base)} /><Line label="Servicios" value={formatCLP(pricing.extras)} /><Line label="Estimado referencial" value={formatCLP(pricing.total)} strong /></div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} autoComplete="name" maxLength={100} /><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" maxLength={160} /><Field label="Teléfono / WhatsApp" type="tel" value={form.telefono} onChange={(value) => setForm({ ...form, telefono: value })} autoComplete="tel" maxLength={30} /><label className="sm:col-span-2"><span className="label-text">Cuéntanos lo importante</span><textarea value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} maxLength={1200} className="input-field min-h-28 resize-y" placeholder="Montaje, horario aproximado, ceremonia, alimentación u otra necesidad." /></label><label className="hidden" aria-hidden="true">Sitio web<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label></div>

      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-volcan-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-lago-600" /> El valor es referencial. La fecha y el precio definitivo se confirman después de revisar disponibilidad y alcance.</p>
      <button type="button" onClick={submit} disabled={loading} className="btn-primary mt-5 w-full">{loading ? <><Loader2 size={16} className="animate-spin" /> Enviando</> : 'Solicitar cotización'}</button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', autoComplete, maxLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; maxLength?: number }) { return <label><span className="label-text">{label}</span><input value={value} type={type} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} maxLength={maxLength} className="input-field" /></label> }
function Line({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) { return <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'mt-1 border-t border-lago-100 pt-3 font-bold text-lago-950' : 'text-volcan-600'}`}><span>{label}</span><span className="text-right">{value}</span></div> }
