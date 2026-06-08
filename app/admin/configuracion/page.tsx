import AdminShell from '@/components/AdminShell'
import AdminSalonSettings from '@/components/AdminSalonSettings'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const revalidate = 0

export default function AdminConfiguracionPage() {
  return (
    <AdminShell>
      <ConfigContent />
    </AdminShell>
  )
}

async function ConfigContent() {
  let settings: any = null
  let services: any[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [{ data: settingsData }, { data: servicesData }] = await Promise.all([
      supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('salon_services').select('*').order('orden'),
    ])
    settings = settingsData
    services = servicesData ?? []
  } catch (error) {
    console.error('[admin.configuracion]', error)
  }

  return <AdminSalonSettings settings={settings} services={services} />
}
