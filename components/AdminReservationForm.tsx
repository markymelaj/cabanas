'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { calcCabanaPrice, formatCLP } from '@/lib/pricing'

export default function AdminReservationForm({ cabanas }: { cabanas: Cabana[] }) {
  const router = useRouter()
  const first = cabanas[0]
  const [form, setForm] = useState({
    cabana_id: first?.id ?? '',
    check_in: '',
    check_out: '',
    guests: String(first?.base_huespedes ?? 2),
    status: 'standby',
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
    direccion: '',
    precio_noche: String(first?.precio_noche ?? 0),
    precio_limpieza: String(first?.precio_limpieza ?? 0),
    base_huespedes: String(first?.base_huespedes ?? first?.capacidad ?? 2),
    extra_guest_fee: String(first?.precio_huesped_extra ?? 0),
    adjustment_amount: '0',
    adjustment_note: '',
    total_amount: '',
    anticipo_monto: '',
    internal_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCabana = cabanas.find((cabana) => cabana.id === form.cabana_id) ?? first

  const pricing = useMemo(() => {
    if (!form.check_in || !form.check_out) return null
    return calcCabanaPrice(
      new Date(`${form.check_in}T12:00:00`),
      new Date(`${form.check_out}T12:00:00`),
      Number(form.precio_noche || 0),
      Number(form.precio_limpieza || 0),
      {
        guests: Number(form.guests || 0),
        baseGuests: Number(form.base_huespedes || 0),
        extraGuestFee: Number(form.extra_guest_fee || 0),
        adjustment: Number(form.adjustment_amount || 0),
      }
    )
  }, [form])

  function update(key: string, value: string) {
    if (key === 'cabana_id') {
      const cabana = cabanas.find((item) => item.id === value)
      setForm((current) => ({
        ...current,
        cabana_id: value,
        guests: String(cabana?.base_huespedes ?? cabana?.capacidad ?? current.guests),
        precio_noche: String(cabana?.precio_noche ?? current.precio_noche),
        precio_limpieza: String(cabana?.precio_limpieza ?? current.precio_limpieza),
        base_huespedes: String(cabana?.base_huespedes ?? cabana?.capacidad ?? current.base_huespedes),
        extra_guest_fee: String(cabana?.precio_huesped_extra ?? current.extra_guest_fee),
      }))
      return
    }
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabana_id: form.cabana_id,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          status: form.status,
          precio_noche: form.precio_noche,
          precio_limpieza: form.precio_limpieza,
          base_guests: form.base_huespedes,
          extra_guest_fee: form.extra_guest_fee,
          adjustment_amount: form.adjustment_amount,
          adjustment_note: form.adjustment_note,
          total_amount: form.total_amount || pricing?.total,
          anticipo_monto: form.anticipo_monto || pricing?.anticipo,
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
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la reserva.')
      router.push(`/admin/reservas/${data.reservationId}`)
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
        <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Reservas cabanas</p>
        <h1 className="font-display text-3xl text-lago-900">Crear reserva manual</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="rounded-lg border border-arena-100 bg-white p-5 space-y-5">
          <Section title="Estadia">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="label-text">Cabana</span>
                <select value={form.cabana_id} onChange={(event) => update('cabana_id', event.target.value)} className="input-field">
                  {cabanas.map((cabana) => <option key={cabana.id} value={cabana.id}>{cabana.nombre}</option>)}
                </select>
              </label>
              <Field label="Huespedes" type="number" value={form.guests} onChange={(value) => update('guests', value)} />
              <Field label="Check-in" type="date" value={form.check_in} onChange={(value) => update('check_in', value)} />
              <Field label="Check-out" type="date" value={form.check_out} onChange={(value) => update('check_out', value)} />
              <label>
                <span className="label-text">Estado</span>
                <select value={form.status} onChange={(event) => update('status', event.target.value)} className="input-field">
                  <option value="standby">Standby con alerta</option>
                  <option value="confirmed">Confirmada</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Cliente">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre" value={form.nombre} onChange={(value) => update('nombre', value)} />
              <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
              <Field label="Telefono" value={form.telefono} onChange={(value) => update('telefono', value)} />
              <Field label="Documento" value={form.documento} onChange={(value) => update('documento', value)} />
              <label className="md:col-span-2">
                <span className="label-text">Direccion</span>
                <input value={form.direccion} onChange={(event) => update('direccion', event.target.value)} className="input-field" />
              </label>
            </div>
          </Section>

          <Section title="Precio">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Precio noche" type="number" value={form.precio_noche} onChange={(value) => update('precio_noche', value)} />
              <Field label="Limpieza" type="number" value={form.precio_limpieza} onChange={(value) => update('precio_limpieza', value)} />
              <Field label="Huespedes base" type="number" value={form.base_huespedes} onChange={(value) => update('base_huespedes', value)} />
              <Field label="Extra por huesped" type="number" value={form.extra_guest_fee} onChange={(value) => update('extra_guest_fee', value)} />
              <Field label="Ajuste +/-" type="number" value={form.adjustment_amount} onChange={(value) => update('adjustment_amount', value)} />
              <Field label="Total manual" type="number" value={form.total_amount} onChange={(value) => update('total_amount', value)} />
              <Field label="Anticipo" type="number" value={form.anticipo_monto} onChange={(value) => update('anticipo_monto', value)} />
              <label className="md:col-span-2">
                <span className="label-text">Motivo ajuste</span>
                <input value={form.adjustment_note} onChange={(event) => update('adjustment_note', event.target.value)} className="input-field" />
              </label>
            </div>
          </Section>

          <Section title="Notas internas">
            <textarea value={form.internal_notes} onChange={(event) => update('internal_notes', event.target.value)} className="input-field min-h-24" />
          </Section>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={loading || !form.cabana_id || !form.check_in || !form.check_out || !form.nombre || !form.email} className="btn-primary w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Creando</> : 'Crear reserva'}
          </button>
        </div>

        <div className="rounded-lg border border-arena-100 bg-white p-5 h-fit">
          <h2 className="font-display text-2xl text-lago-900">{selectedCabana?.nombre ?? 'Cabana'}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Line label="Noches" value={pricing?.noches ?? '-'} />
            <Line label="Subtotal noches" value={pricing ? formatCLP(pricing.subtotalNoches) : '-'} />
            <Line label="Extra huespedes" value={pricing ? formatCLP(pricing.extraHuespedes) : '-'} />
            <Line label="Limpieza" value={pricing ? formatCLP(pricing.limpieza) : '-'} />
            <Line label="Ajuste" value={pricing ? formatCLP(pricing.ajuste) : '-'} />
          </div>
          <div className="mt-4 border-t border-arena-100 pt-4">
            <Line label="Total" value={formatCLP(Number(form.total_amount || pricing?.total || 0))} strong />
            <Line label="Anticipo" value={formatCLP(Number(form.anticipo_monto || pricing?.anticipo || 0))} />
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Standby queda con alerta y no bloquea firme. Confirmada bloquea disponibilidad.
          </p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-lago-900 mb-3">{title}</h2>
      {children}
    </section>
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

function Line({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'font-semibold text-lago-900' : 'text-volcan-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
