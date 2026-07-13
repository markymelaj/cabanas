'use client'

import { useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bath, BedDouble, Check, Home, Users } from 'lucide-react'
import type { Cabana } from '@/lib/supabase'
import { displayCabana, polishCabanaText } from '@/lib/cabana-display'
import { formatCLP } from '@/lib/pricing'
import CabanaReservationForm from '@/components/CabanaReservationForm'

function photosOf(cabana: Cabana) {
  return Array.isArray(cabana.fotos) ? cabana.fotos.filter(Boolean).slice(0, 3) : []
}

export default function CabanaBookingExperience({ cabanas }: { cabanas: Cabana[] }) {
  const [selectedId, setSelectedId] = useState(cabanas[0]?.id ?? '')
  const formRef = useRef<HTMLDivElement>(null)

  function selectCabana(id: string) {
    setSelectedId(id)
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-6xl">
        <div className="mb-9 max-w-3xl">
          <p className="eyebrow mb-3">Elige tu refugio</p>
          <h2 className="section-title">Unidades simples, información clara.</h2>
          <p className="mt-5 text-volcan-700">Compara capacidad, distribución y precio. Al elegir una unidad pasarás directamente a fechas y disponibilidad.</p>
        </div>

        <div className="grid gap-7">
          {cabanas.map((rawCabana) => {
            const cabana = displayCabana(rawCabana)
            const photos = photosOf(rawCabana)
            const selected = selectedId === rawCabana.id
            return (
              <article key={rawCabana.id} className={`overflow-hidden rounded-3xl border bg-white transition-all ${selected ? 'border-lago-600 shadow-xl shadow-lago-900/10' : 'border-arena-200 shadow-sm'}`}>
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="grid min-h-[300px] grid-cols-3 gap-1 bg-arena-100 sm:min-h-[380px]">
                    {photos.length > 0 ? photos.map((photo, index) => (
                      <div key={photo} className={`${index === 0 ? 'col-span-2 row-span-2' : ''} min-h-[148px] overflow-hidden bg-lago-50`}>
                        <img src={photo} alt={`${cabana.nombre}, vista ${index + 1}`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                      </div>
                    )) : <div className="col-span-3 flex min-h-[300px] items-center justify-center text-lago-300"><Home size={50} /></div>}
                  </div>

                  <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-arena-600">Alojamiento</p><h3 className="mt-2 font-display text-3xl tracking-tight text-lago-950 sm:text-4xl">{cabana.nombre}</h3></div>
                        {selected && <span className="inline-flex items-center gap-1 rounded-full bg-lago-100 px-3 py-1 text-xs font-bold text-lago-800"><Check size={13} /> Elegida</span>}
                      </div>
                      {cabana.subtitulo && <p className="mt-2 text-sm font-medium text-lago-700">{cabana.subtitulo}</p>}
                      <p className="mt-5 text-sm leading-relaxed text-volcan-600">{cabana.descripcion_corta ?? cabana.descripcion}</p>

                      <div className="my-7 grid grid-cols-2 gap-3 text-sm">
                        <Spec icon={Users} label={`Hasta ${cabana.capacidad} personas`} />
                        <Spec icon={BedDouble} label={`${cabana.dormitorios ?? 1} dormitorio${Number(cabana.dormitorios ?? 1) === 1 ? '' : 's'}`} />
                        <Spec icon={Bath} label={`${cabana.banos ?? 1} baño${Number(cabana.banos ?? 1) === 1 ? '' : 's'}`} />
                        <Spec icon={Home} label={`${cabana.min_noches ?? 1} noche${Number(cabana.min_noches ?? 1) === 1 ? '' : 's'} mínimo`} />
                      </div>

                      {cabana.amenidades?.length > 0 && <div className="flex flex-wrap gap-2">{cabana.amenidades.slice(0, 7).map((item) => <span key={item} className="rounded-full bg-arena-50 px-3 py-1.5 text-xs text-volcan-600">{item}</span>)}</div>}
                    </div>

                    <div className="mt-8 flex flex-col gap-5 border-t border-arena-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
                      <div><p className="font-display text-3xl text-lago-950">{formatCLP(Number(cabana.precio_noche ?? 0))}</p><p className="text-xs text-volcan-500">por noche · limpieza {formatCLP(Number(cabana.precio_limpieza ?? 0))}</p></div>
                      <button type="button" onClick={() => selectCabana(rawCabana.id)} className={selected ? 'btn-outline' : 'btn-primary'}>{selected ? 'Revisar fechas' : 'Elegir y ver fechas'}</button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section ref={formRef} className="mx-auto max-w-3xl scroll-mt-24">
        <div className="mb-8 text-center"><p className="eyebrow justify-center mb-3">Disponibilidad y valor</p><h2 className="section-title">Prepara tu solicitud.</h2><p className="mt-4 text-sm text-volcan-600">Las fechas se verifican nuevamente al enviar. La reserva queda pendiente hasta confirmar el anticipo.</p></div>
        <CabanaReservationForm key={selectedId} cabanas={cabanas.map(displayCabana)} initialCabanaId={selectedId} />
      </section>
    </div>
  )
}

function Spec({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-arena-50 px-3 py-2.5 text-volcan-700"><Icon size={16} className="shrink-0 text-lago-600" /><span>{polishCabanaText(label)}</span></div>
}
