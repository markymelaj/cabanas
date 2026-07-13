import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.STATUS_ENDPOINT_ENABLED !== 'true') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  try {
    const [{ count: cabanas }, { count: reservations }, { count: quotes }] = await Promise.all([
      supabaseAdmin!.from('cabanas').select('*', { count: 'exact', head: true }),
      supabaseAdmin!.from('reservations').select('*', { count: 'exact', head: true }),
      supabaseAdmin!.from('salon_quotes').select('*', { count: 'exact', head: true }),
    ])
    return NextResponse.json({ ok: true, database: 'connected', counts: { cabanas: cabanas ?? 0, reservations: reservations ?? 0, salonQuotes: quotes ?? 0 }, checkedAt: new Date().toISOString() })
  } catch (statusError) {
    console.error('[estado]', statusError)
    return NextResponse.json({ ok: false, database: 'unavailable' }, { status: 503 })
  }
}
