import Link from 'next/link'
import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CabanaReservationForm from '@/components/CabanaReservationForm'
import { TreePine } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCabanas(): Promise<Cabana[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .eq('activa', true)
      .order('orden')

    if (error) {
      logSupabaseError('cabanas.list', error)
      return DEFAULT_CABANAS
    }

    const cabanas = (data as Cabana[]) ?? []
    return cabanas.length > 0 ? cabanas : DEFAULT_CABANAS
  } catch (error) {
    console.error('[cabanas.list]', error)
    return DEFAULT_CABANAS
  }
}

export default async function CabanasPage() {
  const cabanas = await getCabanas()

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="bg-lago-900 text-white py-20 px-6 md:px-12">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="font-display italic text-lago-300 text-lg mb-3">Hospedaje</p>
            <h1 className="font-display text-5xl md:text-6xl font-light mb-4">Nuestras cabañas</h1>
            <p className="text-lago-200 leading-relaxed">
              Diseñadas para conectar con el paisaje. Vista a los volcanes y el lago Llanquihue desde tu terraza.
            </p>
          </div>
        </div>
        <section className="py-20 bg-arena-50">
          <div className="container mx-auto px-6 md:px-12">
            {cabanas.length === 0 ? (
              <div className="max-w-xl mx-auto bg-white rounded-2xl card-shadow p-8 text-center">
                <TreePine size={40} className="mx-auto text-lago-400 mb-4" />
                <h2 className="font-display text-3xl text-lago-900 mb-3">Reservas por WhatsApp</h2>
                <p className="text-volcÃ¡n-500 text-sm leading-relaxed mb-6">
                  Estamos cargando la disponibilidad de cabaÃ±as. EscrÃ­benos y te ayudamos a reservar directamente.
                </p>
                <a href="https://wa.me/56965880268" className="btn-primary inline-flex">
                  Consultar disponibilidad
                </a>
              </div>
            ) : (
              <>
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="text-center mb-10">
                    <p className="text-arena-600 font-display italic text-lg mb-2">Reserva tu estadia</p>
                    <h2 className="font-display text-4xl text-lago-900 font-light">Solicita tu cabana</h2>
                    <p className="text-volcÃ¡n-500 text-sm mt-2">Elige cabana, fechas y datos. Te contactamos para confirmar en menos de 24 horas.</p>
                  </div>
                  <CabanaReservationForm cabanas={cabanas} />
                </div>

                <div className="max-w-4xl mx-auto mb-8">
                  <p className="text-arena-600 font-display italic text-lg mb-2">Opciones</p>
                  <h2 className="font-display text-4xl text-lago-900 font-light">Cabanas disponibles</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                  {cabanas.map((cab) => (
                <div key={cab.id} className="bg-white rounded-2xl overflow-hidden card-shadow group">
                  <div className="relative h-72 overflow-hidden bg-lago-100">
                    {cab.fotos[0] ? (
                      <img src={cab.fotos[0]} alt={cab.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lago-300"><TreePine size={48} /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-lago-800">
                      Hasta {cab.capacidad} personas
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className="font-display text-3xl text-lago-900 mb-2">{cab.nombre}</h2>
                    <p className="text-volcán-600 text-sm leading-relaxed mb-6">{cab.descripcion}</p>
                    <ul className="grid grid-cols-2 gap-2 mb-7">
                      {cab.amenidades.map((a) => (
                        <li key={a} className="text-xs text-volcán-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-lago-400 flex-shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-6 border-t border-arena-100">
                      <div>
                        <span className="text-3xl font-display font-medium text-lago-900">${cab.precio_noche.toLocaleString('es-CL')}</span>
                        <span className="text-volcán-500 text-sm ml-1">/ noche</span>
                        <p className="text-xs text-volcán-400 mt-0.5">+ ${cab.precio_limpieza.toLocaleString('es-CL')} limpieza</p>
                      </div>
                      <Link href={`/reservar/${cab.slug}`} className="btn-primary">
                        Reservar ahora
                      </Link>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
