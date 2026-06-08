import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

export async function POST(req: NextRequest) {
  const { user, supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const note = String(body.note ?? '').trim()
  if (!note) return NextResponse.json({ error: 'Nota requerida' }, { status: 400 })

  const { data, error: insertError } = await supabaseAdmin!
    .from('operation_notes')
    .insert({
      client_id: body.clientId || null,
      reservation_id: body.reservationId || null,
      salon_quote_id: body.salonQuoteId || null,
      note,
      created_by: user?.email ?? 'admin',
    })
    .select('*')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
  return NextResponse.json({ ok: true, note: data })
}
