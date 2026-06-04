import { getSupabaseAdmin } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import { Calendar, PartyPopper, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const revalidate = 0

async function getStats() {
  const supabaseAdmin = getSupabaseAdmin()
  const [
    { count: totalReservas },
    { count: reservasPendientes },
    { count: cotizacionesNuevas },
    { data: ingresoData },
    { data: proximas },
  ] = await Promise.all([
    supabaseAdmin.from('reservations').select('*', { count: 'exact', head: true }).eq('tipo', 'cabana').eq('status', 'confirmed'),
    supabaseAdmin.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('salon_quotes').select('*', { count: 'exact', head: true }).eq('status', 'nueva'),
    supabaseAdmin.from('reservations').select('total_amount').eq('status', 'confirmed'),
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
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const METRICS = [
    { label: 'Reservas confirmadas', value: stats.totalReservas, icon: Calendar, color: 'text-lago-700', bg: 'bg-lago-50' },
    { label: 'Reservas pendientes pago', value: stats.reservasPendientes, icon: Clock, color: 'text-arena-600', bg: 'bg-arena-50' },
    { label: 'Cotizaciones nuevas salón', value: stats.cotizacionesNuevas, icon: PartyPopper, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ingresos totales', value: formatCLP(stats.totalIngreso), icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-50', isText: true },
  ]

  const fmt = (d: string) => format(new Date(d + 'T12:00:00'), "d MMM", { locale: es })

  return (
    <div>
      <h1 className="font-display text-3xl text-lago-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl card-shadow p-5">
            <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon size={18} className={m.color} />
            </div>
            <p className="text-xs text-volcán-500 mb-1">{m.label}</p>
            <p className={`font-display text-2xl font-medium ${m.isText ? 'text-base' : ''} text-lago-900`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl card-shadow">
        <div className="flex items-center justify-between p-5 border-b border-arena-100">
          <h2 className="font-display text-xl text-lago-900">Próximas llegadas</h2>
          <Link href="/admin/reservas" className="text-sm text-lago-600 hover:text-lago-800 transition-colors">Ver todas →</Link>
        </div>
        {stats.proximas.length === 0 ? (
          <p className="text-volcán-500 text-sm p-6">No hay reservas próximas.</p>
        ) : (
          <div className="divide-y divide-arena-50">
            {stats.proximas.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm text-lago-900">{r.client_nombre}</p>
                  <p className="text-xs text-volcán-500">{r.cabana_nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-lago-700">{fmt(r.check_in)} → {fmt(r.check_out)}</p>
                  <p className="text-xs text-volcán-500">{r.guests} personas · {formatCLP(r.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
