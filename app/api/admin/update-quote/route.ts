import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { quoteId, status } = await req.json()
  if (!quoteId || !status) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  await supabaseAdmin.from('salon_quotes').update({ status }).eq('id', quoteId)
  return NextResponse.json({ ok: true })
}
