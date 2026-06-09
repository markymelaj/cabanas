'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export default function AdminQuoteActions({
  quoteId,
  status,
  telefono,
  nombre,
}: {
  quoteId: string
  status: string
  telefono?: string
  nombre?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    try {
      await fetch('/api/admin/update-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, status: newStatus }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const waLink = telefono
    ? buildWhatsAppLink(
        `Hola ${nombre || ''}, te contactamos por tu cotización del salón de eventos. ¿Tienes unos minutos para conversar?`,
        telefono
      )
    : null

  if (loading) return <Loader2 size={16} className="animate-spin text-volcan-400" />

  return (
    <div className="flex flex-col gap-1.5 min-w-[130px]">
      {waLink && (
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors text-center">
          WhatsApp
        </a>
      )}
      {status === 'nueva' && (
        <button onClick={() => updateStatus('contactada')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
          Marcar contactada
        </button>
      )}
      {status !== 'cotizada' && (
        <button onClick={() => updateStatus('cotizada')} className="text-xs px-3 py-1.5 rounded-lg bg-lago-50 text-lago-700 hover:bg-lago-100 font-medium transition-colors">
          Cotizada
        </button>
      )}
      {status !== 'reservada' && (
        <button onClick={() => updateStatus('reservada')} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors">
          Reservar
        </button>
      )}
      {status !== 'confirmada' && (
        <button onClick={() => updateStatus('confirmada')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors">
          Confirmar evento
        </button>
      )}
      {status === 'confirmada' && (
        <button onClick={() => updateStatus('realizada')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
          Realizada
        </button>
      )}
      {status !== 'nueva' && status !== 'confirmada' && status !== 'realizada' && (
        <button onClick={() => updateStatus('nueva')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
          Reabrir
        </button>
      )}
      {status !== 'rechazada' && (
        <button onClick={() => updateStatus('rechazada')} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors">
          Rechazar
        </button>
      )}
    </div>
  )
}
