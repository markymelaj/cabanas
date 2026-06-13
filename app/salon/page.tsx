import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SalonQuoteFormV2 from '@/components/SalonQuoteFormV2'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { DEMO_CONFIG } from '@/lib/demo-config'

export const dynamic = 'force-dynamic'

async function getSalonConfig() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [{ data: settings }, { data: services }] = await Promise.all([
      supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('salon_services').select('*').eq('activa', true).order('orden'),
    ])
    return { settings, services: services ?? [] }
  } catch (error) {
    console.error('[salon.config]', error)
    return { settings: null, services: [] }
  }
}

export default async function SalonPage() {
  const { settings, services } = await getSalonConfig()
  const capacity = settings?.capacidad ?? 200
  const meters = settings?.metros_cuadrados ?? 290

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="relative bg-lago-900 text-white py-24 px-6 overflow-hidden">
          <img src={DEMO_CONFIG.salonImage} alt="Demo salón de eventos" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-lago-950/75" />
          <div className="relative container mx-auto max-w-3xl text-center">
            <p className="font-display italic text-lago-300 text-lg mb-3">Demo de eventos</p>
            <h1 className="font-display text-5xl md:text-6xl font-light mb-6">{settings?.nombre ?? 'Cotizador para salón de eventos'}</h1>
            <p className="text-lago-200 text-base leading-relaxed max-w-xl mx-auto">
              {settings?.descripcion ?? `Flujo adaptable para matrimonios, cumpleaños, aniversarios, empresas y celebraciones de hasta ${capacity} invitados.`}
            </p>
          </div>
        </div>

        <section className="bg-white py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Feature title={`${meters} m²`} desc="Espacio principal" />
              <Feature title={`${capacity} personas`} desc="Capacidad máxima" />
              <Feature title="Servicios" desc="Configurables" />
              <Feature title="Panel" desc="Seguimiento comercial" />
            </div>
          </div>
        </section>

        <section className="bg-arena-50 py-20 px-6">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <p className="text-arena-600 font-display italic text-lg mb-2">¿Tienes una fecha en mente?</p>
              <h2 className="font-display text-4xl text-lago-900 font-light">Cotiza tu evento</h2>
              <p className="text-volcan-500 text-sm mt-2">Completa el formulario y revisa cómo llega una solicitud ordenada al negocio.</p>
            </div>
            <SalonQuoteFormV2 settings={settings} services={services ?? []} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center p-5 rounded-lg bg-arena-50 border border-arena-100">
      <p className="font-display text-xl text-lago-900 mb-0.5">{title}</p>
      <p className="text-xs text-volcan-500">{desc}</p>
    </div>
  )
}
