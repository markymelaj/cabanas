import Link from 'next/link'
import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DEMO_CONFIG, DEMO_MODES, SALES_PLANS } from '@/lib/demo-config'
import { CalendarCheck, CheckCircle2, ClipboardList, CreditCard, MessageCircle, ShieldCheck, Sparkles, Star, TreePine } from 'lucide-react'

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
      logSupabaseError('home.cabanas.list', error)
      return DEFAULT_CABANAS
    }

    const cabanas = (data as Cabana[]) ?? []
    return cabanas.length > 0 ? cabanas : DEFAULT_CABANAS
  } catch (error) {
    console.error('[home.cabanas.list]', error)
    return DEFAULT_CABANAS
  }
}

const FEATURES = [
  { icon: MessageCircle, title: 'WhatsApp ordenado', text: 'La consulta llega con fechas, datos, servicio, total estimado y link al panel.' },
  { icon: CalendarCheck, title: 'Disponibilidad y bloqueos', text: 'Control de fechas ocupadas, reservas pendientes, bloqueos manuales y eventos.' },
  { icon: ClipboardList, title: 'Panel administrativo', text: 'Reservas, cotizaciones, pagos, estados, clientes, notas y seguimiento.' },
  { icon: CreditCard, title: 'Pagos y comprobantes', text: 'Registro de anticipos, saldos, transferencias y comprobantes para ordenar caja.' },
  { icon: Sparkles, title: 'Asistente IA', text: 'Analiza choques de fecha, pagos pendientes, prioridades y deja historial operativo.' },
  { icon: ShieldCheck, title: 'Sistema propio', text: 'Sin comisiones por reserva. Adaptable a la marca, dominio y operación del cliente.' },
]

