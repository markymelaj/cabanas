'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'

type Settings = {
  precio_jornada_completa?: number
  precio_media_jornada?: number
}

type Service = {
  id: string
  nombre: string
  precio: number
  precio_por_persona: boolean
  activa: boolean
}

export default function AdminSalonEventForm({ settings, services }: { settings: Settings | null; services: Service[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    fecha_evento: '',
    tipo_evento: '',
    num_invitados: '80',
    horario: 'completo',
    servicios: [] as string[],
    status: 'reservada',
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
    direccion: '',
    adjustment_amount: '0',
    total_amount: '',
    mensaje: '',
    internal_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricing = useMemo(() => {
    const base = form.horario === 'medio'
      ? Number(settings?.precio_media_jornada ?? 520000)
      : Number(settings?.precio_jornada_completa ?? 800000)
    const extras = services
      .filter((service) => form.servicios.includes(service.nombre))
      .reduce((sum, service) => sum + Number(service.precio ?? 0) * (service.precio_por_persona ? Number(form.num_invitados || 0) : 1), 0)
    const total = Number(form.total_amount || 0) || Math.max(0, base + extras + Number(form.adjustment_amount || 0))
    return { base, extras, total }
  }, [form, services, settings])

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
    setLoading(true)
    try {
      const res = await fetch('/api/admin/salon-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_evento: form.fecha_evento,
          tipo_evento: form.tipo_evento,
          num_invitados: form.num_invitados,
          horario: form.horario,
          servicios: form.servicios,
          status: form.status,
          adjustment_amount: form.adjustment_amount,
          total_amount: form.total_amount || pricing.total,
          mensaje: form.mensaje,
          internal_notes: form.internal_notes,
          client: {
            nombre: form.nombre,
            email: form.email,
            telefono: form.telefono,
            documento: form.documento,
            direccion: form.direccion,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el evento.')
      router.push(`/admin/salon/${data.quoteId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Salon</p>
        <h1 className="font-display text-3xl text-lago-900">Crear evento manual</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="rounded-lg border border-arena-100 bg-white p-5 space-y-5">
          <Section title="Evento">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Fecha" type="date" value={form.fecha_evento} onChange={(value) => setForm({ ...form, fecha_evento: value })} />
              <Field label="Tipo evento" value={form.tipo_evento} onChange={(value) => setForm({ ...form, tipo_evento: value })} />
              <Field label="Invitados" type="number" value={form.num_invitados} onChange={(value) => setForm({ ...form, num_invitados: value })} />
              <label>
                <span className="label-text">Horario</span>
                <select value={form.horario} onChange={(event) => setForm({ ...form, horario: event.target.value })} className="input-field">
                  <option value="completo">Jornada completa</option>
                  <option value="medio">Media jornada</option>
                </select>
              </label>
              <label>
                <span className="label-text">Estado</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="input-field">
                  <option value="reservada">Reservada standby</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cotizada">Cotizada</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Cliente">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
              <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Field label="Telefono" value={form.telefono} onChange={(value) => setForm({ ...form, telefono: value })} />
              <Field label="Documento" value={form.documento} onChange={(value) => setForm({ ...form, documento: value })} />
              <label className="md:col-span-2">
                <span className="label-text">Direccion</span>
                <input value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} className="input-field" />
              </label>
            </div>
          </Section>

          <Section title="Servicios">
            <div className="grid gap-2 md:grid-cols-2">
              {services.filter((service) => service.activa).map((service) => (
                <label key={service.id} className="flex items-center justify-between gap-3 rounded-lg border border-arena-100 p-3 text-sm">
                  <span>
                    <span className="font-medium text-lago-900">{service.nombre}</span>
                    <span className="block text-xs text-volcan-500">{formatCLP(Number(service.precio ?? 0))}{service.precio_por_persona ? ' p/p' : ''}</span>
                  </span>
                  <input type="checkbox" checked={form.servicios.includes(service.nombre)} onChange={() => toggleService(service.nombre)} />
                </label>
              ))}
            </div>
          </Section>

          <Section title="Ajustes y notas">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ajuste +/-" type="number" value={form.adjustment_amount} onChange={(value) => setForm({ ...form, adjustment_amount: value })} />
              <Field label="Total manual" type="number" value={form.total_amount} onChange={(value) => setForm({ ...form, total_amount: value })} />
            </div>
            <textarea value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} className="input-field min-h-20 mt-4" placeholder="Mensaje o requerimientos del evento" />
            <textarea value={form.internal_notes} onChange={(event) => setForm({ ...form, internal_notes: event.target.value })} className="input-field min-h-20 mt-4" placeholder="Notas internas" />
          </Section>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={loading || !form.fecha_evento || !form.tipo_evento || !form.nombre || !form.email} className="btn-primary w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Creando</> : 'Crear evento'}
          </button>
        </div>

        <div className="rounded-lg border border-arena-100 bg-white p-5 h-fit">
          <h2 className="font-display text-2xl text-lago-900">Resumen</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Line label="Base" value={formatCLP(pricing.base)} />
            <Line label="Servicios" value={formatCLP(pricing.extras)} />
            <Line label="Ajuste" value={formatCLP(Number(form.adjustment_amount || 0))} />
            <Line label="Total" value={formatCLP(pricing.total)} strong />
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="font-display text-xl text-lago-900 mb-3">{title}</h2>{children}</section>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="label-text">{label}</span><input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="input-field" /></label>
}

function Line({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'font-semibold text-lago-900' : 'text-volcan-600'}`}><span>{label}</span><span>{value}</span></div>
}
