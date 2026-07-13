import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'
import { isISODate } from '@/lib/date-rules'

const allowedTypes = new Set(['cabana', 'salon'])

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  const fecha = typeof body?.fecha === 'string' ? body.fecha : ''
  const cabanaId = typeof body?.cabanaId === 'string' && body.cabanaId ? body.cabanaId : null
  const tipo = typeof body?.tipo === 'string' && allowedTypes.has(body.tipo) ? body.tipo : 'cabana'
  const motivo = typeof body?.motivo === 'string' ? body.motivo.trim().slice(0, 240) : null

  if (!isISODate(fecha)) return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
  if (tipo === 'salon' && cabanaId) return NextResponse.json({ error: 'El salón no debe asociarse a una cabaña.' }, { status: 400 })

  const { error } = await auth.supabaseAdmin!.from('blocked_dates').insert({
    fecha,
    cabana_id: tipo === 'cabana' ? cabanaId : null,
    tipo,
    motivo: motivo || null,
  })

  if (error?.code === '23505') return NextResponse.json({ error: 'Esa fecha ya está bloqueada.' }, { status: 409 })
  if (error) return NextResponse.json({ error: 'No pudimos bloquear la fecha.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Bloqueo requerido' }, { status: 400 })

  const { error } = await auth.supabaseAdmin!.from('blocked_dates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'No pudimos quitar el bloqueo.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
