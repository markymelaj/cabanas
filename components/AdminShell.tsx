import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isConfiguredAdmin(user)) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-volcÃ¡n-50 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
