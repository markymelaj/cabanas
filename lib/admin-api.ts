import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import { createServerSupabase, getSupabaseAdmin } from '@/lib/supabase-server'

function demoAdminEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN_ENABLED === 'true' || process.env.DEMO_ADMIN_ENABLED === 'true'
}

export async function requireAdminApi() {
  const cookieStore = cookies()
  const demoAccess = demoAdminEnabled() && cookieStore.get('alto_cauce_demo_admin')?.value === '1'

  if (demoAccess) {
    return {
      user: { email: 'panel-prueba@altocauce.cl' },
      supabaseAdmin: getSupabaseAdmin(),
      error: null,
    }
  }

  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isConfiguredAdmin(user)) {
    return {
      user: null,
      supabaseAdmin: null,
      error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    }
  }

  return {
    user,
    supabaseAdmin: getSupabaseAdmin(),
    error: null,
  }
}
