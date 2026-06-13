import { getSupabaseAdmin } from '@/lib/supabase-server'
import AdminShell from '@/components/AdminShell'
import AdminSalonQuotesTable from '@/components/AdminSalonQuotesTable'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminSalonPage() {
  return (
    <AdminShell>
      <SalonContent />
    </AdminShell>
  )
}

async function SalonContent() {
  let quotes: any[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from('salon_quotes')
      .select('*, clients(nombre, email, telefono)')
      .order('created_at', { ascending: false })
      .limit(500)

    quotes = data ?? []
  } catch (error) {
    console.error('[admin.salon]', error)
  }

  return <AdminSalonQuotesTable quotes={quotes} />
}
