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
          <img src={DEMO_CONFIG.salonImage} alt="Cotizador para eventos" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-lago-950/75" />
          <div className="relative container mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-dark justify-center mb-4">Módulo opcional · Eventos y celebraciones</p>
            <h1 className="font-display text-5xl md:text-6xl mb-6">{settings?.nombre ?? 'Cotizador para salón de eventos'}</h1>
            <p className="text-lago-200 text-base leading-relaxed max-w-xl mx-auto">
              {settings?.descripcion ?? `Recibe consultas de matrimonios, cumpleaños, reuniones de empresa y celebraciones de hasta ${capacity} invitados con datos claros desde el inicio.`}
            </p>
          </div>
        </div>

        <div className="bg-arena-100 border-b border-arena-200/70">
          <div className="container mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
            <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-arena-700 whitespace-nowrap">Módulo opcional</span>
            <p className="text-volcan-800 leading-relaxed">
              Este cotizador de salón / restaurante <strong>no viene incluido en el sistema base de reservas</strong>.
              Se contrata como adicional solo si tu negocio arrienda salón, recibe eventos o tiene restaurante.
            </p>
          </div>
        </div>

        <section className="bg-white py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Feature title={`${meters} m²`} desc="Espacio principal" />
              <Feature title={`${capacity} personas`} desc="Capacidad máxima" />
              <Feature title="Servicios" desc="Configurables" />
              <Feature title="Seguimiento" desc="Comercial" />
            </div>
          </div>
        </section>

        <section className="bg-arena-50 py-20 px-6">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <p className="eyebrow justify-center mb-3">Cotización de eventos</p>
              <h2 className="font-display text-4xl text-lago-900">Solicita una cotización</h2>
              <p className="text-volcan-500 text-sm mt-2">Completa fecha, tipo de evento, cantidad de invitados y servicios para recibir una respuesta ordenada.</p>
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
