'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Cabana { id: string; nombre: string; slug: string }
interface BlockedDate { id: string; fecha: string; cabana_id: string | null; tipo: string; motivo: string | null }

export default function AdminBlockDates({
  cabanas,
  blocked,
}: {
  cabanas: Cabana[]
  blocked: BlockedDate[]
}) {
  const [form, setForm] = useState({ fecha: '', cabanaId: '', tipo: 'cabana', motivo: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleBlock() {
    if (!form.fecha) return
    setLoading(true)
    await fetch('/api/admin/block-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.refresh()
    setForm({ fecha: '', cabanaId: '', tipo: 'cabana', motivo: '' })
    setLoading(false)
  }

  async function handleUnblock(id: string) {
    await fetch('/api/admin/block-date', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  const fmtDate = (d: string) => format(new Date(d + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario bloqueo */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="font-display text-xl text-lago-900 mb-5">Bloquear fecha</h2>
        <div className="space-y-4">
          <div>
            <label className="label-text">Tipo</label>
            <div className="flex gap-3 mt-1">
              {['cabana', 'salon'].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, tipo: t, cabanaId: '' })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.tipo === t ? 'border-lago-600 bg-lago-50 text-lago-800' : 'border-volcán-200 text-volcán-600'}`}
                >
                  {t === 'cabana' ? '🏠 Cabaña' : '🎉 Salón'}
                </button>
              ))}
            </div>
          </div>

          {form.tipo === 'cabana' && (
            <div>
              <label className="label-text">Cabaña</label>
              <select value={form.cabanaId} onChange={(e) => setForm({ ...form, cabanaId: e.target.value })} className="input-field">
                <option value="">Todas las cabañas</option>
                {cabanas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label-text">Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="label-text">Motivo (opcional)</label>
            <input type="text" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Ej: Mantenimiento, evento privado..." className="input-field" />
          </div>

          <button onClick={handleBlock} disabled={!form.fecha || loading} className="btn-primary w-full disabled:opacity-40">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Bloqueando...</span> : 'Bloquear fecha'}
          </button>
        </div>
      </div>

      {/* Lista fechas bloqueadas */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="p-5 border-b border-arena-100">
          <h2 className="font-display text-xl text-lago-900">Fechas bloqueadas</h2>
        </div>
        {blocked.length === 0 ? (
          <p className="text-volcán-500 text-sm p-5">No hay fechas bloqueadas.</p>
        ) : (
          <div className="divide-y divide-arena-50 max-h-96 overflow-y-auto">
            {blocked.map((b) => {
              const cabana = cabanas.find((c) => c.id === b.cabana_id)
              return (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-lago-900">{fmtDate(b.fecha)}</p>
                    <p className="text-xs text-volcán-500">
                      {b.tipo === 'salon' ? '🎉 Salón' : `🏠 ${cabana?.nombre ?? 'Todas las cabañas'}`}
                      {b.motivo && ` · ${b.motivo}`}
                    </p>
                  </div>
                  <button onClick={() => handleUnblock(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-volcán-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
