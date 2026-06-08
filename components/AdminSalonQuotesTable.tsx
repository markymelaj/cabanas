'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ListFilter, PartyPopper, Search, Users } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'
import AdminQuoteActions from '@/components/AdminQuoteActions'

type ClientInfo = {
  nombre?: string | null
  email?: string | null
  telefono?: string | null
}

type QuoteRow = {
  id: string
  fecha_evento: string
  tipo_evento: string
  num_invitados: number
  horario: string
  servicios: string[] | null
  monto_estimado: number | null
  mensaje: string | null
  status: string
  notas_admin: string | null
  created_at: string
  updated_at?: string | null
  clients?: ClientInfo | ClientInfo[] | null
}

type Props = {
  quotes: QuoteRow[]
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  nueva: { label: 'Nueva', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  contactada: { label: 'Contactada', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
  cotizada: { label: 'Cotizada', classes: 'bg-lago-100 text-lago-800 border-lago-200' },
  reservada: { label: 'Reservada', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmada: { label: 'Confirmada', classes: 'bg-green-100 text-green-800 border-green-200' },
  pagada: { label: 'Pagada', classes: 'bg-green-50 text-green-700 border-green-200' },
  realizada: { label: 'Realizada', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  rechazada: { label: 'Rechazada', classes: 'bg-red-100 text-red-700 border-red-200' },
  cancelada: { label: 'Cancelada', classes: 'bg-red-50 text-red-700 border-red-200' },
}

function clientOf(row: QuoteRow): ClientInfo {
  if (Array.isArray(row.clients)) return row.clients[0] ?? {}
  return row.clients ?? {}
}

function fmtDate(value: string) {
  return format(new Date(`${value}T12:00:00`), "d MMM yyyy", { locale: es })
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function normalize(value: unknown) {
  return String(value ?? '').toLowerCase().trim()
}

export default function AdminSalonQuotesTable({ quotes }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [eventDay, setEventDay] = useState('')
  const [eventType, setEventType] = useState('')
  const [schedule, setSchedule] = useState('')
  const [sort, setSort] = useState('newest')

  const eventTypes = useMemo(() => {
    return Array.from(new Set(quotes.map((row) => row.tipo_evento).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
  }, [quotes])

  const filtered = useMemo(() => {
    const q = normalize(query)
    const rows = quotes.filter((row) => {
      const client = clientOf(row)
      const haystack = [
        row.id,
        shortId(row.id),
        client.nombre,
        client.email,
        client.telefono,
        row.tipo_evento,
        row.horario,
        row.fecha_evento,
        row.num_invitados,
        row.mensaje,
        row.servicios?.join(' '),
      ].map(normalize).join(' ')

      return (
        (!q || haystack.includes(q)) &&
        (!status || row.status === status) &&
        (!eventDay || row.fecha_evento === eventDay) &&
        (!eventType || row.tipo_evento === eventType) &&
        (!schedule || row.horario === schedule)
      )
    })

    return rows.sort((a, b) => {
      if (sort === 'eventDate') return a.fecha_evento.localeCompare(b.fecha_evento)
      if (sort === 'guests') return Number(b.num_invitados ?? 0) - Number(a.num_invitados ?? 0)
      if (sort === 'amount') return Number(b.monto_estimado ?? 0) - Number(a.monto_estimado ?? 0)
      if (sort === 'status') return a.status.localeCompare(b.status)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [quotes, query, status, eventDay, eventType, schedule, sort])

  const metrics = useMemo(() => {
    return {
      total: filtered.length,
      nuevas: filtered.filter((row) => row.status === 'nueva').length,
      contactadas: filtered.filter((row) => row.status === 'contactada').length,
      confirmadas: filtered.filter((row) => row.status === 'confirmada').length,
      amount: filtered.reduce((sum, row) => sum + Number(row.monto_estimado ?? 0), 0),
    }
  }, [filtered])

  function clearFilters() {
    setQuery('')
    setStatus('')
    setEventDay('')
    setEventType('')
    setSchedule('')
    setSort('newest')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Salon</p>
          <h1 className="font-display text-3xl text-lago-900">Cotizaciones salon</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-volcan-500">{filtered.length} visibles de {quotes.length} solicitudes</p>
          <Link href="/admin/salon/nuevo" className="btn-primary px-4 py-2 text-xs">Nuevo evento</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <Metric label="Visibles" value={metrics.total} icon={ListFilter} />
        <Metric label="Nuevas" value={metrics.nuevas} icon={PartyPopper} />
        <Metric label="Contactadas" value={metrics.contactadas} icon={Users} />
        <Metric label="Confirmadas" value={metrics.confirmadas} icon={CalendarDays} />
        <Metric label="Estimado filtrado" value={formatCLP(metrics.amount)} icon={PartyPopper} wide />
      </div>

      <div className="bg-white border border-arena-100 rounded-lg p-4">
        <div className="grid gap-3 xl:grid-cols-[1.3fr_0.8fr_0.8fr_1fr_0.8fr_0.9fr_auto]">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-volcan-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, telefono, email, codigo o evento"
              className="input-field pl-9"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-field">
            <option value="">Todos los estados</option>
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
          <input
            type="date"
            value={eventDay}
            onChange={(event) => setEventDay(event.target.value)}
            className="input-field"
            aria-label="Filtrar por fecha del evento"
          />
          <select value={eventType} onChange={(event) => setEventType(event.target.value)} className="input-field">
            <option value="">Todos los eventos</option>
            {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={schedule} onChange={(event) => setSchedule(event.target.value)} className="input-field">
            <option value="">Todo horario</option>
            <option value="completo">Completo</option>
            <option value="medio">Medio dia</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-field">
            <option value="newest">Nuevas primero</option>
            <option value="eventDate">Fecha evento</option>
            <option value="guests">Mas invitados</option>
            <option value="amount">Mayor monto</option>
            <option value="status">Estado</option>
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
                <Th>Evento</Th>
                <Th>Contacto</Th>
                <Th>Estimado</Th>
                <Th>Seguimiento</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-100">
              {filtered.map((row) => {
                const client = clientOf(row)
                const st = STATUS_LABELS[row.status] ?? STATUS_LABELS.nueva
                return (
                  <tr key={row.id} className="align-top hover:bg-arena-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/salon/${row.id}`} className="font-medium text-lago-900 hover:text-lago-700">
                        {client.nombre ?? 'Sin nombre'}
                      </Link>
                      <p className="font-mono text-[11px] text-volcan-500 mt-1">#{shortId(row.id)}</p>
                      <p className="text-xs text-volcan-400 mt-1">Ingreso: {fmtDate(row.created_at.slice(0, 10))}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-lago-800">{row.tipo_evento}</p>
                      <p className="text-xs text-volcan-500 mt-1">{fmtDate(row.fecha_evento)} · {row.num_invitados} invitados</p>
                      <p className="text-xs text-volcan-400 mt-1">{row.horario === 'completo' ? 'Jornada completa' : 'Media jornada'}</p>
                      {row.servicios && row.servicios.length > 0 && (
                        <p className="text-xs text-lago-600 mt-1">{row.servicios.join(', ')}</p>
                      )}
                      {row.mensaje && <p className="text-xs text-volcan-500 mt-2 line-clamp-2">{row.mensaje}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-lago-900">{client.email ?? 'Sin email'}</p>
                      <p className="text-xs text-volcan-500 mt-1">{client.telefono ?? 'Sin telefono'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-lago-900">{formatCLP(row.monto_estimado ?? 0)}</p>
                      <p className="text-xs text-volcan-400 mt-1">Referencial</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${st.classes}`}>
                        {st.label}
                      </span>
                      <p className="text-xs text-volcan-400 mt-2">Tipo: {row.tipo_evento}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/salon/${row.id}`} className="mb-2 inline-flex text-xs font-medium text-lago-700 hover:text-lago-900">
                        Abrir ficha
                      </Link>
                      <AdminQuoteActions
                        quoteId={row.id}
                        status={row.status}
                        telefono={client.telefono ?? ''}
                        nombre={client.nombre ?? ''}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-volcan-500">No hay cotizaciones con esos filtros.</div>
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
