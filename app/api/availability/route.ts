import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { logSupabaseError, normalizeRpcDates } from '@/lib/supabase-errors'
import { enforceRateLimit } from '@/lib/request-security'

export const dynamic = 'force-dynamic'

function demoFallbackEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN_ENABLED === 'true' || process.env.DEMO_ADMIN_ENABLED === 'true'
}

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, 'availability', { limit: 80, windowMs: 5 * 60 * 1000 })
  if (rateLimited) return rateLimited

  const { searchParams } = new URL(req.url)
  const cabanaId = searchParams.get('cabana_id')?.trim()
  const type = searchParams.get('type') ?? 'cabana'

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (type === 'salon') {
      const { data, error } = await supabaseAdmin.rpc('get_salon_occupied_dates')
      if (error) { logSupabaseError('get_salon_occupied_dates', error); return NextResponse.json({ error: 'Error al consultar disponibilidad.' }, { status: 503 }) }
      return NextResponse.json({ occupied: normalizeRpcDates(data, 'get_salon_occupied_dates') }, { headers: { 'Cache-Control': 'no-store' } })
    }

    if (!cabanaId || cabanaId.length > 100) return NextResponse.json({ error: 'Cabaña requerida.' }, { status: 400 })
    const { data, error } = await supabaseAdmin.rpc('get_occupied_dates', { p_cabana_id: cabanaId })
    if (error) { logSupabaseError('get_occupied_dates', error); return NextResponse.json({ error: 'Error al consultar disponibilidad.' }, { status: 503 }) }
    return NextResponse.json({ occupied: normalizeRpcDates(data, 'get_occupied_dates') }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (demoFallbackEnabled()) {
      return NextResponse.json({ occupied: [], demoFallback: true }, { headers: { 'Cache-Control': 'no-store' } })
    }
    console.error('[availability]', error)
    return NextResponse.json({ error: 'Disponibilidad temporalmente no disponible.' }, { status: 503 })
  }
}
