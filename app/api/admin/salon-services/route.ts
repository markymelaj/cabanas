import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

function payloadFrom(body: any) {
  return {
    nombre: String(body.nombre ?? '').trim(),
    descripcion: body.descripcion || null,
    precio: Number(body.precio ?? 0),
    precio_por_persona: Boolean(body.precio_por_persona),
    activa: body.activa !== false,
    orden: Number(body.orden ?? 0),
  }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const payload = payloadFrom(body)
  if (!payload.nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const { data, error: dbError } = await supabaseAdmin!
    .from('salon_services')
    .insert(payload)
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ ok: true, service: data })
}

export async function PATCH(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { data, error: dbError } = await supabaseAdmin!
    .from('salon_services')
    .update(payloadFrom(body))
    .eq('id', body.id)
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ ok: true, service: data })
}