export default async function HomePage() {
  const cabanas = await getCabanas()

  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-screen flex items-end pb-20 overflow-hidden bg-lago-950">
          <img src={DEMO_CONFIG.heroImage} alt="Demo de reservas para turismo y eventos" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-950 via-lago-950/65 to-lago-950/15" />
          <div className="relative container mx-auto px-6 md:px-12">
            <div className="max-w-4xl animate-fade-up">
              <p className="text-arena-300 font-display text-lg italic mb-4 tracking-wide">{DEMO_CONFIG.businessType}</p>
              <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-none mb-6">
                Convierte consultas por WhatsApp en<br /><em className="text-arena-300">reservas ordenadas</em>
              </h1>
              <p className="text-lago-100 text-lg font-body font-light max-w-2xl mb-10 leading-relaxed">
                Demo comercial para cabañas, salones de eventos y complejos mixtos. El cliente consulta, el sistema calcula, el panel guarda y el negocio responde mejor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-white">Probar reservas de cabañas</Link>
                <Link href="/salon" className="btn-outline border-white/40 text-white hover:bg-white/10">Probar cotizador de salón</Link>
                <Link href="/admin" className="btn-outline border-arena-300/60 text-arena-100 hover:bg-arena-500/15">Ver panel demo</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-arena-600 font-display italic text-lg mb-3">Sistema adaptable</p>
              <h2 className="section-title mb-4">Una demo para tres tipos de cliente</h2>
              <p className="text-volcan-600 leading-relaxed">Sirve para vender a negocios que hoy reciben consultas desordenadas por WhatsApp y necesitan controlar disponibilidad, pagos y seguimiento desde un solo lugar.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {DEMO_MODES.map((mode) => (
                <article key={mode.title} className="rounded-2xl border border-arena-100 bg-arena-50 p-7">
                  <CheckCircle2 className="text-lago-700 mb-4" size={24} />
                  <h3 className="font-display text-2xl text-lago-900 mb-2">{mode.title}</h3>
                  <p className="text-sm text-volcan-600 leading-relaxed">{mode.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-arena-50" id="cabanas">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-xl mb-14">
              <p className="text-arena-600 font-display italic text-lg mb-3">Demo hospedaje</p>
              <h2 className="section-title mb-4">Reserva de cabañas</h2>
              <p className="text-volcan-600 text-base leading-relaxed">Muestra fotos, capacidad, precio por noche, limpieza, total estimado y solicitud directa por WhatsApp con respaldo en panel.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {cabanas.slice(0, 2).map((cab) => (
                <div key={cab.id} className="bg-white rounded-2xl overflow-hidden card-shadow group">
                  <div className="relative h-64 overflow-hidden bg-lago-100">
                    {cab.fotos?.[0] ? <img src={cab.fotos[0]} alt={cab.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-lago-300"><TreePine size={48} /></div>}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-lago-800">Hasta {cab.capacidad} personas</div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl text-lago-900 mb-2">{cab.nombre}</h3>
                    <p className="text-volcan-600 text-sm leading-relaxed mb-5">{cab.descripcion_corta}</p>
                    <div className="flex items-center justify-between pt-5 border-t border-arena-100">
                      <div><span className="text-2xl font-display font-medium text-lago-900">${cab.precio_noche.toLocaleString('es-CL')}</span><span className="text-volcan-500 text-sm ml-1">/ noche</span></div>
                      <Link href="/cabanas" className="btn-primary text-sm">Probar flujo</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-lago-900 text-white" id="salon">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-lago-300 font-display italic text-lg mb-3">Demo eventos</p>
                <h2 className="font-display text-5xl text-white font-light mb-6">Cotizador para<br /><em className="text-arena-300">salón de eventos</em></h2>
                <p className="text-lago-200 leading-relaxed mb-8">Permite cotizar matrimonios, cumpleaños, aniversarios o eventos corporativos con servicios adicionales y monto estimado antes de responder al cliente.</p>
                <ul className="space-y-2 mb-10">
                  {['Tipo de evento e invitados', 'Jornada completa o media jornada', 'Servicios adicionales por persona', 'Registro en panel y WhatsApp listo', 'Seguimiento comercial con estados'].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-lago-200"><span className="w-5 h-5 rounded-full bg-lago-700 flex items-center justify-center flex-shrink-0"><Star size={10} className="text-arena-300" /></span>{f}</li>
                  ))}
                </ul>
                <Link href="/salon" className="btn-primary bg-arena-500 hover:bg-arena-600">Cotizar evento demo</Link>
              </div>
              <div className="relative h-96 lg:h-[520px] rounded-2xl overflow-hidden bg-lago-800">
                <img src={DEMO_CONFIG.salonImage} alt="Salón de eventos demo" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12"><p className="text-arena-600 font-display italic text-lg mb-3">Qué se entrega</p><h2 className="section-title mb-4">Más que una página web</h2></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-xl border border-arena-100 bg-arena-50 p-6"><Icon className="text-lago-700 mb-4" size={24} /><h3 className="font-display text-xl text-lago-900 mb-2">{title}</h3><p className="text-sm text-volcan-600 leading-relaxed">{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-arena-50">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12"><p className="text-arena-600 font-display italic text-lg mb-3">Planes de referencia</p><h2 className="section-title mb-4">Valores claros para cerrar</h2><p className="text-sm text-volcan-600">Precios referenciales ajustables según cantidad de unidades, reglas de negocio, integraciones y puesta en marcha.</p></div>
            <div className="grid md:grid-cols-3 gap-6">
              {SALES_PLANS.map((plan) => (<article key={plan.name} className="rounded-2xl bg-white border border-arena-100 p-7 card-shadow"><h3 className="font-display text-2xl text-lago-900">{plan.name}</h3><p className="text-3xl font-display text-lago-800 mt-3">{plan.price}</p><p className="text-sm text-volcan-600 leading-relaxed mt-4">{plan.detail}</p></article>))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-lago-800 text-white text-center">
          <div className="container mx-auto px-6"><Sparkles size={40} className="mx-auto mb-6 text-arena-300 opacity-80" /><h2 className="font-display text-5xl font-light mb-4">Demo lista para mostrar</h2><p className="text-lago-200 max-w-xl mx-auto mb-8 text-base">Prueba el flujo público y luego entra al panel para mostrar cómo se ordenan las consultas, reservas, cotizaciones y decisiones operativas.</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600">Probar cabañas</Link><Link href="/salon" className="btn-outline border-white/40 text-white hover:bg-white/10">Probar salón</Link><Link href="/admin" className="btn-outline border-white/40 text-white hover:bg-white/10">Entrar al panel</Link></div></div>
        </section>
      </main>
      <Footer />
    </>
  )
}
