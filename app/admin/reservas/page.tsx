import { getSupabaseAdmin } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AdminReservationActions from '@/components/AdminReservationActions'

export const revalidate = 0

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  confirmed: { label: 'Confirmada', classes: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelada', classes: 'bg-red-100 text-red-600' },
  no_show: { label: 'No show', classes: 'bg-volcán-100 text-volcán-600' },
}

export default async function AdminReservasPage() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: reservas } = await supabaseAdmin
    .from('reservations_full')
    .select('*')
    .eq('tipo', 'cabana')
    .order('check_in', { ascending: false })
    .limit(100)

  const fmt = (d: string) => format(new Date(d + 'T12:00:00'), "d MMM yyyy", { locale: es })

  return (
    <div>
      <h1 className="font-display text-3xl text-lago-900 mb-8">Reservas de cabañas</h1>
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena-100 bg-arena-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Cabaña</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Fechas</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Pax</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-50">
              {(reservas ?? []).map((r: any) => {
                const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.pending
                return (
                  <tr key={r.id} className="hover:bg-arena-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-lago-900">{r.client_nombre}</p>
                      <p className="text-xs text-volcán-500">{r.client_email}</p>
                      <p className="text-xs text-volcán-500">{r.client_telefono}</p>
                    </td>
                    <td className="px-4 py-4 text-lago-700">{r.cabana_nombre}</td>
                    <td className="px-4 py-4">
                      <p>{fmt(r.check_in)}</p>
                      <p className="text-volcán-400">→ {fmt(r.check_out)}</p>
                      <p className="text-xs text-volcán-400">{r.noches} noche{r.noches > 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-4 text-center">{r.guests}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{formatCLP(r.total_amount)}</p>
                      <p className="text-xs text-volcán-400">Anticipo: {formatCLP(r.anticipo_monto ?? 0)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.classes}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <AdminReservationActions reservationId={r.id} status={r.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(reservas ?? []).length === 0 && (
            <p className="text-volcán-500 text-sm p-6">No hay reservas aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
