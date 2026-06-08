import { NextResponse } from 'next/server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import { createServerSupabase, getSupabaseAdmin } from '@/lib/supabase-server'

export async function requireAdminApi() {
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
