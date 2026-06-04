'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Home, ListFilter, Search, Users } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'
import AdminReservationActions from '@/components/AdminReservationActions'

type ReservationRow = {
  id: string
  cabana_id: string | null
  cabana_nombre: string | null
  cabana_slug: string | null
  client_nombre: string | null
  client_email: string | null
  client_telefono: string | null
  check_in: string
  check_out: string
  guests: number
  noches: number
  total_amount: number
  anticipo_monto: number | null
  status: string
  payment_status: string
  notas: string | null
  created_at: string
  updated_at?: string | null
}

type Props = {
  reservas: ReservationRow[]
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmada', classes: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelada', classes: 'bg-red-100 text-red-700 border-red-200' },
  no_show: { label: 'No show', classes: 'bg-volcan-100 text-volcan-700 border-volcan-200' },
}

function fmtDate(value: string) {
  return format(new Date(`${value}T12:00:00`), "d MMM yyyy", { locale: es })
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function includesStayDay(row: ReservationRow, day: string) {
  if (!day) return true
  const target = new Date(`${day}T12:00:00`).getTime()
  const checkIn = new Date(`${row.check_in}T12:00:00`).getTime()
  const checkOut = new Date(`${row.check_out}T12:00:00`).getTime()
  return target >= checkIn && target < checkOut
}

function normalize(value: unknown) {
  return String(value ?? '').toLowerCase().trim()
}

export default function AdminReservationsTable({ reservas }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [stayDay, setStayDay] = useState('')
  const [cabana, setCabana] = useState('')
  const [sort, setSort] = useState('newest')

  const cabanaOptions = useMemo(() => {
    const names = new Set<string>()
    reservas.forEach((row) => {
      const name = row.cabana_nombre ?? row.notas ?? 'Cabana solicitada'
      names.add(name)
    })
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'es'))
  }, [reservas])

  const filtered = useMemo(() => {
    const q = normalize(query)
    const rows = reservas.filter((row) => {
      const cabanaName = row.cabana_nombre ?? row.notas ?? 'Cabana solicitada'
      const haystack = [
        row.id,
        shortId(row.id),
        row.client_nombre,
        row.client_email,
        row.client_telefono,
        cabanaName,
        row.check_in,
        row.check_out,
        row.status,
        row.total_amount,
      ].map(normalize).join(' ')

      return (
        (!q || haystack.includes(q)) &&
        (!status || row.status === status) &&
        (!cabana || cabanaName === cabana) &&
        includesStayDay(row, stayDay)
      )
    })

    return rows.sort((a, b) => {
      if (sort === 'checkin') return a.check_in.localeCompare(b.check_in)
      if (sort === 'total') return Number(b.total_amount ?? 0) - Number(a.total_amount ?? 0)
      if (sort === 'status') return a.status.localeCompare(b.status)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [reservas, query, status, stayDay, cabana, sort])

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      total: filtered.length,
      pending: filtered.filter((row) => row.status === 'pending').length,
      confirmed: filtered.filter((row) => row.status === 'confirmed').length,
      today: filtered.filter((row) => includesStayDay(row, today)).length,
      amount: filtered.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0),
    }
  }, [filtered])

  function clearFilters() {
    setQuery('')
    setStatus('')
    setStayDay('')
    setCabana('')
    setSort('newest')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Cabanas</p>
          <h1 className="font-display text-3xl text-lago-900">Reservas de cabanas</h1>
        </div>
        <p className="text-sm text-volcan-500">{filtered.length} visibles de {reservas.length} solicitudes</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <Metric label="Visibles" value={metrics.total} icon={ListFilter} />
        <Metric label="Pendientes" value={metrics.pending} icon={CalendarDays} />
        <Metric label="Confirmadas" value={metrics.confirmed} icon={Home} />
        <Metric label="En curso hoy" value={metrics.today} icon={Users} />
        <Metric label="Total filtrado" value={formatCLP(metrics.amount)} icon={CalendarDays} wide />
      </div>

      <div className="bg-white border border-arena-100 rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_0.9fr_auto]">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-volcan-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, telefono, email o codigo"
              className="input-field pl-9"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-field">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No show</option>
          </select>
          <input
            type="date"
            value={stayDay}
            onChange={(event) => setStayDay(event.target.value)}
            className="input-field"
            aria-label="Filtrar por dia de estadia"
          />
          <select value={cabana} onChange={(event) => setCabana(event.target.value)} className="input-field">
            <option value="">Todas las cabanas</option>
            {cabanaOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-field">
            <option value="newest">Nuevas primero</option>
            <option value="checkin">Check-in proximo</option>
            <option value="status">Estado</option>
            <option value="total">Mayor monto</option>
          </select>
          <button onClick={clearFilters} className="btn-outline px-4 py-3 whitespace-nowrap">
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white border border-arena-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-arena-100 bg-arena-50">
                <Th>Solicitud</Th>
                <Th>Estadia</Th>
                <Th>Contacto</Th>
                <Th>Monto</Th>
                <Th>Seguimiento</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-100">
              {filtered.map((row) => {
                const st = STATUS_LABELS[row.status] ?? STATUS_LABELS.pending
                const cabanaName = row.cabana_nombre ?? row.notas ?? 'Cabana solicitada'
                return (
                  <tr key={row.id} className="align-top hover:bg-arena-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-lago-900">{row.client_nombre ?? 'Sin nombre'}</p>
                      <p className="font-mono text-[11px] text-volcan-500 mt-1">#{shortId(row.id)}</p>
                      <p className="text-xs text-volcan-400 mt-1">Ingreso: {fmtDate(row.created_at.slice(0, 10))}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-lago-800">{cabanaName}</p>
                      <p className="text-xs text-volcan-500 mt-1">{fmtDate(row.check_in)} a {fmtDate(row.check_out)}</p>
                      <p className="text-xs text-volcan-400 mt-1">{row.noches} noche{row.noches === 1 ? '' : 's'} · {row.guests} huespedes</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-lago-900">{row.client_email ?? 'Sin email'}</p>
                      <p className="text-xs text-volcan-500 mt-1">{row.client_telefono ?? 'Sin telefono'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-lago-900">{formatCLP(row.total_amount ?? 0)}</p>
                      <p className="text-xs text-volcan-400 mt-1">Anticipo: {formatCLP(row.anticipo_monto ?? 0)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${st.classes}`}>
                        {st.label}
                      </span>
                      <p className="text-xs text-volcan-400 mt-2">Pago: {row.payment_status ?? 'pendiente'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <AdminReservationActions
                        reservationId={row.id}
                        status={row.status}
                        nombre={row.client_nombre ?? ''}
                        telefono={row.client_telefono ?? ''}
                        cabanaNombre={cabanaName}
                        checkIn={row.check_in}
                        checkOut={row.check_out}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-volcan-500">No hay reservas con esos filtros.</div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, wide = false }: { label: string; value: string | number; icon: any; wide?: boolean }) {
  return (
    <div className={`bg-white border border-arena-100 rounded-lg p-4 ${wide ? 'col-span-2 xl:col-span-1' : ''}`}>
      <Icon size={17} className="text-lago-600 mb-3" />
      <p className="text-xs text-volcan-500">{label}</p>
      <p className="font-display text-2xl text-lago-900 mt-1">{value}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-5 py-3 text-xs font-medium text-volcan-500 uppercase tracking-wide">
      {children}
    </th>
  )
}
