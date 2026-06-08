import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Path requerido' }, { status: 400 })

  const { data, error: signedError } = await supabaseAdmin!.storage
    .from('payment-vouchers')
    .createSignedUrl(path, 60 * 5)

  if (signedError || !data?.signedUrl) {
    return NextResponse.json({ error: signedError?.message ?? 'No se pudo abrir el comprobante' }, { status: 400 })
  }

  return NextResponse.redirect(data.signedUrl)
}
