'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

type Note = {
  id: string
  note: string
  created_by: string | null
  created_at: string
}

export default function AdminNotesPanel({
  notes,
  clientId,
  reservationId,
  salonQuoteId,
}: {
  notes: Note[]
  clientId?: string | null
  reservationId?: string | null
  salonQuoteId?: string | null
}) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, clientId, reservationId, salonQuoteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la nota.')
      setNote('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-arena-100 rounded-lg p-5">
      <h3 className="font-display text-xl text-lago-900 mb-4">Seguimiento</h3>
      <div className="space-y-3 mb-4">
        {notes.length === 0 ? (
          <p className="text-sm text-volcan-500">Sin notas todavia.</p>
        ) : notes.map((item) => (
          <div key={item.id} className="rounded-lg bg-arena-50 p-3">
            <p className="text-sm text-lago-900 whitespace-pre-wrap">{item.note}</p>
            <p className="mt-2 text-[11px] text-volcan-400">
              {item.created_by ?? 'admin'} · {new Date(item.created_at).toLocaleString('es-CL')}
            </p>
          </div>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="input-field min-h-24"
        placeholder="Agregar avance, acuerdo, llamada, condicion especial..."
      />
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={loading || !note.trim()} className="btn-outline mt-3 w-full disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : <><Plus size={16} />Agregar nota</>}
      </button>
    </div>
  )
}
