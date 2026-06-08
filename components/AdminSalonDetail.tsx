'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Printer } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'
import AdminPaymentForm from '@/components/AdminPaymentForm'
import AdminNotesPanel from '@/components/AdminNotesPanel'

type Service = {
  id: string
  nombre: string
  precio: number
  precio_por_persona: boolean
  activa: boolean
}

export default function AdminSalonDetail({
  event,
  client,
  settings,
  services,
  payments,
  notes,
}: {
  event: any
  client: any
  settings: any
  services: Service[]
  payments: any[]
  notes: any[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    fecha_evento: event.fecha_evento ?? '',
    tipo_evento: event.tipo_evento ?? '',
    num_invitados: String(event.num_invitados ?? 1),
    horario: event.horario ?? 'completo',
    servicios: (event.servicios ?? []) as string[],
    status: event.status ?? 'reservada',
    adjustment_amount: String(event.adjustment_amount ?? 0),
    total_amount: String(event.total_amount ?? event.monto_estimado ?? 0),
    mensaje: event.mensaje ?? '',
    notas_admin: event.notas_admin ?? '',
    internal_notes: event.internal_notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
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

  async function save() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/salon-events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el evento.')
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
      const res = await fetch('/api/admin/update-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: event.id, status }),
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

  const paid = Number(event.paid_amount ?? payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0))
  const total = Number(form.total_amount || event.total_amount || event.monto_estimado || 0)
  const balance = Math.max(total - paid, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Ficha salon</p>
          <h1 className="font-display text-3xl text-lago-900">{client?.nombre ?? 'Evento'}</h1>
          <p className="text-sm text-volcan-500">#{event.id.slice(0, 8).toUpperCase()} · {event.tipo_evento}</p>
        </div>
        <button onClick={() => window.print()} className="btn-outline px-4 py-2 text-xs print:hidden"><Printer size={15} />Imprimir</button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Total" value={formatCLP(total)} />
        <Metric label="Pagado" value={formatCLP(paid)} />
        <Metric label="Saldo" value={formatCLP(balance)} />
        <Metric label="Estado" value={form.status} />
      </div>

      {event.hold_alert && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Evento en reserva standby o con alerta de fecha. Confirmar solo al validar agenda.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="rounded-lg border border-arena-100 bg-white p-5 space-y-5">
          <Section title="Evento">
            <div className="grid gap-4 md:grid-cols-3">
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
                  <option value="nueva">Nueva</option>
                  <option value="contactada">Contactada</option>
                  <option value="cotizada">Cotizada</option>
                  <option value="reservada">Reservada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="pagada">Pagada</option>
                  <option value="realizada">Realizada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Servicios">
            <div className="grid gap-2 md:grid-cols-2">
              {services.map((service) => (
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

          <Section title="Precio y notas">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Ajuste +/-" type="number" value={form.adjustment_amount} onChange={(value) => setForm({ ...form, adjustment_amount: value })} />
              <Field label="Total" type="number" value={form.total_amount} onChange={(value) => setForm({ ...form, total_amount: value })} />
            </div>
            <textarea value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} className="input-field min-h-20 mt-4" />
            <textarea value={form.internal_notes} onChange={(event) => setForm({ ...form, internal_notes: event.target.value })} className="input-field min-h-20 mt-4" />
          </Section>

          <div className="rounded-lg bg-arena-50 p-4 text-sm">
            <Line label="Base" value={formatCLP(pricing.base)} />
            <Line label="Servicios" value={formatCLP(pricing.extras)} />
            <Line label="Total" value={formatCLP(pricing.total)} strong />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button onClick={save} disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar cambios'}
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-arena-100 bg-white p-5 print:hidden">
            <h3 className="font-display text-xl text-lago-900 mb-3">Acciones</h3>
            <div className="grid gap-2">
              <button onClick={() => setStatus('contactada')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Contactada</button>
              <button onClick={() => setStatus('cotizada')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Cotizada</button>
              <button onClick={() => setStatus('confirmada')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Confirmar</button>
              <button onClick={() => setStatus('realizada')} disabled={statusLoading} className="btn-outline px-4 py-2 text-xs">Realizada</button>
            </div>
          </div>
          <div className="rounded-lg border border-arena-100 bg-white p-5">
            <h3 className="font-display text-xl text-lago-900 mb-3">Cliente</h3>
            <div className="space-y-1 text-sm">
              <Line label="Nombre" value={client?.nombre ?? '-'} />
              <Line label="Email" value={client?.email ?? '-'} />
              <Line label="Telefono" value={client?.telefono ?? '-'} />
            </div>
          </div>
          <AdminPaymentForm salonQuoteId={event.id} clientId={event.client_id} />
          <PaymentsList payments={payments} />
          <AdminNotesPanel notes={notes} clientId={event.client_id} salonQuoteId={event.id} />
        </div>
      </div>
    </div>
  )
}

function PaymentsList({ payments }: { payments: any[] }) {
  return (
    <div className="bg-white border border-arena-100 rounded-lg p-5">
      <h3 className="font-display text-xl text-lago-900 mb-3">Pagos</h3>
      {payments.length === 0 ? <p className="text-sm text-volcan-500">Sin pagos registrados.</p> : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-lg bg-arena-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-lago-900">{formatCLP(Number(payment.amount ?? 0))}</span>
                <span className="text-volcan-500">{payment.method}</span>
              </div>
              <p className="text-xs text-volcan-400">{new Date(payment.paid_at).toLocaleDateString('es-CL')}</p>
              {payment.voucher_path && (
                <a href={`/api/admin/payments/voucher?path=${encodeURIComponent(payment.voucher_path)}`} target="_blank" className="mt-2 inline-flex text-xs font-medium text-lago-700 hover:text-lago-900">
                  Ver comprobante
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
  return <div className="rounded-lg border border-arena-100 bg-white p-4"><p className="text-xs text-volcan-500">{label}</p><p className="mt-1 font-display text-2xl text-lago-900">{value}</p></div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="font-display text-xl text-lago-900 mb-3">{title}</h2>{children}</section>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="label-text">{label}</span><input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="input-field" /></label>
}

function Line({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'font-semibold text-lago-900' : 'text-volcan-600'}`}><span>{label}</span><span className="text-right">{value}</span></div>
}
