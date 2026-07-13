import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock3, DoorOpen, PartyPopper, WalletCards } from 'lucide-react'
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import AdminShell from '@/components/AdminShell'
import AdminAIAssistant from '@/components/AdminAIAssistant'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function todayISO() { return new Date().toISOString().split('T')[0] }
function balanceOf(row: any) { return typeof row.balance_amount === 'number' ? row.balance_amount : Math.max(Number(row.total_amount ?? 0) - Number(row.paid_amount ?? 0), 0) }

async function getDashboard() {
  if (!hasSupabaseConfig()) return { confirmed: 0, pending: 0, newQuotes: 0, arrivals: 0, departures: 0, inHouse: 0, pendingBalance: 0, pendingRows: [], unpaidRows: [], upcoming: [] }
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const today = todayISO()
    const [{ data: reservations }, { count: newQuotes }] = await Promise.all([
      supabaseAdmin.from('reservations_full').select('*').eq('tipo', 'cabana').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('salon_quotes').select('*', { count: 'exact', head: true }).eq('status', 'nueva'),
    ])
    const rows = reservations ?? []
    const active = rows.filter((row: any) => !['cancelled', 'no_show'].includes(row.status))
    const firm = rows.filter((row: any) => ['confirmed', 'checked_in'].includes(row.status))
    const pending = rows.filter((row: any) => ['pending', 'standby'].includes(row.status))
    const arrivals = rows.filter((row: any) => row.check_in === today && ['confirmed', 'checked_in'].includes(row.status))
    const departures = rows.filter((row: any) => row.check_out === today && ['confirmed', 'checked_in', 'checked_out'].includes(row.status))
    const inHouse = rows.filter((row: any) => row.check_in <= today && row.check_out > today && ['confirmed', 'checked_in'].includes(row.status))
    const unpaid = active.filter((row: any) => balanceOf(row) > 0).sort((a: any, b: any) => Number(balanceOf(b)) - Number(balanceOf(a)))
    const upcoming = firm.filter((row: any) => row.check_out >= today).sort((a: any, b: any) => a.check_in.localeCompare(b.check_in)).slice(0, 6)
    return {
      confirmed: firm.length,
      pending: pending.length,
      newQuotes: newQuotes ?? 0,
      arrivals: arrivals.length,
      departures: departures.length,
      inHouse: inHouse.length,
      pendingBalance: unpaid.reduce((sum: number, row: any) => sum + balanceOf(row), 0),
      pendingRows: pending.slice(0, 5),
      unpaidRows: unpaid.slice(0, 5),
      upcoming,
    }
  } catch {
    return { confirmed: 0, pending: 0, newQuotes: 0, arrivals: 0, departures: 0, inHouse: 0, pendingBalance: 0, pendingRows: [], unpaidRows: [], upcoming: [] }
  }
}

export default function AdminDashboard() { return <AdminShell><DashboardContent /></AdminShell> }

