import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // Verificar auth
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { reservationId, status } = await req.json()
  if (!reservationId || !status) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  await supabaseAdmin.from('reservations').update({ status }).eq('id', reservationId)
  return NextResponse.json({ ok: true })
}
