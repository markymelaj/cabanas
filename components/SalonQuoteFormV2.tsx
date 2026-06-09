'use client'

import { useMemo, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'

type Settings = {
  capacidad?: number | null
  precio_jornada_completa?: number | null
  precio_media_jornada?: number | null
}

type Service = {
  id: string
  nombre: string
  precio: number
  precio_por_persona: boolean
  activa: boolean
}

const TYPES = ['Matrimonio', 'Aniversario', 'Cumpleanos', 'Evento corporativo', 'Reunion de empresa', 'Otro']

export default function SalonQuoteFormV2({ settings, services }: { settings: Settings | null; services: Service[] }) {
  const maxGuests = Number(settings?.capacidad ?? 200)
  const activeServices = services.length > 0
    ? services.filter((service) => service.activa !== false)
    : [{ id: 'banqueteria', nombre: 'Banqueteria', precio: 12000, precio_por_persona: true, activa: true }]

  const [form, setForm] = useState({
    tipoEvento: '',
    fechaEvento: '',
    numInvitados: 80,
    horario: 'completo',
    servicios: [] as string[],
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pricing = useMemo(() => {
    const base = form.horario === 'medio'
      ? Number(settings?.precio_media_jornada ?? 520000)
      : Number(settings?.precio_jornada_completa ?? 800000)
    const extras = activeServices
      .filter((service) => form.servicios.includes(service.nombre))
      .reduce((sum, service) => sum + Number(service.precio ?? 0) * (service.precio_por_persona ? form.numInvitados : 1), 0)
    return { base, extras, total: base + extras }
  }, [form, activeServices, settings])

  function toggleService(name: string) {
    setForm((current) => ({
      ...current,
      servicios: current.servicios.includes(name)
        ? current.servicios.filter((item) => item !== name)
        : [...current.servicios, name],
    }))
  }

  async function submit() {
    setError(null)
    if (!form.tipoEvento || !form.fechaEvento || !form.nombre || !form.email || !form.telefono) {
      setError('Completa tipo, fecha y tus datos de contacto.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cotizacion-salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No pudimos enviar la solicitud.')
      setWhatsappUrl(data.whatsappUrl ?? null)
      if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-arena-100 rounded-lg p-8 text-center">
        <CheckCircle size={42} className="mx-auto text-lago-700 mb-3" />
        <h3 className="font-display text-3xl text-lago-900">Solicitud recibida</h3>
        <p className="text-sm text-volcan-500 mt-2">Te contactaremos para revisar disponibilidad, servicios y condiciones.</p>
        {whatsappUrl && <a href={whatsappUrl} target="_blank" className="btn-primary mt-5">Abrir WhatsApp</a>}
      </div>
    )
  }

  return (
    <div className="bg-white border border-arena-100 rounded-lg p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label-text">Tipo de evento</span>
          <select value={form.tipoEvento} onChange={(event) => setForm({ ...form, tipoEvento: event.target.value })} className="input-field">
            <option value="">Seleccionar</option>
            {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span className="label-text">Fecha</span>
          <input type="date" value={form.fechaEvento} onChange={(event) => setForm({ ...form, fechaEvento: event.target.value })} className="input-field" />
        </label>
        <label>
          <span className="label-text">Invitados</span>
          <input type="number" min={1} max={maxGuests} value={form.numInvitados} onChange={(event) => setForm({ ...form, numInvitados: Math.min(maxGuests, Number(event.target.value)) })} className="input-field" />
        </label>
        <label>
          <span className="label-text">Horario</span>
          <select value={form.horario} onChange={(event) => setForm({ ...form, horario: event.target.value })} className="input-field">
            <option value="completo">Jornada completa</option>
            <option value="medio">Media jornada</option>
          </select>
        </label>
      </div>

      <div>
        <span className="label-text">Servicios</span>
        <div className="grid gap-2 md:grid-cols-2">
          {activeServices.map((service) => (
            <label key={service.id} className="flex items-center justify-between gap-3 rounded-lg border border-arena-100 p-3 text-sm">
              <span>
                <span className="font-medium text-lago-900">{service.nombre}</span>
                <span className="block text-xs text-volcan-500">{formatCLP(Number(service.precio ?? 0))}{service.precio_por_persona ? ' p/p' : ''}</span>
              </span>
              <input type="checkbox" checked={form.servicios.includes(service.nombre)} onChange={() => toggleService(service.nombre)} />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-lago-50 p-4 text-sm space-y-2">
        <Line label="Arriendo" value={formatCLP(pricing.base)} />
        <Line label="Servicios" value={formatCLP(pricing.extras)} />
        <Line label="Estimado" value={formatCLP(pricing.total)} strong />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
        <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field label="Teléfono / WhatsApp" value={form.telefono} onChange={(value) => setForm({ ...form, telefono: value })} />
        <label className="md:col-span-2">
          <span className="label-text">Mensaje</span>
          <textarea value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} className="input-field min-h-24" />
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />Enviando</> : 'Solicitar cotización'}
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="label-text">{label}</span><input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="input-field" /></label>
}

function Line({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'font-semibold text-lago-900' : 'text-volcan-600'}`}><span>{label}</span><span>{value}</span></div>
}
