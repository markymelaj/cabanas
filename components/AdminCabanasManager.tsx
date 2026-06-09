'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Home, Loader2, Plus } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { formatCLP } from '@/lib/pricing'

const emptyForm = {
  id: '',
  nombre: '',
  slug: '',
  subtitulo: '',
  capacidad: '2',
  dormitorios: '1',
  banos: '1',
  camas: '',
  metros_cuadrados: '',
  base_huespedes: '2',
  precio_huesped_extra: '0',
  min_noches: '1',
  check_in_hora: '15:00',
  check_out_hora: '11:00',
  precio_noche: '0',
  precio_limpieza: '0',
  descripcion_corta: '',
  descripcion: '',
  amenidades: '',
  fotos: '',
  activa: true,
  destacada: false,
  orden: '0',
}

type FormState = typeof emptyForm

function formFromCabana(cabana: Cabana): FormState {
  return {
    id: cabana.id,
    nombre: cabana.nombre ?? '',
    slug: cabana.slug ?? '',
    subtitulo: cabana.subtitulo ?? '',
    capacidad: String(cabana.capacidad ?? 1),
    dormitorios: String(cabana.dormitorios ?? 1),
    banos: String(cabana.banos ?? 1),
    camas: cabana.camas ?? '',
    metros_cuadrados: cabana.metros_cuadrados ? String(cabana.metros_cuadrados) : '',
    base_huespedes: String(cabana.base_huespedes ?? cabana.capacidad ?? 1),
    precio_huesped_extra: String(cabana.precio_huesped_extra ?? 0),
    min_noches: String(cabana.min_noches ?? 1),
    check_in_hora: cabana.check_in_hora ?? '15:00',
    check_out_hora: cabana.check_out_hora ?? '11:00',
    precio_noche: String(cabana.precio_noche ?? 0),
    precio_limpieza: String(cabana.precio_limpieza ?? 0),
    descripcion_corta: cabana.descripcion_corta ?? '',
    descripcion: cabana.descripcion ?? '',
    amenidades: (cabana.amenidades ?? []).join('\n'),
    fotos: (cabana.fotos ?? []).join('\n'),
    activa: cabana.activa !== false,
    destacada: Boolean(cabana.destacada),
    orden: String(cabana.orden ?? 0),
  }
}

export default function AdminCabanasManager({ cabanas }: { cabanas: Cabana[] }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sorted = useMemo(() => [...cabanas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)), [cabanas])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const method = form.id ? 'PATCH' : 'POST'
      const res = await fetch('/api/admin/cabanas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la cabaña.')
      setForm(emptyForm)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Catálogo</p>
          <h1 className="font-display text-3xl text-lago-900">Cabañas</h1>
        </div>
        <button onClick={() => setForm(emptyForm)} className="btn-outline px-4 py-2 text-xs">
          <Plus size={15} />Nueva cabaña
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {sorted.map((cabana) => (
            <button
              key={cabana.id}
              onClick={() => setForm(formFromCabana(cabana))}
              className="w-full rounded-lg border border-arena-100 bg-white p-4 text-left hover:border-lago-300"
            >
              <div className="flex gap-4">
                <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-lago-50">
                  {cabana.fotos?.[0] ? (
                    <img src={cabana.fotos[0]} alt={cabana.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lago-400"><Home size={20} /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-lago-900">{cabana.nombre}</p>
                    <Edit3 size={14} className="text-volcan-400" />
                  </div>
                  <p className="mt-1 text-xs text-volcan-500">{cabana.capacidad} personas · {formatCLP(Number(cabana.precio_noche ?? 0))}/noche</p>
                  <p className="mt-1 text-xs text-volcan-400">{cabana.activa ? 'Visible en web' : 'Oculta'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-arena-100 bg-white p-5">
          <h2 className="font-display text-2xl text-lago-900 mb-5">{form.id ? 'Editar cabaña' : 'Nueva cabaña'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre" value={form.nombre} onChange={(value) => update('nombre', value)} />
            <Field label="Slug" value={form.slug} onChange={(value) => update('slug', value)} />
            <Field label="Subtitulo" value={form.subtitulo} onChange={(value) => update('subtitulo', value)} />
            <Field label="Camas" value={form.camas} onChange={(value) => update('camas', value)} />
            <Field label="Capacidad" type="number" value={form.capacidad} onChange={(value) => update('capacidad', value)} />
            <Field label="Huéspedes base" type="number" value={form.base_huespedes} onChange={(value) => update('base_huespedes', value)} />
            <Field label="Dormitorios" type="number" value={form.dormitorios} onChange={(value) => update('dormitorios', value)} />
            <Field label="Baños" type="number" value={form.banos} onChange={(value) => update('banos', value)} />
            <Field label="M2" type="number" value={form.metros_cuadrados} onChange={(value) => update('metros_cuadrados', value)} />
            <Field label="Min noches" type="number" value={form.min_noches} onChange={(value) => update('min_noches', value)} />
            <Field label="Precio noche" type="number" value={form.precio_noche} onChange={(value) => update('precio_noche', value)} />
            <Field label="Limpieza" type="number" value={form.precio_limpieza} onChange={(value) => update('precio_limpieza', value)} />
            <Field label="Huésped extra" type="number" value={form.precio_huesped_extra} onChange={(value) => update('precio_huesped_extra', value)} />
            <Field label="Orden" type="number" value={form.orden} onChange={(value) => update('orden', value)} />
            <Field label="Check-in" value={form.check_in_hora} onChange={(value) => update('check_in_hora', value)} />
            <Field label="Check-out" value={form.check_out_hora} onChange={(value) => update('check_out_hora', value)} />
          </div>

          <div className="mt-4 grid gap-4">
            <Area label="Descripcion corta" value={form.descripcion_corta} onChange={(value) => update('descripcion_corta', value)} />
            <Area label="Descripcion" value={form.descripcion} onChange={(value) => update('descripcion', value)} />
            <Area label="Amenidades (una por linea)" value={form.amenidades} onChange={(value) => update('amenidades', value)} />
            <Area label="Fotos URL (una por linea, ideal 2 a 3)" value={form.fotos} onChange={(value) => update('fotos', value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-lago-800">
              <input type="checkbox" checked={form.activa} onChange={(event) => update('activa', event.target.checked)} />
              Visible en web
            </label>
            <label className="flex items-center gap-2 text-sm text-lago-800">
              <input type="checkbox" checked={form.destacada} onChange={(event) => update('destacada', event.target.checked)} />
              Destacada
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={loading || !form.nombre} className="btn-primary mt-5 w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar cabaña'}
          </button>
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
