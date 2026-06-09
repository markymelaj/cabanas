'use client'

import { useRef, useState } from 'react'
import { BedDouble, Bath, Home, Users } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { formatCLP } from '@/lib/pricing'
import { cabanaPhotos, displayCabana, polishCabanaText } from '@/lib/cabana-display'
import CabanaReservationForm from '@/components/CabanaReservationForm'

function photosOf(cabana: Cabana) {
  return cabanaPhotos(cabana)
}

export default function CabanaBookingExperience({ cabanas }: { cabanas: Cabana[] }) {
  const [selectedId, setSelectedId] = useState(cabanas[0]?.id ?? '')
  const formRef = useRef<HTMLDivElement>(null)

  function selectCabana(id: string) {
    setSelectedId(id)
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div className="space-y-14">
      <section>
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-arena-600 font-display italic text-lg mb-2">Opciones disponibles</p>
          <h2 className="font-display text-4xl text-lago-900 font-light">Elige tu cabaña</h2>
          <p className="text-sm text-volcan-500 mt-2">Revisa fotos, capacidad y precio antes de solicitar la reserva.</p>
        </div>

        <div className="grid gap-8 max-w-5xl mx-auto">
          {cabanas.map((rawCabana) => {
            const cabana = displayCabana(rawCabana)
            const photos = photosOf(rawCabana)
            const selected = selectedId === rawCabana.id
            return (
              <article key={rawCabana.id} className={`bg-white border rounded-lg overflow-hidden transition-colors ${selected ? 'border-lago-500' : 'border-arena-100'}`}>
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="grid grid-cols-3 gap-1 bg-arena-100 min-h-[280px]">
                    {photos.length > 0 ? photos.map((photo, index) => (
                      <div key={photo} className={`${index === 0 ? 'col-span-2 row-span-2' : ''} min-h-[138px] overflow-hidden bg-lago-50`}>
                        <img src={photo} alt={`${cabana.nombre} foto ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    )) : (
                      <div className="col-span-3 flex min-h-[280px] items-center justify-center text-lago-300">
                        <Home size={44} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Hospedaje</p>
                      <h3 className="font-display text-3xl text-lago-900 mt-1">{cabana.nombre}</h3>
                      {cabana.subtitulo && <p className="text-sm text-lago-700 mt-1">{cabana.subtitulo}</p>}
                      <p className="text-sm text-volcan-600 leading-relaxed mt-4">{cabana.descripcion_corta ?? cabana.descripcion}</p>

                      <div className="grid grid-cols-2 gap-3 my-6 text-sm">
                        <Spec icon={Users} label={`Hasta ${cabana.capacidad} personas`} />
                        <Spec icon={BedDouble} label={`${cabana.dormitorios ?? 1} dormitorio${Number(cabana.dormitorios ?? 1) === 1 ? '' : 's'}`} />
                        <Spec icon={Bath} label={`${cabana.banos ?? 1} baño${Number(cabana.banos ?? 1) === 1 ? '' : 's'}`} />
                        <Spec icon={Home} label={cabana.camas || `${cabana.min_noches ?? 1} noche min.`} />
                      </div>

                      {cabana.amenidades?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cabana.amenidades.slice(0, 8).map((item) => (
                            <span key={item} className="rounded-full bg-arena-50 px-3 py-1 text-xs text-volcan-600">{item}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-7 flex flex-col gap-4 border-t border-arena-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-display text-3xl text-lago-900">{formatCLP(Number(cabana.precio_noche ?? 0))}</p>
                        <p className="text-xs text-volcan-500">por noche · limpieza {formatCLP(Number(cabana.precio_limpieza ?? 0))}</p>
                      </div>
                      <button onClick={() => selectCabana(rawCabana.id)} className={selected ? 'btn-outline' : 'btn-primary'}>
                        Reservar esta cabaña
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section ref={formRef} className="max-w-2xl mx-auto scroll-mt-24">
        <div className="text-center mb-8">
          <p className="text-arena-600 font-display italic text-lg mb-2">Reserva tu estadia</p>
          <h2 className="font-display text-4xl text-lago-900 font-light">Solicita tu reserva</h2>
          <p className="text-volcan-500 text-sm mt-2">Elige fechas, revisa el total y envia la solicitud por WhatsApp.</p>
        </div>
        <CabanaReservationForm key={selectedId} cabanas={cabanas.map(displayCabana)} initialCabanaId={selectedId} />
      </section>
    </div>
  )
}

function Spec({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-arena-50 px-3 py-2 text-volcan-600">
      <Icon size={15} className="text-lago-600" />
      <span>{polishCabanaText(label)}</span>
    </div>
  )
}
