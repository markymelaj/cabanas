import { notFound } from 'next/navigation'
import { supabaseAdmin, type Cabana } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReservationCalendar from '@/components/ReservationCalendar'

export const revalidate = 0

async function getCabana(slug: string): Promise<Cabana | null> {
  const { data } = await supabaseAdmin
    .from('cabanas')
    .select('*')
    .eq('slug', slug)
    .eq('activa', true)
    .single()
  return data as Cabana | null
}

async function getOccupiedDates(cabanaId: string): Promise<string[]> {
  const { data } = await supabaseAdmin.rpc('get_occupied_dates', {
    p_cabana_id: cabanaId,
  })
  return (data as { get_occupied_dates: string }[])?.map((r) => r.get_occupied_dates) ?? []
}

export default async function ReservarPage({ params }: { params: { id: string } }) {
  const cabana = await getCabana(params.id)
  if (!cabana) notFound()

  const occupiedDates = await getOccupiedDates(cabana.id)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-arena-50">
        <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <p className="text-volcán-500 text-sm mb-1">Reservar</p>
              <h1 className="font-display text-4xl text-lago-900 mb-6">{cabana.nombre}</h1>
              <ReservationCalendar
                cabana={cabana}
                occupiedDates={occupiedDates}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden card-shadow sticky top-24">
                {cabana.fotos[0] && (
                  <img src={cabana.fotos[0]} alt={cabana.nombre} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl text-lago-900 mb-1">{cabana.nombre}</h3>
                  <p className="text-xs text-volcán-500 mb-4">Hasta {cabana.capacidad} personas</p>
                  <ul className="space-y-1.5">
                    {cabana.amenidades.slice(0, 6).map((a) => (
                      <li key={a} className="text-xs text-volcán-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-lago-400 flex-shrink-0" />{a}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-arena-100 mt-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-volcán-500">Precio por noche</span>
                      <span className="font-medium text-lago-900">${cabana.precio_noche.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-volcán-500">Limpieza</span>
                      <span className="font-medium text-lago-900">${cabana.precio_limpieza.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
