import AdminShell from '@/components/AdminShell'
import AdminSalonEventForm from '@/components/AdminSalonEventForm'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const revalidate = 0

export default function NewSalonEventPage() {
  return (
    <AdminShell>
      <NewSalonEventContent />
    </AdminShell>
  )
}

async function NewSalonEventContent() {
  let settings: any = null
  let services: any[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [{ data: settingsData }, { data: servicesData }] = await Promise.all([
      supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('salon_services').select('*').eq('activa', true).order('orden'),
    ])
    settings = settingsData
    services = servicesData ?? []
  } catch (error) {
    console.error('[admin.salon.nuevo]', error)
  }

  return <AdminSalonEventForm settings={settings} services={services} />
}
