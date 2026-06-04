import { getSupabaseAdmin } from '@/lib/supabase-server'
import AdminShell from '@/components/AdminShell'
import AdminReservationsTable from '@/components/AdminReservationsTable'

export const revalidate = 0

export default function AdminReservasPage() {
  return (
    <AdminShell>
      <ReservasContent />
    </AdminShell>
  )
}

async function ReservasContent() {
  let reservas: any[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from('reservations_full')
      .select('*')
      .eq('tipo', 'cabana')
      .order('created_at', { ascending: false })
      .limit(500)

    reservas = data ?? []
  } catch (error) {
    console.error('[admin.reservas]', error)
  }

  return <AdminReservationsTable reservas={reservas} />
}
