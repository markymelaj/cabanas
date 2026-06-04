import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { logSupabaseError, normalizeRpcDates } from '@/lib/supabase-errors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const cabanaId = searchParams.get('cabana_id')
  const type = searchParams.get('type') ?? 'cabana'

  try {
    if (type === 'salon') {
      const { data, error } = await supabaseAdmin.rpc('get_salon_occupied_dates')
      if (error) {
        logSupabaseError('get_salon_occupied_dates', error)
        return NextResponse.json({ error: 'Error al consultar disponibilidad' }, { status: 500 })
      }
      return NextResponse.json({ occupied: normalizeRpcDates(data, 'get_salon_occupied_dates') })
    }

    if (!cabanaId) {
      return NextResponse.json({ error: 'cabana_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.rpc('get_occupied_dates', {
      p_cabana_id: cabanaId,
    })

    if (error) {
      logSupabaseError('get_occupied_dates', error)
      return NextResponse.json({ error: 'Error al consultar disponibilidad' }, { status: 500 })
    }

    return NextResponse.json({ occupied: normalizeRpcDates(data, 'get_occupied_dates') })
  } catch (err) {
    console.error('[availability]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
