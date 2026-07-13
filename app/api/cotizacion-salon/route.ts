import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getOrCreateClientId, logSupabaseError } from '@/lib/supabase-errors'
import { sendAdminNotification, sendSalonQuoteConfirmation } from '@/lib/resend'
import { buildSalonQuoteRequestMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import { enforceRateLimit, looksAutomated } from '@/lib/request-security'
import { firstZodError, normalizePhone, salonQuoteRequestSchema } from '@/lib/validation'
import { todayInChile } from '@/lib/date-rules'

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, 'salon-quote', { limit: 5, windowMs: 10 * 60 * 1000 })
  if (rateLimited) return rateLimited

  try {
    const json = await req.json().catch(() => null)
    const parsed = salonQuoteRequestSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 })

    const input = parsed.data
    if (input.website || looksAutomated(input.submittedAt)) return NextResponse.json({ error: 'No pudimos validar el envío. Recarga la página e inténtalo nuevamente.' }, { status: 400 })
    if (input.fechaEvento < todayInChile()) return NextResponse.json({ error: 'La fecha del evento no puede estar en el pasado.' }, { status: 400 })

    const cleanClient = { nombre: input.nombre.trim(), email: input.email.trim().toLowerCase(), telefono: normalizePhone(input.telefono) }
    const quoteId = crypto.randomUUID()
    let savedToAdmin = false
    let adminError: string | null = null
    let pricing = calcSalonPriceFallback(input.numInvitados, input.servicios, input.horario)
    let selectedServices = input.servicios

    try {
      const supabaseAdmin = getSupabaseAdmin()
      const [{ data: settings, error: settingsError }, { data: activeServices, error: servicesError }] = await Promise.all([
        supabaseAdmin.from('salon_settings').select('*').eq('activa', true).limit(1).maybeSingle(),
        supabaseAdmin.from('salon_services').select('*').eq('activa', true).order('orden'),
      ])
      if (settingsError) logSupabaseError('salon_settings.read', settingsError)
      if (servicesError) logSupabaseError('salon_services.read', servicesError)

      const capacity = Number(settings?.capacidad ?? 200)
      if (input.numInvitados > capacity) return NextResponse.json({ error: `La capacidad máxima del salón es de ${capacity} personas.` }, { status: 400 })

      const allowedNames = new Set((activeServices ?? []).map((service: any) => String(service.nombre)))
      selectedServices = input.servicios.filter((name) => allowedNames.has(name))
      pricing = calcSalonPriceFromRows(settings, activeServices ?? [], input.numInvitados, selectedServices, input.horario)

      const clientId = await getOrCreateClientId(supabaseAdmin, cleanClient)
      const { error: quoteError } = await supabaseAdmin.from('salon_quotes').insert({
        id: quoteId,
        client_id: clientId,
        fecha_evento: input.fechaEvento,
        tipo_evento: input.tipoEvento,
        num_invitados: input.numInvitados,
        horario: input.horario,
        servicios: selectedServices,
        monto_estimado: pricing.total,
        subtotal_amount: pricing.total,
        total_amount: pricing.total,
        paid_amount: 0,
        balance_amount: pricing.total,
        mensaje: input.mensaje || null,
        status: 'nueva',
        source: 'web',
        hold_alert: true,
      })
      if (quoteError) { logSupabaseError('salon_quotes.insert', quoteError); throw quoteError }
      savedToAdmin = true
    } catch (saveError) {
      adminError = 'No se pudo guardar en el panel.'
      console.error('[cotizacion-salon.admin.save]', saveError)
    }

    const whatsappUrl = buildWhatsAppLink(buildSalonQuoteRequestMessage({
      quoteId,
      ...cleanClient,
      fechaEvento: input.fechaEvento,
      tipoEvento: input.tipoEvento,
      numInvitados: input.numInvitados,
      horario: input.horario,
      servicios: selectedServices,
      monto: pricing.total,
      mensaje: input.mensaje,
      savedToAdmin,
    }))

    if (savedToAdmin) {
      await Promise.allSettled([
        sendSalonQuoteConfirmation({ to: cleanClient.email, nombre: cleanClient.nombre, fechaEvento: input.fechaEvento, tipoEvento: input.tipoEvento, numInvitados: input.numInvitados, montoEstimado: pricing.total, quoteId }),
        sendAdminNotification({ type: 'cotizacion_salon', ...cleanClient, detail: `Fecha: ${input.fechaEvento}\nTipo: ${input.tipoEvento}\nInvitados: ${input.numInvitados}\nHorario: ${input.horario}\nServicios: ${selectedServices.join(', ')}\nEstimado: $${pricing.total.toLocaleString('es-CL')}\nMensaje: ${input.mensaje}`, reservationId: quoteId }),
      ])
    }

    return NextResponse.json({ quoteId, pricing, savedToAdmin, whatsappUrl, adminError: savedToAdmin ? null : adminError }, { status: savedToAdmin ? 200 : 202 })
  } catch (error) {
    console.error('[cotizacion-salon]', error)
    return NextResponse.json({ error: 'No pudimos procesar la cotización.' }, { status: 500 })
  }
}

function calcSalonPriceFromRows(settings: any, services: any[], guests: number, selected: string[], schedule: string) {
  const base = schedule === 'medio' ? Number(settings?.precio_media_jornada ?? 520000) : Number(settings?.precio_jornada_completa ?? 800000)
  const selectedSet = new Set(selected)
  const extras = services.filter((service) => selectedSet.has(String(service.nombre))).reduce((sum, service) => {
    const price = Number(service.precio ?? 0)
    return sum + (service.precio_por_persona ? price * guests : price)
  }, 0)
  const total = base + extras
  return { arriendoSalon: base, banqueteria: extras, total, porPersona: Math.round(total / Math.max(1, guests)) }
}

function calcSalonPriceFallback(guests: number, selected: string[], schedule: string) {
  const base = schedule === 'medio' ? 520000 : 800000
  const normalized = selected.map((item) => item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  const extras = normalized.includes('banqueteria') ? guests * 12000 : 0
  const total = base + extras
  return { arriendoSalon: base, banqueteria: extras, total, porPersona: Math.round(total / Math.max(1, guests)) }
}
