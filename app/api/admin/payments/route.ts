import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-api'

function cleanFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

export async function POST(req: NextRequest) {
  const { supabaseAdmin, error } = await requireAdminApi()
  if (error) return error

  const form = await req.formData()
  const reservationId = String(form.get('reservationId') ?? '') || null
  const salonQuoteId = String(form.get('salonQuoteId') ?? '') || null
  const clientId = String(form.get('clientId') ?? '') || null
  const amount = Number(form.get('amount') ?? 0)
  const method = String(form.get('method') ?? 'transferencia')
  const paidAt = String(form.get('paidAt') ?? '') || new Date().toISOString()
  const note = String(form.get('note') ?? '')
  const file = form.get('voucher')

  if (!reservationId && !salonQuoteId) {
    return NextResponse.json({ error: 'Falta reserva o evento' }, { status: 400 })
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Monto invalido' }, { status: 400 })
  }

  let voucherPath: string | null = null
  let voucherName: string | null = null

  if (file instanceof File && file.size > 0) {
    voucherName = cleanFileName(file.name || 'comprobante')
    const target = reservationId ? `reservas/${reservationId}` : `salon/${salonQuoteId}`
    voucherPath = `${target}/${crypto.randomUUID()}-${voucherName}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabaseAdmin!.storage
      .from('payment-vouchers')
      .upload(voucherPath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }
  }

  const { data, error: insertError } = await supabaseAdmin!
    .from('reservation_payments')
    .insert({
      reservation_id: reservationId,
      salon_quote_id: salonQuoteId,
      client_id: clientId,
      amount,
      method,
      paid_at: paidAt,
      note: note || null,
      voucher_path: voucherPath,
      voucher_name: voucherName,
    })
    .select('*')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  return NextResponse.json({ ok: true, payment: data })
}
