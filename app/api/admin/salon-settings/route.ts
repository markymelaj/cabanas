import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

function list(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function PATCH(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const payload = {
    nombre: body.nombre || 'Salon de Eventos',
    capacidad: Number(body.capacidad ?? 200),
    metros_cuadrados: Number(body.metros_cuadrados ?? 290),
    precio_jornada_completa: Number(body.precio_jornada_completa ?? 0),
    precio_media_jornada: Number(body.precio_media_jornada ?? 0),
    anticipo_porcentaje: Number(body.anticipo_porcentaje ?? 30),
    descripcion: body.descripcion || null,
    condiciones: body.condiciones || null,
    fotos: list(body.fotos),
  }

  const { data: existing } = await supabaseAdmin!
    .from('salon_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  const query = existing?.id
    ? supabaseAdmin!.from('salon_settings').update(payload).eq('id', existing.id)
    : supabaseAdmin!.from('salon_settings').insert(payload)

  const { data, error: dbError } = await query.select('*').single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

  return NextResponse.json({ ok: true, settings: data })
}
