import { getSupabaseAdmin } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import { Calendar, Clock, DoorOpen, PartyPopper, TrendingUp, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AdminShell from '@/components/AdminShell'
import AdminAIAssistant from '@/components/AdminAIAssistant'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function balanceOf(row: any) {
  if (typeof row.balance_amount === 'number') return row.balance_amount
  return Math.max(Number(row.total_amount ?? 0) - Number(row.paid_amount ?? 0), 0)
}

async function getStats() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const today = todayISO()
    const [
      { data: reservas },
      { count: cotizacionesNuevas },
      { data: proximas },
    ] = await Promise.all([
      supabaseAdmin.from('reservations_full').select('*').eq('tipo', 'cabana').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('salon_quotes').select('*', { count: 'exact', head: true }).eq('status', 'nueva'),
      supabaseAdmin.from('reservations_full').select('*').eq('tipo', 'cabana').in('status', ['confirmed', 'checked_in']).gte('check_out', today).order('check_in').limit(7),
    ])

    const rows = reservas ?? []
    const active = rows.filter((row: any) => !['cancelled', 'no_show'].includes(row.status))
    const confirmed = rows.filter((row: any) => row.status === 'confirmed')
    const pending = rows.filter((row: any) => row.status === 'pending' || row.status === 'standby')
    const inHouse = rows.filter((row: any) => row.check_in <= today && row.check_out > today && ['confirmed', 'checked_in'].includes(row.status))
    const arrivals = rows.filter((row: any) => row.check_in === today && ['confirmed', 'checked_in'].includes(row.status))
    const departures = rows.filter((row: any) => row.check_out === today && ['confirmed', 'checked_in', 'checked_out'].includes(row.status))
    const totalIngreso = confirmed.reduce((sum: number, r: any) => sum + Number(r.total_amount ?? 0), 0)
    const saldoPendiente = active.reduce((sum: number, r: any) => sum + balanceOf(r), 0)

    return {
      totalReservas: confirmed.length,
      reservasPendientes: pending.length,
      cotizacionesNuevas: cotizacionesNuevas ?? 0,
      totalIngreso,
      saldoPendiente,
      inHouse: inHouse.length,
      arrivals: arrivals.length,
      departures: departures.length,
      proximas: proximas ?? [],
    }
  } catch (error) {
    console.error('[admin.dashboard]', error)
    return {
      totalReservas: 0,
      reservasPendientes: 0,
      cotizacionesNuevas: 0,
      totalIngreso: 0,
      saldoPendiente: 0,
      inHouse: 0,
      arrivals: 0,
      departures: 0,
      proximas: [],
    }
  }
}

export default function AdminDashboard() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  )
}

async function DashboardContent() {
  const stats = await getStats()

  const metrics = [
    { label: 'Reservas confirmadas', value: stats.totalReservas, icon: Calendar, color: 'text-lago-700', bg: 'bg-lago-50' },
    { label: 'Pendientes / standby', value: stats.reservasPendientes, icon: Clock, color: 'text-arena-700', bg: 'bg-arena-50' },
    { label: 'En casa hoy', value: stats.inHouse, icon: DoorOpen, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Salón nuevas', value: stats.cotizacionesNuevas, icon: PartyPopper, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Ingresos confirmados', value: formatCLP(stats.totalIngreso), icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', isText: true },
    { label: 'Saldo por cobrar', value: formatCLP(stats.saldoPendiente), icon: WalletCards, color: 'text-red-700', bg: 'bg-red-50', isText: true },
  ]

  const fmt = (date: string) => format(new Date(`${date}T12:00:00`), 'd MMM', { locale: es })

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Panel de cabañas</p>
          <h1 className="font-display text-3xl text-lago-900">Dashboard operativo</h1>
          <p className="text-sm text-volcan-500 mt-1">Vista rápida para reservas, llegadas, salidas, pagos y seguimiento comercial.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/reservas/nueva" className="btn-primary px-4 py-2 text-xs">Nueva reserva</Link>
          <Link href="/admin/reservas" className="btn-outline px-4 py-2 text-xs">Reservas cabañas</Link>
          <Link href="/admin/salon" className="btn-outline px-4 py-2 text-xs">Módulo salón</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white border border-arena-100 rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg ${metric.bg} flex items-center justify-center mb-3`}>
              <metric.icon size={18} className={metric.color} />
            </div>
            <p className="text-xs text-volcan-500 mb-1">{metric.label}</p>
            <p className={`font-display text-2xl font-medium ${metric.isText ? 'text-base' : ''} text-lago-900`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <OperationCard title="Llegan hoy" value={stats.arrivals} text="Reservas confirmadas con check-in para hoy." />
        <OperationCard title="Salen hoy" value={stats.departures} text="Reservas que deberían cerrar estadía hoy." />
        <OperationCard title="En casa" value={stats.inHouse} text="Huéspedes actualmente dentro del rango de estadía." />
      </div>

      <div className="mb-10">
        <AdminAIAssistant mode="overview" />
      </div>

      <div className="bg-white border border-arena-100 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-arena-100">
          <div>
            <h2 className="font-display text-xl text-lago-900">Próximas reservas activas</h2>
            <p className="text-xs text-volcan-500 mt-1">Ordenadas por fecha de llegada.</p>
          </div>
          <Link href="/admin/reservas" className="text-sm text-lago-600 hover:text-lago-800 transition-colors">Ver todas</Link>
        </div>
        {stats.proximas.length === 0 ? (
          <p className="text-volcan-500 text-sm p-6">No hay reservas próximas.</p>
        ) : (
          <div className="divide-y divide-arena-100">
            {stats.proximas.map((row: any) => (
              <div key={row.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-3">
                <div>
                  <p className="font-medium text-sm text-lago-900">{row.client_nombre}</p>
                  <p className="text-xs text-volcan-500">{row.cabana_nombre ?? row.notas ?? 'Cabaña solicitada'}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-medium text-lago-700">{fmt(row.check_in)} a {fmt(row.check_out)}</p>
                  <p className="text-xs text-volcan-500">{row.guests} personas · {formatCLP(row.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OperationCard({ title, value, text }: { title: string; value: number; text: string }) {
  return (
    <div className="bg-white border border-arena-100 rounded-lg p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-lago-600 font-medium">Operación diaria</p>
      <div className="flex items-end justify-between gap-4 mt-2">
        <div>
          <h3 className="font-display text-2xl text-lago-900">{title}</h3>
          <p className="text-xs text-volcan-500 mt-1">{text}</p>
        </div>
        <p className="font-display text-4xl text-lago-800">{value}</p>
      </div>
    </div>
  )
}
