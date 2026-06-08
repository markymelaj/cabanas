'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload } from 'lucide-react'

export default function AdminPaymentForm({
  reservationId,
  salonQuoteId,
  clientId,
}: {
  reservationId?: string | null
  salonQuoteId?: string | null
  clientId?: string | null
}) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('transferencia')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      if (reservationId) form.set('reservationId', reservationId)
      if (salonQuoteId) form.set('salonQuoteId', salonQuoteId)
      if (clientId) form.set('clientId', clientId)
      form.set('amount', amount)
      form.set('method', method)
      form.set('paidAt', `${paidAt}T12:00:00`)
      form.set('note', note)
      if (file) form.set('voucher', file)

      const res = await fetch('/api/admin/payments', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el pago.')

      setAmount('')
      setNote('')
      setFile(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-arena-100 rounded-lg p-5 space-y-3">
      <h3 className="font-display text-xl text-lago-900">Registrar pago</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label-text">Monto</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" className="input-field" />
        </div>
        <div>
          <label className="label-text">Metodo</label>
          <select value={method} onChange={(event) => setMethod(event.target.value)} className="input-field">
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label-text">Fecha pago</label>
          <input value={paidAt} onChange={(event) => setPaidAt(event.target.value)} type="date" className="input-field" />
        </div>
        <div>
          <label className="label-text">Comprobante</label>
          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-volcan-300 bg-white px-4 text-sm text-lago-800 hover:bg-arena-50">
            <Upload size={15} />
            {file ? file.name : 'Subir archivo'}
            <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>
      <div>
        <label className="label-text">Nota</label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} className="input-field min-h-20" />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={loading || !amount} className="btn-primary w-full disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Guardar pago'}
      </button>
    </div>
  )
}
