'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react'

type Guest = {
  nombre: string
  documento: string
  edad: string
}

export default function GuestCheckInForm({ token, expectedGuests }: { token: string; expectedGuests: number }) {
  const [guests, setGuests] = useState<Guest[]>(
    Array.from({ length: Math.max(1, expectedGuests || 1) }).map(() => ({ nombre: '', documento: '', edad: '' }))
  )
  const [arrivalTime, setArrivalTime] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [documento, setDocumento] = useState('')
  const [direccion, setDireccion] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateGuest(index: number, patch: Partial<Guest>) {
    setGuests((current) => current.map((guest, idx) => idx === index ? { ...guest, ...patch } : guest))
  }

  async function submit() {
    setError(null)
    const validGuests = guests.filter((guest) => guest.nombre.trim())
    if (validGuests.length === 0) {
      setError('Ingresa al menos un huésped.')
      return
    }
    if (!accepted) {
      setError('Debes aceptar las condiciones de estadía.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/check-in/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: validGuests, arrivalTime, vehiclePlate, documento, direccion, accepted }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No pudimos guardar el check-in.')
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-arena-100 rounded-lg p-8 text-center">
        <CheckCircle size={42} className="mx-auto text-lago-700 mb-3" />
        <h2 className="font-display text-3xl text-lago-900">Check-in recibido</h2>
        <p className="text-sm text-volcan-500 mt-2">El equipo revisará tus datos y te contactará si necesita algo más.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-arena-100 rounded-lg p-6 space-y-5">
      <div>
        <label className="label-text">Documento titular</label>
        <input value={documento} onChange={(event) => setDocumento(event.target.value)} className="input-field" placeholder="RUT, DNI o pasaporte" />
      </div>
      <div>
        <label className="label-text">Dirección titular</label>
        <input value={direccion} onChange={(event) => setDireccion(event.target.value)} className="input-field" placeholder="Dirección de contacto" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="label-text mb-0">Huéspedes</label>
          <button
            onClick={() => setGuests((current) => [...current, { nombre: '', documento: '', edad: '' }])}
            className="btn-outline px-3 py-2 text-xs"
          >
            <Plus size={14} />Agregar
          </button>
        </div>
        {guests.map((guest, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_0.8fr_0.35fr_auto]">
            <input value={guest.nombre} onChange={(event) => updateGuest(index, { nombre: event.target.value })} className="input-field" placeholder="Nombre completo" />
            <input value={guest.documento} onChange={(event) => updateGuest(index, { documento: event.target.value })} className="input-field" placeholder="Documento" />
            <input value={guest.edad} onChange={(event) => updateGuest(index, { edad: event.target.value })} className="input-field" placeholder="Edad" />
            <button
              onClick={() => setGuests((current) => current.filter((_, idx) => idx !== index))}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
              aria-label="Quitar huésped"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label-text">Hora estimada de llegada</label>
          <input value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} className="input-field" placeholder="Ej: 16:30" />
        </div>
        <div>
          <label className="label-text">Patente vehículo</label>
          <input value={vehiclePlate} onChange={(event) => setVehiclePlate(event.target.value)} className="input-field" placeholder="Opcional" />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-arena-100 p-4 text-sm text-volcan-600">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" />
        <span>Declaro que la información ingresada es correcta y acepto las condiciones de estadía, horarios y normas del recinto.</span>
      </label>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button onClick={submit} disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />Guardando</> : 'Enviar check-in'}
      </button>
    </div>
  )
}
