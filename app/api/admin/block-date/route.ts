import { NextRequest, NextResponse } from 'next/server'
import { isConfiguredAdmin } from '@/lib/admin-auth'
import { createServerSupabase, getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const supabaseAdmin = getSupabaseAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isConfiguredAdmin(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { fecha, cabanaId, tipo, motivo } = await req.json()
  if (!fecha) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

  const { error } = await supabaseAdmin.from('blocked_dates').insert({
    fecha,
    cabana_id: cabanaId || null,
    tipo,
    motivo: motivo || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabase()
  const supabaseAdmin = getSupabaseAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isConfiguredAdmin(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin.from('blocked_dates').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
