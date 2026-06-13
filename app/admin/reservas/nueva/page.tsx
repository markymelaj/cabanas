import AdminShell from '@/components/AdminShell'
import AdminReservationForm from '@/components/AdminReservationForm'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Cabana } from '@/lib/supabase'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NewReservationPage() {
  return (
    <AdminShell>
      <NewReservationContent />
    </AdminShell>
  )
}

async function NewReservationContent() {
  let cabanas: Cabana[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .eq('activa', true)
      .order('orden')
    cabanas = (data ?? []) as Cabana[]
  } catch (error) {
    console.error('[admin.reservas.nueva]', error)
  }

  return <AdminReservationForm cabanas={cabanas} />
}
