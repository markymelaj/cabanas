import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CabanaBookingExperience from '@/components/CabanaBookingExperience'
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
              Revisa fotos, capacidad, precios y solicita la reserva sobre la cabaña que quieres.
            </p>
          </div>
        </div>

        <section className="py-20 bg-arena-50">
          <div className="container mx-auto px-6 md:px-12">
            {cabanas.length === 0 ? (
              <div className="max-w-xl mx-auto bg-white rounded-lg card-shadow p-8 text-center">
                <TreePine size={40} className="mx-auto text-lago-400 mb-4" />
                <h2 className="font-display text-3xl text-lago-900 mb-3">Reservas por WhatsApp</h2>
                <p className="text-volcan-500 text-sm leading-relaxed mb-6">
                  Estamos cargando la disponibilidad de cabañas. Escríbenos y te ayudamos a reservar directamente.
                </p>
                <a href="https://wa.me/56957845292" className="btn-primary inline-flex">
                  Consultar disponibilidad
                </a>
              </div>
            ) : (
              <CabanaBookingExperience cabanas={cabanas} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
