import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/AdminSidebar'

function demoAdminEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN_ENABLED === 'true' || process.env.DEMO_ADMIN_ENABLED === 'true'
}

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const demoAccess = demoAdminEnabled() && cookieStore.get('alto_cauce_demo_admin')?.value === '1'

  let allowed = demoAccess

  if (!allowed) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    allowed = isConfiguredAdmin(user)
  }

  if (!allowed) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-arena-50 flex print:block">
      <AdminSidebar />
      <main className="flex-1 overflow-auto print:overflow-visible">
        <div className="p-8 max-w-6xl mx-auto print:max-w-none print:p-0">
          {children}
        </div>
      </main>
    </div>
  )
}
