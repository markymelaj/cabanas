import { NextRequest, NextResponse } from 'next/server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import { createServerSupabase, getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  // Verificar auth
  const supabase = createServerSupabase()
  const supabaseAdmin = getSupabaseAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isConfiguredAdmin(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { reservationId, status } = await req.json()
  if (!reservationId || !status) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  await supabaseAdmin.from('reservations').update({ status }).eq('id', reservationId)
  return NextResponse.json({ ok: true })
}
