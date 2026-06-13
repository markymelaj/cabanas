import AdminShell from '@/components/AdminShell'
import AdminSalonDetail from '@/components/AdminSalonDetail'
import { getSupabaseAdmin } from '@/lib/supabase-server'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminShell>
      <SalonDetailContent id={params.id} />
    </AdminShell>
  )
}

async function SalonDetailContent({ id }: { id: string }) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: event } = await supabaseAdmin
    .from('salon_quotes')
    .select('*, clients(*)')
    .eq('id', id)
    .maybeSingle()

  if (!event) {
    return (
      <div className="rounded-lg border border-arena-100 bg-white p-8">
        <h1 className="font-display text-3xl text-lago-900">Evento no encontrado</h1>
      </div>
    )
  }

  const [{ data: settings }, { data: services }, { data: payments }, { data: notes }] = await Promise.all([
    supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
    supabaseAdmin.from('salon_services').select('*').order('orden'),
    supabaseAdmin.from('reservation_payments').select('*').eq('salon_quote_id', id).order('paid_at', { ascending: false }),
    supabaseAdmin.from('operation_notes').select('*').eq('salon_quote_id', id).order('created_at', { ascending: false }),
  ])

  const client = Array.isArray(event.clients) ? event.clients[0] : event.clients

  return (
    <AdminSalonDetail
      event={event}
      client={client}
      settings={settings}
      services={services ?? []}
      payments={payments ?? []}
      notes={notes ?? []}
    />
  )
}
