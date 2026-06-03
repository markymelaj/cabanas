'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminReservationActions({
  reservationId,
  status,
}: {
  reservationId: string
  status: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    await fetch('/api/admin/update-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, status: newStatus }),
    })
    router.refresh()
    setLoading(false)
  }

  if (loading) return <Loader2 size={16} className="animate-spin text-volcán-400" />

  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <button onClick={() => updateStatus('confirmed')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors">
          Confirmar
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
