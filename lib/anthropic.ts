export type ConflictAdviceContext = {
  type: 'cabana' | 'salon'
  current: Record<string, any>
  conflicts: Record<string, any>[]
  blockedDates: Record<string, any>[]
  payments: Record<string, any>[]
  generatedAt: string
}

export type ConflictAdvice = {
  configured: boolean
  source: 'claude' | 'fallback'
  model?: string
  riskLevel: 'bajo' | 'medio' | 'alto'
  recommendation: string
  reasoning: string[]
  nextSteps: string[]
  whatsappMessage: string
  confidence: number
  opportunities: string[]
}

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_API_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-4-6'

function compact(value: unknown, fallback = '-') {
  if (value == null || value === '') return fallback
  return String(value)
}

function money(value: unknown) {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount)) return '$0'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getClientName(item: Record<string, any>) {
  return compact(item.client_nombre ?? item.clients?.nombre ?? item.client?.nombre ?? item.nombre, 'cliente')
}

function fallbackAdvice(context: ConflictAdviceContext, reason?: string): ConflictAdvice {
  const conflictCount = context.conflicts.length + context.blockedDates.length
  const hasPayments = context.payments.some((payment) => Number(payment.amount ?? 0) > 0)
  const current = context.current
  const client = getClientName(current)
  const riskLevel: ConflictAdvice['riskLevel'] = conflictCount > 1 ? 'alto' : conflictCount === 1 ? 'medio' : 'bajo'

  const dateText = context.type === 'cabana'
    ? `${compact(current.check_in)} al ${compact(current.check_out)}`
    : compact(current.fecha_evento)

  const recommendation = conflictCount > 0
    ? `No confirmes todavía. Mantén esta solicitud en espera y prioriza la reserva con pago comprobado, confirmación más antigua o mayor valor comercial.`
    : `No se detectan choques directos en la información cargada. Puedes avanzar con confirmación manual si los datos de pago y contacto están correctos.`

  const nextSteps = conflictCount > 0
    ? [
        'Revisar pagos y comprobantes antes de confirmar.',
        'Contactar al cliente mejor posicionado y dejar la otra solicitud como alternativa o lista de espera.',
        'Actualizar estado, notas internas y bloqueo de agenda después de decidir.',
      ]
    : [
        'Validar monto, anticipo y datos de contacto.',
        'Enviar confirmación por WhatsApp.',
        'Actualizar estado y notas internas en la ficha.',
      ]

  return {
    configured: false,
    source: 'fallback',
    riskLevel,
    recommendation,
    reasoning: [
      conflictCount > 0
        ? `Hay ${conflictCount} posible(s) choque(s) entre reservas o bloqueos.`
        : 'No aparecen reservas o bloqueos superpuestos en esta consulta.',
      hasPayments
        ? 'Hay pagos registrados en el grupo analizado; conviene priorizarlos.'
        : 'No se ven pagos registrados en el grupo analizado.',
      reason || 'Claude queda listo apenas agregues ANTHROPIC_API_KEY en Vercel.',
    ],
    nextSteps,
    whatsappMessage: `Hola ${client}, estamos revisando disponibilidad para ${dateText}. Te confirmo a la brevedad la mejor alternativa y los pasos para dejarlo reservado.`,
    confidence: conflictCount > 0 ? 0.62 : 0.72,
    opportunities: [
      'Redactar mensajes de WhatsApp según estado de pago.',
      'Resumir historial del cliente y acuerdos internos.',
      'Detectar reservas que necesitan seguimiento hoy.',
      'Sugerir cambios de precio o alternativas de fecha cuando hay conflicto.',
    ],
  }
}

function extractText(data: any) {
  const blocks: Array<{ type?: string; text?: string }> = Array.isArray(data?.content) ? data.content : []
  return blocks
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text ?? '')
    .join('\n')
    .trim()
}

function parseJsonAdvice(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1))
    throw new Error('Claude no devolvió JSON válido.')
  }
}

function normalizeAdvice(raw: any, context: ConflictAdviceContext, model: string): ConflictAdvice {
  const fallback = fallbackAdvice(context)
  const confidence = Number(raw?.confidence ?? fallback.confidence)

  return {
    configured: true,
    source: 'claude',
    model,
    riskLevel: ['bajo', 'medio', 'alto'].includes(raw?.riskLevel) ? raw.riskLevel : fallback.riskLevel,
    recommendation: compact(raw?.recommendation, fallback.recommendation),
    reasoning: Array.isArray(raw?.reasoning) && raw.reasoning.length ? raw.reasoning.map(String) : fallback.reasoning,
    nextSteps: Array.isArray(raw?.nextSteps) && raw.nextSteps.length ? raw.nextSteps.map(String) : fallback.nextSteps,
    whatsappMessage: compact(raw?.whatsappMessage, fallback.whatsappMessage),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : fallback.confidence,
    opportunities: Array.isArray(raw?.opportunities) && raw.opportunities.length
      ? raw.opportunities.map(String)
      : fallback.opportunities,
  }
}

function systemPrompt() {
  return [
    'Eres un asistente de operaciones para un negocio de cabañas y salón de eventos en Chile.',
    'Tu trabajo es recomendar decisiones prácticas cuando hay reservas, pagos, bloqueos o fechas superpuestas.',
    'No inventes datos. Si falta información, dilo como riesgo o siguiente paso.',
    'Prioriza: pago comprobado, estado confirmado, antigüedad de la solicitud, valor total, claridad del cliente y experiencia comercial.',
    'La respuesta debe estar en español chileno, directa y accionable.',
    'Devuelve solamente JSON válido con esta forma exacta: {"riskLevel":"bajo|medio|alto","recommendation":"...","reasoning":["..."],"nextSteps":["..."],"whatsappMessage":"...","confidence":0.0,"opportunities":["..."]}.',
  ].join(' ')
}

function userPrompt(context: ConflictAdviceContext) {
  return [
    'Analiza esta situación operativa y recomienda qué decisión tomar.',
    '',
    `Tipo: ${context.type === 'cabana' ? 'reserva de cabaña' : 'reserva de salón'}`,
    `Fecha de análisis: ${context.generatedAt}`,
    `Reserva actual: ${JSON.stringify(context.current)}`,
    `Reservas potencialmente conflictivas: ${JSON.stringify(context.conflicts)}`,
    `Bloqueos cargados: ${JSON.stringify(context.blockedDates)}`,
    `Pagos relacionados: ${JSON.stringify(context.payments)}`,
    '',
    `Incluye un mensaje breve de WhatsApp para el cliente ${getClientName(context.current)}.`,
    `Si hay pagos, menciona montos solo como referencia interna: total actual ${money(context.current.total_amount ?? context.current.monto_estimado)}.`,
  ].join('\n')
}

export async function getClaudeConflictAdvice(context: ConflictAdviceContext): Promise<ConflictAdvice> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL

  if (!apiKey) return fallbackAdvice(context)

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_API_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1400,
        system: systemPrompt(),
        messages: [
          {
            role: 'user',
            content: userPrompt(context),
          },
        ],
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.error?.message || `Claude respondió HTTP ${response.status}.`
      return fallbackAdvice(context, message)
    }

    const text = extractText(data)
    const parsed = parseJsonAdvice(text)
    return normalizeAdvice(parsed, context, model)
  } catch (error: any) {
    return fallbackAdvice(context, error?.message || 'No se pudo conectar con Claude.')
  }
}
