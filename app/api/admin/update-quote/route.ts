import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const { quoteId, status } = await req.json()
  if (!quoteId || !status) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const payload: Record<string, any> = { status }
  if (status === 'confirmada') payload.hold_alert = false

  const { error: updateError } = await supabaseAdmin!
    .from('salon_quotes')
    .update(payload)
    .eq('id', quoteId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
