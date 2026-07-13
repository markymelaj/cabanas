import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/AdminSidebar'

function demoAdminEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN_ENABLED === 'true' || process.env.DEMO_ADMIN_ENABLED === 'true'
}

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoAccess = demoAdminEnabled() && cookieStore.get('alto_cauce_demo_admin')?.value === '1'
  let allowed = demoAccess

  if (!allowed) {
    try {
      const supabase = await createServerSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      allowed = isConfiguredAdmin(user)
    } catch {
      allowed = false
    }
  }

  if (!allowed) redirect('/admin/login')

  return <div className="min-h-screen bg-arena-50 lg:flex print:block"><AdminSidebar /><main className="min-w-0 flex-1 overflow-x-hidden pt-16 lg:pt-0 print:overflow-visible print:pt-0"><div className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10 lg:pt-8 print:max-w-none print:p-0">{children}</div></main></div>
}
