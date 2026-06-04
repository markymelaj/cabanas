import { getSupabaseAdmin } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/pricing'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AdminQuoteActions from '@/components/AdminQuoteActions'
import AdminShell from '@/components/AdminShell'

export const revalidate = 0

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  nueva: { label: 'Nueva', classes: 'bg-blue-100 text-blue-700' },
  contactada: { label: 'Contactada', classes: 'bg-amber-100 text-amber-700' },
  confirmada: { label: 'Confirmada', classes: 'bg-green-100 text-green-700' },
  rechazada: { label: 'Rechazada', classes: 'bg-red-100 text-red-600' },
}

export default async function AdminSalonPage() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: quotes } = await supabaseAdmin
    .from('salon_quotes')
    .select(`*, clients(nombre, email, telefono)`)
    .order('created_at', { ascending: false })
    .limit(100)

  const fmt = (d: string) => format(new Date(d + 'T12:00:00'), "d MMM yyyy", { locale: es })

  return (
    <AdminShell>
    <div>
      <h1 className="font-display text-3xl text-lago-900 mb-8">Cotizaciones salón de eventos</h1>
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena-100 bg-arena-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Evento</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Invitados</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Estimado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-volcán-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-50">
              {(quotes ?? []).map((q: any) => {
                const client = q.clients
                const st = STATUS_LABELS[q.status] ?? STATUS_LABELS.nueva
                return (
                  <tr key={q.id} className="hover:bg-arena-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-lago-900">{client?.nombre}</p>
                      <p className="text-xs text-volcán-500">{client?.email}</p>
                      <p className="text-xs text-volcán-500">{client?.telefono}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-lago-800">{q.tipo_evento}</p>
                      <p className="text-xs text-volcán-500">{q.horario === 'completo' ? 'Jornada completa' : 'Media jornada'}</p>
                      {q.servicios?.length > 0 && (
                        <p className="text-xs text-volcán-400">{q.servicios.join(', ')}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">{fmt(q.fecha_evento)}</td>
                    <td className="px-4 py-4 text-center">{q.num_invitados}</td>
                    <td className="px-4 py-4 font-medium">{formatCLP(q.monto_estimado ?? 0)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.classes}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <AdminQuoteActions quoteId={q.id} status={q.status} telefono={client?.telefono} nombre={client?.nombre} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(quotes ?? []).length === 0 && (
            <p className="text-volcán-500 text-sm p-6">No hay cotizaciones aún.</p>
          )}
        </div>
      </div>
    </div>
    </AdminShell>
  )
}