async function DashboardContent() {
  const stats = await getDashboard()
  return <div className="space-y-7">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-arena-600">Operación diaria</p><h1 className="admin-page-title mt-1">Lo que necesita atención hoy.</h1><p className="mt-2 max-w-2xl text-sm text-volcan-600">Prioriza solicitudes, cobros, llegadas y salidas antes de revisar el resto del sistema.</p></div><div className="flex flex-col gap-2 sm:flex-row"><Link href="/admin/reservas/nueva" className="btn-primary">Nueva reserva</Link><Link href="/admin/reservas" className="btn-outline">Ver reservas</Link></div></header>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric icon={Clock3} label="Solicitudes pendientes" value={stats.pending} emphasis={stats.pending > 0} /><Metric icon={WalletCards} label="Saldo por cobrar" value={formatCLP(stats.pendingBalance)} /><Metric icon={DoorOpen} label="Huéspedes en casa" value={stats.inHouse} /><Metric icon={PartyPopper} label="Eventos nuevos" value={stats.newQuotes} /></section>

    <section className="grid gap-3 sm:grid-cols-3"><Operation icon={Calendar} title="Llegan hoy" value={stats.arrivals} action="Revisar check-in" href="/admin/reservas" /><Operation icon={DoorOpen} title="Salen hoy" value={stats.departures} action="Cerrar estadías" href="/admin/reservas" /><Operation icon={CheckCircle2} title="Confirmadas activas" value={stats.confirmed} action="Ver calendario" href="/admin/disponibilidad" /></section>

    <section className="grid gap-5 xl:grid-cols-2">
      <Queue title="Solicitudes por responder" subtitle="Pendientes y standby, más recientes primero." rows={stats.pendingRows} empty="No hay solicitudes pendientes." type="pending" />
      <Queue title="Cobros pendientes" subtitle="Reservas activas ordenadas por mayor saldo." rows={stats.unpaidRows} empty="No hay saldos pendientes." type="balance" />
    </section>

    <section className="admin-card overflow-hidden !p-0"><div className="flex items-center justify-between border-b border-arena-100 p-5"><div><h2 className="font-display text-2xl text-lago-950">Próximas estadías</h2><p className="mt-1 text-xs text-volcan-500">Reservas confirmadas por fecha de llegada.</p></div><Link href="/admin/reservas" className="text-sm font-semibold text-lago-700">Ver todas</Link></div>{stats.upcoming.length === 0 ? <p className="p-6 text-sm text-volcan-500">No hay reservas próximas.</p> : <div className="divide-y divide-arena-100">{stats.upcoming.map((row: any) => <Link key={row.id} href={`/admin/reservas/${row.id}`} className="flex flex-col gap-2 p-5 transition hover:bg-arena-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-lago-950">{row.client_nombre}</p><p className="text-xs text-volcan-500">{row.cabana_nombre ?? 'Cabaña'} · {row.guests} huéspedes</p></div><div className="sm:text-right"><p className="text-sm font-semibold text-lago-800">{fmt(row.check_in)} — {fmt(row.check_out)}</p><p className="text-xs text-volcan-500">{formatCLP(Number(row.total_amount ?? 0))}</p></div></Link>)}</div>}</section>

    <details className="admin-card group"><summary className="flex cursor-pointer list-none items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-arena-600">Asistente opcional</p><h2 className="mt-1 font-display text-2xl text-lago-950">Analizar operación con IA</h2></div><ArrowRight size={20} className="transition group-open:rotate-90" /></summary><div className="mt-5 border-t border-arena-100 pt-5"><AdminAIAssistant mode="overview" /></div></details>
  </div>
}

function Metric({ icon: Icon, label, value, emphasis = false }: { icon: typeof Clock3; label: string; value: string | number; emphasis?: boolean }) { return <article className={`admin-card ${emphasis ? '!border-amber-300 bg-amber-50/60' : ''}`}><Icon size={19} className={emphasis ? 'text-amber-700' : 'text-lago-600'} /><p className="mt-4 text-xs font-medium text-volcan-500">{label}</p><p className="mt-1 font-display text-2xl text-lago-950 sm:text-3xl">{value}</p></article> }
function Operation({ icon: Icon, title, value, action, href }: { icon: typeof Calendar; title: string; value: number; action: string; href: string }) { return <Link href={href} className="admin-card flex items-center justify-between gap-4 transition hover:-translate-y-0.5 hover:border-lago-300"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-lago-600">Hoy</p><h2 className="mt-1 font-display text-2xl text-lago-950">{title}</h2><p className="mt-2 text-xs font-semibold text-arena-700">{action} →</p></div><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lago-50"><Icon size={20} className="absolute opacity-0" /><span className="font-display text-4xl text-lago-800">{value}</span></div></Link> }
function Queue({ title, subtitle, rows, empty, type }: { title: string; subtitle: string; rows: any[]; empty: string; type: 'pending' | 'balance' }) { return <section className="admin-card !p-0 overflow-hidden"><div className="border-b border-arena-100 p-5"><div className="flex items-start gap-3"><AlertTriangle size={18} className={type === 'pending' ? 'mt-1 text-amber-600' : 'mt-1 text-red-600'} /><div><h2 className="font-display text-2xl text-lago-950">{title}</h2><p className="mt-1 text-xs text-volcan-500">{subtitle}</p></div></div></div>{rows.length === 0 ? <p className="p-5 text-sm text-volcan-500">{empty}</p> : <div className="divide-y divide-arena-100">{rows.map((row) => <Link key={row.id} href={`/admin/reservas/${row.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-arena-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-lago-950">{row.client_nombre ?? 'Sin nombre'}</p><p className="truncate text-xs text-volcan-500">{row.cabana_nombre ?? 'Cabaña'} · {fmt(row.check_in)}</p></div><p className={`shrink-0 text-sm font-bold ${type === 'balance' ? 'text-red-700' : 'text-amber-700'}`}>{type === 'balance' ? formatCLP(balanceOf(row)) : 'Responder'}</p></Link>)}</div>}</section> }
function fmt(value: string) { return format(new Date(`${value}T12:00:00`), 'd MMM', { locale: es }) }
