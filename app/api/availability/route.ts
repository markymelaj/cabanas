import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cabanaId = searchParams.get('cabana_id')
  const type = searchParams.get('type') ?? 'cabana' // 'cabana' | 'salon'

  try {
    if (type === 'salon') {
      const { data } = await supabaseAdmin.rpc('get_salon_occupied_dates')
      return NextResponse.json({ occupied: data ?? [] })
    }

    if (!cabanaId) {
      return NextResponse.json({ error: 'cabana_id requerido' }, { status: 400 })
    }

    const { data } = await supabaseAdmin.rpc('get_occupied_dates', {
      p_cabana_id: cabanaId,
    })

    const dates = (data as { get_occupied_dates: string }[])?.map(
      (r) => r.get_occupied_dates
    ) ?? []

    return NextResponse.json({ occupied: dates })
  } catch (err) {
    console.error('[availability]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
