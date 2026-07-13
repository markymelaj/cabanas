import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CabanaBookingExperience from '@/components/CabanaBookingExperience'
import { DEMO_CONFIG } from '@/lib/demo-config'
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
          <div className="container mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-dark justify-center mb-4">Demo · Reservas online</p>
            <h1 className="font-display text-5xl md:text-6xl mb-4">Consulta disponibilidad</h1>
            <p className="text-lago-200 leading-relaxed">
              Elige una cabaña, marca tus fechas, revisa el valor estimado y envía una solicitud con todos los datos necesarios para confirmar la estadía.
            </p>
          </div>
        </div>

        <section className="py-10 bg-white border-b border-arena-100">
          <div className="container mx-auto px-6 md:px-12 max-w-5xl">
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-2xl bg-arena-50 border border-arena-100 p-4"><strong className="text-lago-900">1. Elige cabaña</strong><p className="text-volcan-600 mt-1">Fotos, capacidad, precio y condiciones visibles.</p></div>
              <div className="rounded-2xl bg-arena-50 border border-arena-100 p-4"><strong className="text-lago-900">2. Marca fechas</strong><p className="text-volcan-600 mt-1">Disponibilidad y total estimado antes de enviar.</p></div>
              <div className="rounded-2xl bg-arena-50 border border-arena-100 p-4"><strong className="text-lago-900">3. Envía solicitud</strong><p className="text-volcan-600 mt-1">La información queda registrada para responder y confirmar.</p></div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-arena-50">
          <div className="container mx-auto px-6 md:px-12">
            {cabanas.length === 0 ? (
              <div className="max-w-xl mx-auto bg-white rounded-lg card-shadow p-8 text-center">
                <TreePine size={40} className="mx-auto text-lago-400 mb-4" />
                <h2 className="font-display text-3xl text-lago-900 mb-3">Reservas por WhatsApp</h2>
                <p className="text-volcan-500 text-sm leading-relaxed mb-6">
                  Las unidades disponibles se están cargando. También puedes consultar directamente por WhatsApp.
                </p>
                <a href={`https://wa.me/${DEMO_CONFIG.whatsappNumber}`} className="btn-primary inline-flex">
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
