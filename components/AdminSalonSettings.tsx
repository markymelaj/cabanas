'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'

type Settings = {
  id?: string
  nombre?: string
  capacidad?: number
  metros_cuadrados?: number
  precio_jornada_completa?: number
  precio_media_jornada?: number
  anticipo_porcentaje?: number
  descripcion?: string | null
  condiciones?: string | null
  fotos?: string[] | null
}

type Service = {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  precio_por_persona: boolean
  activa: boolean
  orden: number
}

export default function AdminSalonSettings({ settings, services }: { settings: Settings | null; services: Service[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: settings?.nombre ?? 'Salón de Eventos',
    capacidad: String(settings?.capacidad ?? 200),
    metros_cuadrados: String(settings?.metros_cuadrados ?? 290),
    precio_jornada_completa: String(settings?.precio_jornada_completa ?? 800000),
    precio_media_jornada: String(settings?.precio_media_jornada ?? 520000),
    anticipo_porcentaje: String(settings?.anticipo_porcentaje ?? 30),
    descripcion: settings?.descripcion ?? '',
    condiciones: settings?.condiciones ?? '',
    fotos: (settings?.fotos ?? []).join('\n'),
  })
  const [serviceForm, setServiceForm] = useState({ id: '', nombre: '', descripcion: '', precio: '0', precio_por_persona: false, activa: true, orden: '0' })
  const [loading, setLoading] = useState(false)
  const [serviceLoading, setServiceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveSettings() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/salon-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar salon.')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveService() {
    setError(null)
    setServiceLoading(true)
    try {
      const res = await fetch('/api/admin/salon-services', {
        method: serviceForm.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar servicio.')
      setServiceForm({ id: '', nombre: '', descripcion: '', precio: '0', precio_por_persona: false, activa: true, orden: '0' })
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setServiceLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Configuracion</p>
        <h1 className="font-display text-3xl text-lago-900">Salon y precios</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-arena-100 bg-white p-5">
          <h2 className="font-display text-2xl text-lago-900 mb-5">Datos del salon</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
            <Field label="Capacidad" type="number" value={form.capacidad} onChange={(value) => setForm({ ...form, capacidad: value })} />
            <Field label="M2" type="number" value={form.metros_cuadrados} onChange={(value) => setForm({ ...form, metros_cuadrados: value })} />
            <Field label="Anticipo %" type="number" value={form.anticipo_porcentaje} onChange={(value) => setForm({ ...form, anticipo_porcentaje: value })} />
            <Field label="Jornada completa" type="number" value={form.precio_jornada_completa} onChange={(value) => setForm({ ...form, precio_jornada_completa: value })} />
            <Field label="Media jornada" type="number" value={form.precio_media_jornada} onChange={(value) => setForm({ ...form, precio_media_jornada: value })} />
          </div>
          <div className="mt-4 space-y-4">
            <Area label="Descripcion" value={form.descripcion} onChange={(value) => setForm({ ...form, descripcion: value })} />
            <Area label="Condiciones" value={form.condiciones} onChange={(value) => setForm({ ...form, condiciones: value })} />
            <Area label="Fotos URL (una por linea)" value={form.fotos} onChange={(value) => setForm({ ...form, fotos: value })} />
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={saveSettings} disabled={loading} className="btn-primary mt-5 w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar salon'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-arena-100 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-lago-900">Servicios</h2>
              <button onClick={() => setServiceForm({ id: '', nombre: '', descripcion: '', precio: '0', precio_por_persona: false, activa: true, orden: '0' })} className="btn-outline px-3 py-2 text-xs">
                <Plus size={14} />Nuevo
              </button>
            </div>
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setServiceForm({
                    id: service.id,
                    nombre: service.nombre,
                    descripcion: service.descripcion ?? '',
                    precio: String(service.precio ?? 0),
                    precio_por_persona: service.precio_por_persona,
                    activa: service.activa,
                    orden: String(service.orden ?? 0),
                  })}
                  className="w-full rounded-lg border border-arena-100 p-3 text-left hover:border-lago-300"
                >
                  <p className="font-medium text-lago-900">{service.nombre}</p>
                  <p className="text-xs text-volcan-500">
                    {formatCLP(Number(service.precio ?? 0))}{service.precio_por_persona ? ' por persona' : ''} · {service.activa ? 'activo' : 'oculto'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-arena-100 bg-white p-5">
            <h3 className="font-display text-xl text-lago-900 mb-4">{serviceForm.id ? 'Editar servicio' : 'Nuevo servicio'}</h3>
            <div className="space-y-3">
              <Field label="Nombre" value={serviceForm.nombre} onChange={(value) => setServiceForm({ ...serviceForm, nombre: value })} />
              <Field label="Precio" type="number" value={serviceForm.precio} onChange={(value) => setServiceForm({ ...serviceForm, precio: value })} />
              <Field label="Orden" type="number" value={serviceForm.orden} onChange={(value) => setServiceForm({ ...serviceForm, orden: value })} />
              <Area label="Descripcion" value={serviceForm.descripcion} onChange={(value) => setServiceForm({ ...serviceForm, descripcion: value })} />
              <label className="flex items-center gap-2 text-sm text-lago-800">
                <input type="checkbox" checked={serviceForm.precio_por_persona} onChange={(event) => setServiceForm({ ...serviceForm, precio_por_persona: event.target.checked })} />
                Precio por persona
              </label>
              <label className="flex items-center gap-2 text-sm text-lago-800">
                <input type="checkbox" checked={serviceForm.activa} onChange={(event) => setServiceForm({ ...serviceForm, activa: event.target.checked })} />
                Activo
              </label>
              <button onClick={saveService} disabled={serviceLoading || !serviceForm.nombre} className="btn-primary w-full disabled:opacity-50">
                {serviceLoading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar servicio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="label-text">{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="input-field" />
    </label>
  )
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="label-text">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="input-field min-h-24" />
    </label>
  )
}
