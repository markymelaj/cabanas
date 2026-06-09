'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Copy, Loader2, Sparkles } from 'lucide-react'

type Advice = {
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

export default function AdminAIAssistant({
  reservationId,
  salonQuoteId,
  mode = 'item',
}: {
  reservationId?: string
  salonQuoteId?: string
  mode?: 'item' | 'overview'
}) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advice, setAdvice] = useState<Advice | null>(null)
  const isOverview = mode === 'overview'

  async function analyze() {
    setLoading(true)
    setError(null)
    setCopied(false)

    try {
      const res = await fetch('/api/admin/ai/conflict-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isOverview ? { mode: 'overview' } : { reservationId, salonQuoteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo analizar.')
      setAdvice(data.advice)
    } catch (err: any) {
      setError(err.message || 'No se pudo analizar.')
    } finally {
      setLoading(false)
    }
  }

  async function copyMessage() {
    if (!advice?.whatsappMessage) return
    await navigator.clipboard.writeText(advice.whatsappMessage)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const badgeClass = advice?.riskLevel === 'alto'
    ? 'border-red-200 bg-red-50 text-red-700'
    : advice?.riskLevel === 'medio'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <div className="rounded-lg border border-lago-100 bg-white p-5 print:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Asistente IA</p>
          <h3 className="font-display text-xl text-lago-900">
            {isOverview ? 'Analizar operaciones' : 'Decisión operativa'}
          </h3>
        </div>
        <Sparkles size={20} className="text-cobre-500" />
      </div>

      <p className="mt-2 text-sm text-volcan-500">
        {isOverview
          ? 'Revisa reservas próximas, salón, pagos y bloqueos para detectar prioridades.'
          : 'Analiza choques de fecha, pagos, bloqueos y estado para sugerir la mejor acción.'}
      </p>

      <button onClick={analyze} disabled={loading} className="btn-primary mt-4 w-full text-sm disabled:opacity-50">
        {loading
          ? <><Loader2 size={16} className="animate-spin" />Analizando</>
          : <><Sparkles size={16} />{isOverview ? 'Analizar operaciones' : 'Analizar con Claude'}</>}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {advice && (
        <div className="mt-5 space-y-4">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}>
            <AlertTriangle size={14} />
            Riesgo {advice.riskLevel}
          </div>

          {!advice.configured && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Modo guía local activo. Para usar Claude real, agrega ANTHROPIC_API_KEY en Vercel.
            </p>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-volcan-400">Recomendación</p>
            <p className="mt-1 text-sm font-medium text-lago-900">{advice.recommendation}</p>
          </div>

          <List title="Motivos" items={advice.reasoning} />
          <List title="Próximos pasos" items={advice.nextSteps} />

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.14em] text-volcan-400">{isOverview ? 'Mensaje sugerido' : 'WhatsApp sugerido'}</p>
              <button onClick={copyMessage} className="inline-flex items-center gap-1 text-xs font-medium text-lago-700 hover:text-lago-900">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="rounded-lg bg-arena-50 p-3 text-sm text-volcan-700">{advice.whatsappMessage}</p>
          </div>

          <List title="También puede ayudar con" items={advice.opportunities} />

          <p className="text-xs text-volcan-400">
            Confianza: {Math.round((advice.confidence ?? 0) * 100)}%
            {advice.model ? ` · Modelo: ${advice.model}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-volcan-400">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-volcan-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-lg bg-arena-50 px-3 py-2">{item}</li>
        ))}
      </ul>
    </div>
  )
}
