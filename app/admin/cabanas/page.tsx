import AdminShell from '@/components/AdminShell'
import AdminCabanasManager from '@/components/AdminCabanasManager'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Cabana } from '@/lib/supabase'

export const revalidate = 0

export default function AdminCabanasPage() {
  return (
    <AdminShell>
      <CabanasContent />
    </AdminShell>
  )
}

async function CabanasContent() {
  let cabanas: Cabana[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .order('orden')

    cabanas = (data ?? []) as Cabana[]
  } catch (error) {
    console.error('[admin.cabanas]', error)
  }

  return <AdminCabanasManager cabanas={cabanas} />
}
