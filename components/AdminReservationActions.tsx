'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export default function AdminReservationActions({
  reservationId,
  status,
  nombre,
  telefono,
  cabanaNombre,
  checkIn,
  checkOut,
}: {
  reservationId: string
  status: string
  nombre?: string
  telefono?: string
  cabanaNombre?: string
  checkIn?: string
  checkOut?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    try {
      await fetch('/api/admin/update-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, status: newStatus }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const waLink = telefono
    ? buildWhatsAppLink(
        `Hola ${nombre || ''}, te contactamos de Cabanas Puerto Varas por tu solicitud para ${cabanaNombre || 'cabana'}${checkIn && checkOut ? ` del ${checkIn} al ${checkOut}` : ''}. Tienes unos minutos para confirmar detalles?`,
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
      {status !== 'confirmed' && (
        <button onClick={() => updateStatus('confirmed')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors">
          Confirmar
        </button>
      )}
      {status !== 'pending' && (
        <button onClick={() => updateStatus('pending')} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors">
          Pendiente
        </button>
      )}
      {status === 'confirmed' && (
        <button onClick={() => updateStatus('no_show')} className="text-xs px-3 py-1.5 rounded-lg bg-volcan-100 text-volcan-700 hover:bg-volcan-200 font-medium transition-colors">
          No show
        </button>
      )}
      {status !== 'cancelled' && (
        <button onClick={() => updateStatus('cancelled')} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
          Cancelar
        </button>
      )}
    </div>
  )
}
