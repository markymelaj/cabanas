import AdminShell from '@/components/AdminShell'
import AdminReservationDetail from '@/components/AdminReservationDetail'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Cabana } from '@/lib/supabase'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminShell>
      <ReservationDetailContent id={id} />
    </AdminShell>
  )
}

async function ReservationDetailContent({ id }: { id: string }) {
  const supabaseAdmin = getSupabaseAdmin()

  const [
    { data: reservation },
    { data: cabanas },
    { data: payments },
    { data: notes },
  ] = await Promise.all([
    supabaseAdmin.from('reservations_full').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin.from('cabanas').select('*').order('orden'),
    supabaseAdmin.from('reservation_payments').select('*').eq('reservation_id', id).order('paid_at', { ascending: false }),
    supabaseAdmin.from('operation_notes').select('*').eq('reservation_id', id).order('created_at', { ascending: false }),
  ])

  if (!reservation) {
    return (
      <div className="rounded-lg border border-arena-100 bg-white p-8">
        <h1 className="font-display text-3xl text-lago-900">Reserva no encontrada</h1>
      </div>
    )
  }

  return (
    <AdminReservationDetail
      reservation={reservation}
      cabanas={(cabanas ?? []) as Cabana[]}
      payments={payments ?? []}
      notes={notes ?? []}
      baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'https://cabanas-theta.vercel.app'}
    />
  )
}
