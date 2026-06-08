import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function list(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function payloadFrom(body: any) {
  const nombre = String(body.nombre ?? '').trim()
  const slug = String(body.slug ?? '').trim() || slugify(nombre)

  return {
    slug,
    nombre,
    subtitulo: body.subtitulo || null,
    capacidad: Number(body.capacidad ?? 1),
    dormitorios: Number(body.dormitorios ?? 1),
    banos: Number(body.banos ?? 1),
    camas: body.camas || null,
    metros_cuadrados: body.metros_cuadrados ? Number(body.metros_cuadrados) : null,
    base_huespedes: Number(body.base_huespedes ?? body.capacidad ?? 1),
    precio_huesped_extra: Number(body.precio_huesped_extra ?? 0),
    min_noches: Number(body.min_noches ?? 1),
    check_in_hora: body.check_in_hora || '15:00',
    check_out_hora: body.check_out_hora || '11:00',
    precio_noche: Number(body.precio_noche ?? 0),
    precio_limpieza: Number(body.precio_limpieza ?? 0),
    descripcion_corta: body.descripcion_corta || null,
    descripcion: body.descripcion || null,
    amenidades: list(body.amenidades),
    fotos: list(body.fotos),
    activa: body.activa !== false,
    destacada: Boolean(body.destacada),
    orden: Number(body.orden ?? 0),
  }
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  const payload = payloadFrom(body)

  if (!payload.nombre || !payload.slug) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const { data, error: dbError } = await supabaseAdmin!
    .from('cabanas')
    .insert(payload)
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ ok: true, cabana: data })
}

export async function PATCH(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const payload = payloadFrom(body)
  const { data, error: dbError } = await supabaseAdmin!
    .from('cabanas')
    .update(payload)
    .eq('id', body.id)
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ ok: true, cabana: data })
}
