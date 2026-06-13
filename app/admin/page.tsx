import { getSupabaseAdmin } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import { Calendar, Clock, PartyPopper, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AdminShell from '@/components/AdminShell'
import AdminAIAssistant from '@/components/AdminAIAssistant'


export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStats() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [
      { count: totalReservas },
      { count: reservasPendientes },
      { count: cotizacionesNuevas },
      { data: ingresoData },
      { data: proximas },
    ] = await Promise.all([
      supabaseAdmin.from('reservations').select('*', { count: 'exact', head: true }).eq('tipo', 'cabana').eq('status', 'confirmed'),
      supabaseAdmin.from('reservations').select('*', { count: 'exact', head: true }).eq('tipo', 'cabana').eq('status', 'pending'),
      supabaseAdmin.from('salon_quotes').select('*', { count: 'exact', head: true }).eq('status', 'nueva'),
      supabaseAdmin.from('reservations').select('total_amount').eq('tipo', 'cabana').eq('status', 'confirmed'),
      supabaseAdmin.from('reservations_full').select('*').eq('status', 'confirmed').gte('check_in', new Date().toISOString().split('T')[0]).order('check_in').limit(5),
    ])

    const totalIngreso = (ingresoData ?? []).reduce((sum: number, r: any) => sum + (r.total_amount ?? 0), 0)

    return {
      totalReservas: totalReservas ?? 0,
      reservasPendientes: reservasPendientes ?? 0,
      cotizacionesNuevas: cotizacionesNuevas ?? 0,
      totalIngreso,
      proximas: proximas ?? [],
    }
  } catch (error) {
    console.error('[admin.dashboard]', error)
    return {
      totalReservas: 0,
      reservasPendientes: 0,
      cotizacionesNuevas: 0,
      totalIngreso: 0,
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
    { label: 'Reservas pendientes', value: stats.reservasPendientes, icon: Clock, color: 'text-arena-700', bg: 'bg-arena-50' },
    { label: 'Cotizaciones nuevas', value: stats.cotizacionesNuevas, icon: PartyPopper, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Ingresos confirmados', value: formatCLP(stats.totalIngreso), icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', isText: true },
  ]

  const fmt = (date: string) => format(new Date(`${date}T12:00:00`), 'd MMM', { locale: es })

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Panel</p>
          <h1 className="font-display text-3xl text-lago-900">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/reservas" className="btn-outline px-4 py-2 text-xs">Reservas cabañas</Link>
          <Link href="/admin/salon" className="btn-outline px-4 py-2 text-xs">Salón</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      <div className="mb-10">
        <AdminAIAssistant mode="overview" />
      </div>

      <div className="bg-white border border-arena-100 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-arena-100">
          <h2 className="font-display text-xl text-lago-900">Proximas llegadas</h2>
          <Link href="/admin/reservas" className="text-sm text-lago-600 hover:text-lago-800 transition-colors">Ver todas</Link>
        </div>
        {stats.proximas.length === 0 ? (
          <p className="text-volcan-500 text-sm p-6">No hay reservas próximas.</p>
        ) : (
          <div className="divide-y divide-arena-100">
            {stats.proximas.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="font-medium text-sm text-lago-900">{row.client_nombre}</p>
                  <p className="text-xs text-volcan-500">{row.cabana_nombre ?? row.notas ?? 'Cabaña solicitada'}</p>
                </div>
                <div className="text-right">
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
