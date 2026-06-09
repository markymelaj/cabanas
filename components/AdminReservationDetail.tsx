'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader2, Printer } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { calcCabanaPrice, formatCLP } from '@/lib/pricing'
import AdminPaymentForm from '@/components/AdminPaymentForm'
import AdminNotesPanel from '@/components/AdminNotesPanel'
import AdminAIAssistant from '@/components/AdminAIAssistant'

type Payment = {
  id: string
  amount: number
  method: string
  paid_at: string
  note: string | null
  voucher_path: string | null
  voucher_name: string | null
}

export default function AdminReservationDetail({
  reservation,
  cabanas,
  payments,
  notes,
  baseUrl,
}: {
  reservation: any
  cabanas: Cabana[]
  payments: Payment[]
  notes: any[]
  baseUrl: string
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    cabana_id: reservation.cabana_id ?? '',
    check_in: reservation.check_in ?? '',
    check_out: reservation.check_out ?? '',
    guests: String(reservation.guests ?? 1),
    status: reservation.status ?? 'standby',
    precio_noche: String(reservation.precio_noche ?? 0),
    precio_limpieza: String(reservation.precio_limpieza ?? 0),
    base_guests: String(reservation.base_guests ?? reservation.guests ?? 1),
    extra_guest_fee: String(reservation.extra_guest_fee ?? 0),
    adjustment_amount: String(reservation.adjustment_amount ?? 0),
    adjustment_note: reservation.adjustment_note ?? '',
    total_amount: String(reservation.total_amount ?? 0),
    anticipo_monto: String(reservation.anticipo_monto ?? 0),
    internal_notes: reservation.internal_notes ?? '',
    arrival_time: reservation.arrival_time ?? '',
    vehicle_plate: reservation.vehicle_plate ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkinUrl = `${baseUrl}/check-in/${reservation.checkin_token}`

  const pricing = useMemo(() => {
    if (!form.check_in || !form.check_out) return null
    return calcCabanaPrice(
      new Date(`${form.check_in}T12:00:00`),
      new Date(`${form.check_out}T12:00:00`),
      Number(form.precio_noche || 0),
      Number(form.precio_limpieza || 0),
      {
        guests: Number(form.guests || 0),
        baseGuests: Number(form.base_guests || 0),
        extraGuestFee: Number(form.extra_guest_fee || 0),
        adjustment: Number(form.adjustment_amount || 0),
      }
    )
  }, [form])

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservation.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la reserva.')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(status: string) {
    setStatusLoading(true)
    try {
      const res = await fetch('/api/admin/update-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar estado.')
      setForm((current) => ({ ...current, status }))
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  async function copyCheckin() {
    await navigator.clipboard.writeText(checkinUrl)
  }

  const paid = Number(reservation.paid_amount ?? payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0))
  const total = Number(form.total_amount || reservation.total_amount || 0)
  const balance = Math.max(total - paid, 0)

  return (
    <div className="space-y-6 print:bg-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Ficha reserva</p>
          <h1 className="font-display text-3xl text-lago-900">{reservation.client_nombre ?? 'Sin nombre'}</h1>
          <p className="text-sm text-volcan-500">#{reservation.id.slice(0, 8).toUpperCase()} · {reservation.cabana_nombre ?? 'Cabaña'}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button onClick={() => window.print()} className="btn-outline px-4 py-2 text-xs"><Printer size={15} />Imprimir</button>
          <button onClick={copyCheckin} className="btn-outline px-4 py-2 text-xs"><Copy size={15} />Copiar check-in</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Total" value={formatCLP(total)} />
        <Metric label="Pagado" value={formatCLP(paid)} />
        <Metric label="Saldo" value={formatCLP(balance)} />
        <Metric label="Check-in" value={reservation.checkin_status ?? 'pending'} />
      </div>

      {reservation.hold_alert && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Esta reserva está en standby o tiene alerta de bloqueo. Confirma solo si ya validaste disponibilidad.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="rounded-lg border border-arena-100 bg-white p-5 space-y-5">
          <Section title="Reserva">
            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="label-text">Cabaña</span>
                <select value={form.cabana_id} onChange={(event) => update('cabana_id', event.target.value)} className="input-field">
                  {cabanas.map((cabana) => <option key={cabana.id} value={cabana.id}>{cabana.nombre}</option>)}
                </select>
              </label>
              <Field label="Check-in" type="date" value={form.check_in} onChange={(value) => update('check_in', value)} />
              <Field label="Check-out" type="date" value={form.check_out} onChange={(value) => update('check_out', value)} />
              <Field label="Huéspedes" type="number" value={form.guests} onChange={(value) => update('guests', value)} />
              <label>
                <span className="label-text">Estado</span>
                <select value={form.status} onChange={(event) => update('status', event.target.value)} className="input-field">
                  <option value="standby">Standby</option>
                  <option value="pending">Pendiente web</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Check-out</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no_show">No show</option>
                </select>
              </label>
              <Field label="Llegada" value={form.arrival_time} onChange={(value) => update('arrival_time', value)} />
              <Field label="Patente" value={form.vehicle_plate} onChange={(value) => update('vehicle_plate', value)} />
            </div>
          </Section>

          <Section title="Precio">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Precio noche" type="number" value={form.precio_noche} onChange={(value) => update('precio_noche', value)} />
              <Field label="Limpieza" type="number" value={form.precio_limpieza} onChange={(value) => update('precio_limpieza', value)} />
              <Field label="Huéspedes base" type="number" value={form.base_guests} onChange={(value) => update('base_guests', value)} />
              <Field label="Extra huésped" type="number" value={form.extra_guest_fee} onChange={(value) => update('extra_guest_fee', value)} />
              <Field label="Ajuste +/-" type="number" value={form.adjustment_amount} onChange={(value) => update('adjustment_amount', value)} />
              <Field label="Total" type="number" value={form.total_amount} onChange={(value) => update('total_amount', value)} />
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

          {pricing && (
            <div className="rounded-lg bg-arena-50 p-4 text-sm">
              <Line label="Noches" value={pricing.noches} />
              <Line label="Subtotal" value={formatCLP(pricing.subtotalNoches)} />
              <Line label="Extra huéspedes" value={formatCLP(pricing.extraHuespedes)} />
              <Line label="Limpieza" value={formatCLP(pricing.limpieza)} />
              <Line label="Ajuste" value={formatCLP(pricing.ajuste)} />
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={save} disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar cambios'}
          </button>
        </div>

        <div className="space-y-5">
          <AdminAIAssistant reservationId={reservation.id} />

          <div className="rounded-lg border border-arena-100 bg-white p-5 print:hidden">
            <h3 className="font-display text-xl text-lago-900 mb-3">Acciones</h3>
            <div className="grid gap-2">
              <button onClick={() => setStatus('confirmed')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Confirmar</button>
              <button onClick={() => setStatus('checked_in')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Hacer check-in</button>
              <button onClick={() => setStatus('checked_out')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Check-out</button>
              <button onClick={() => setStatus('completed')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Completar</button>
            </div>
          </div>

          <div className="rounded-lg border border-arena-100 bg-white p-5">
            <h3 className="font-display text-xl text-lago-900 mb-3">Cliente</h3>
            <div className="space-y-1 text-sm">
              <Line label="Nombre" value={reservation.client_nombre ?? '-'} />
              <Line label="Email" value={reservation.client_email ?? '-'} />
              <Line label="Teléfono" value={reservation.client_telefono ?? '-'} />
              <Line label="Documento" value={reservation.client_documento ?? '-'} />
            </div>
          </div>

          <AdminPaymentForm reservationId={reservation.id} clientId={reservation.client_id} />
          <PaymentsList payments={payments} />
          <AdminNotesPanel notes={notes} clientId={reservation.client_id} reservationId={reservation.id} />
        </div>
      </div>
    </div>
  )
}

function PaymentsList({ payments }: { payments: Payment[] }) {
  return (
    <div className="bg-white border border-arena-100 rounded-lg p-5">
      <h3 className="font-display text-xl text-lago-900 mb-3">Pagos</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-volcan-500">Sin pagos registrados.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-lg bg-arena-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-lago-900">{formatCLP(Number(payment.amount ?? 0))}</span>
                <span className="text-volcan-500">{payment.method}</span>
              </div>
              <p className="text-xs text-volcan-400">{new Date(payment.paid_at).toLocaleDateString('es-CL')}</p>
              {payment.note && <p className="mt-1 text-xs text-volcan-600">{payment.note}</p>}
              {payment.voucher_path && (
                <a href={`/api/admin/payments/voucher?path=${encodeURIComponent(payment.voucher_path)}`} target="_blank" className="mt-2 inline-flex text-xs font-medium text-lago-700 hover:text-lago-900">
                  Ver comprobante {payment.voucher_name ? `(${payment.voucher_name})` : ''}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-arena-100 bg-white p-4">
      <p className="text-xs text-volcan-500">{label}</p>
      <p className="mt-1 font-display text-2xl text-lago-900">{value}</p>
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
      <span className="text-right">{value}</span>
    </div>
  )
}
