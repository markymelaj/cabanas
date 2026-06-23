import Link from 'next/link'
import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DEMO_CONFIG, SALES_PLANS } from '@/lib/demo-config'
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  TreePine,
  Users,
} from 'lucide-react'

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

const PRODUCT_POINTS = [
  { icon: MessageCircle, title: 'Consultas ordenadas', text: 'El huésped envía fechas, datos, cabaña, huéspedes y total estimado en un mensaje listo para responder.' },
  { icon: CalendarCheck, title: 'Disponibilidad clara', text: 'Reservas confirmadas, fechas ocupadas, bloqueos manuales y solicitudes pendientes desde un solo lugar.' },
  { icon: CreditCard, title: 'Pagos controlados', text: 'Anticipos, saldos, comprobantes, estados de pago y notas internas para no perder seguimiento.' },
  { icon: LayoutDashboard, title: 'Panel para el dueño', text: 'Dashboard con próximas llegadas, reservas pendientes, ocupación operativa y acciones rápidas.' },
]

const STEPS = [
  { title: 'El huésped consulta', text: 'Elige cabaña, fechas y cantidad de personas. Antes de escribir, ve un total estimado.' },
  { title: 'El sistema guarda', text: 'La solicitud queda registrada en el panel con cliente, monto, fechas y estado inicial.' },
  { title: 'El negocio confirma', text: 'Desde el admin se contacta por WhatsApp, se confirma, se registra pago y se bloquea disponibilidad.' },
]

const ADMIN_BENEFITS = [
  'Crear reservas manuales si alguien llama o llega directo.',
  'Filtrar por fecha, cabaña, estado, cliente, teléfono o código.',
  'Registrar standby, pendiente, confirmada, check-in, check-out, cancelada o no-show.',
  'Consultar alertas operativas y mensajes sugeridos para responder más rápido.',
]

export default async function HomePage() {
  const cabanas = await getCabanas()

  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-screen flex items-end pb-20 pt-28 overflow-hidden bg-lago-950">
          <img src={DEMO_CONFIG.heroImage} alt="Sistema de reservas para cabañas" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-950 via-lago-950/72 to-lago-950/20" />
          <div className="relative container mx-auto px-6 md:px-12">
            <div className="max-w-4xl animate-fade-up">
              <p className="inline-flex rounded-full border border-arena-300/30 bg-white/10 px-4 py-2 text-arena-200 text-xs uppercase tracking-[0.18em] mb-5">
                Producto base para cabañas
              </p>
              <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-none mb-6">
                Deja de perder reservas<br /><em className="text-arena-300">por WhatsApp desordenado</em>
              </h1>
              <p className="text-lago-100 text-lg font-body font-light max-w-2xl mb-10 leading-relaxed">
                Demo comercial para negocios de cabañas que necesitan mostrar disponibilidad, recibir consultas completas, confirmar reservas, controlar pagos y operar desde un panel simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-white">Probar reserva como huésped</Link>
                <Link href="/admin" className="btn-outline border-white/40 text-white hover:bg-white/10">Entrar al panel demo</Link>
                <Link href="#modulos" className="btn-outline border-arena-300/60 text-arena-100 hover:bg-arena-500/15">Ver módulo salón</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-b border-arena-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['Sin comisión por reserva', 'Sistema propio para el negocio'],
                ['WhatsApp listo', 'Menos ida y vuelta con el huésped'],
                ['Panel móvil', 'El dueño puede operar desde el celular'],
                ['Salón opcional', 'Se suma solo si el cliente lo necesita'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-arena-50 border border-arena-100 p-5">
                  <p className="font-display text-xl text-lago-900">{title}</p>
                  <p className="text-sm text-volcan-600 mt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-arena-50" id="como-funciona">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
              <div>
                <p className="text-arena-600 font-display italic text-lg mb-3">Venta guiada</p>
                <h2 className="section-title mb-5">Un recorrido simple para mostrar al cliente</h2>
                <p className="text-volcan-600 leading-relaxed mb-7">
                  La demo está pensada para enviarse por WhatsApp y probarse en pocos minutos: primero como huésped, después como dueño.
                </p>
                <Link href="/cabanas" className="btn-primary">Empezar por la reserva <ArrowRight size={16} /></Link>
              </div>
              <div className="grid gap-4">
                {STEPS.map((step, index) => (
                  <article key={step.title} className="rounded-2xl bg-white border border-arena-100 p-6 card-shadow">
                    <div className="flex gap-4">
                      <span className="h-9 w-9 rounded-full bg-lago-700 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">{index + 1}</span>
                      <div>
                        <h3 className="font-display text-2xl text-lago-900">{step.title}</h3>
                        <p className="text-sm text-volcan-600 leading-relaxed mt-1">{step.text}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white" id="cabanas">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-12">
              <p className="text-arena-600 font-display italic text-lg mb-3">Producto central</p>
              <h2 className="section-title mb-4">Reservas para cabañas</h2>
              <p className="text-volcan-600 leading-relaxed">Muestra fotos, capacidad, precio por noche, limpieza, total estimado y solicitud directa por WhatsApp con respaldo en panel.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {cabanas.slice(0, 2).map((cab) => (
                <div key={cab.id} className="bg-white rounded-2xl overflow-hidden card-shadow group border border-arena-100">
                  <div className="relative h-64 overflow-hidden bg-lago-100">
                    {cab.fotos?.[0] ? <img src={cab.fotos[0]} alt={cab.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-lago-300"><TreePine size={48} /></div>}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-lago-800">Hasta {cab.capacidad} personas</div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl text-lago-900 mb-2">{cab.nombre}</h3>
                    <p className="text-volcan-600 text-sm leading-relaxed mb-5">{cab.descripcion_corta}</p>
                    <div className="grid grid-cols-3 gap-2 mb-5 text-xs text-volcan-600">
                      <span className="rounded-lg bg-arena-50 px-3 py-2 flex items-center gap-1"><Users size={13} /> {cab.capacidad}</span>
                      <span className="rounded-lg bg-arena-50 px-3 py-2 flex items-center gap-1"><BedDouble size={13} /> {cab.dormitorios ?? 1}</span>
                      <span className="rounded-lg bg-arena-50 px-3 py-2 flex items-center gap-1"><TreePine size={13} /> Demo</span>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-arena-100 gap-4">
                      <div><span className="text-2xl font-display font-medium text-lago-900">${cab.precio_noche.toLocaleString('es-CL')}</span><span className="text-volcan-500 text-sm ml-1">/ noche</span></div>
                      <Link href="/cabanas" className="btn-primary text-sm whitespace-nowrap">Probar flujo</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-lago-900 text-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
              <div>
                <p className="text-lago-300 font-display italic text-lg mb-3">Qué se entrega</p>
                <h2 className="font-display text-5xl text-white font-light mb-5">Más que una página web</h2>
                <p className="text-lago-200 leading-relaxed mb-8">El producto se vende como sistema operativo simple: una experiencia pública para captar reservas y un panel privado para que el negocio no dependa de memoria, papel o mensajes perdidos.</p>
                <Link href="/admin" className="btn-primary bg-arena-500 hover:bg-arena-600">Ver panel demo</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {PRODUCT_POINTS.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-sm p-6">
                    <Icon className="text-arena-300 mb-4" size={24} />
                    <h3 className="font-display text-2xl text-white mb-2">{title}</h3>
                    <p className="text-sm text-lago-200 leading-relaxed">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="rounded-3xl bg-arena-50 border border-arena-100 p-6 md:p-8 card-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Panel demo</p>
                    <h3 className="font-display text-3xl text-lago-900">Vista del dueño</h3>
                  </div>
                  <LayoutDashboard className="text-lago-700" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    ['Pendientes', '8'],
                    ['Confirmadas', '21'],
                    ['Ingreso mes', '$2.480.000'],
                    ['Llegadas', '4 hoy'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white border border-arena-100 p-4">
                      <p className="text-xs text-volcan-500">{label}</p>
                      <p className="font-display text-2xl text-lago-900 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {ADMIN_BENEFITS.map((benefit) => (
                    <p key={benefit} className="rounded-xl bg-white px-4 py-3 text-sm text-volcan-700 flex gap-2"><CheckCircle2 size={16} className="text-lago-700 flex-shrink-0 mt-0.5" />{benefit}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-arena-600 font-display italic text-lg mb-3">Diferencial comercial</p>
                <h2 className="section-title mb-5">El dueño entiende el valor sin explicación larga</h2>
                <p className="text-volcan-600 leading-relaxed mb-6">La demo muestra el problema real: consultas sueltas por WhatsApp, reservas que no se confirman, pagos que quedan pendientes y fechas que se pisan. El panel transforma eso en seguimiento.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/cabanas" className="btn-primary">Probar como huésped</Link>
                  <Link href="/admin" className="btn-outline">Probar como dueño</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-arena-50" id="modulos">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-arena-600 font-display italic text-lg mb-3">Producto ampliable</p>
              <h2 className="section-title mb-4">Cabañas primero. Salón si hace falta.</h2>
              <p className="text-volcan-600 leading-relaxed">Para vender rápido, el producto base se enfoca en cabañas. Si el cliente también tiene eventos, se activa el módulo de salón como adicional.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SALES_PLANS.map((plan) => (
                <article key={plan.name} className="rounded-2xl bg-white border border-arena-100 p-7 card-shadow relative overflow-hidden">
                  {'badge' in plan && <p className="inline-flex rounded-full bg-lago-50 text-lago-700 px-3 py-1 text-xs font-medium mb-4">{plan.badge}</p>}
                  <h3 className="font-display text-2xl text-lago-900">{plan.name}</h3>
                  <p className="text-3xl font-display text-lago-800 mt-3">{plan.price}</p>
                  <p className="text-sm text-volcan-600 leading-relaxed mt-4">{plan.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 rounded-3xl bg-lago-900 text-white p-7 md:p-9 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="font-display text-3xl font-light mb-2">Módulo salón de eventos</p>
                <p className="text-lago-200 text-sm leading-relaxed">Cotizador por tipo de evento, invitados, jornada, servicios adicionales, WhatsApp ordenado y seguimiento comercial. Se presenta como extra, no como obligación.</p>
              </div>
              <Link href="/salon" className="btn-primary bg-arena-500 hover:bg-arena-600"><PartyPopper size={16} /> Ver módulo salón</Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-lago-800 text-white text-center">
          <div className="container mx-auto px-6">
            <Sparkles size={40} className="mx-auto mb-6 text-arena-300 opacity-80" />
            <h2 className="font-display text-5xl font-light mb-4">Lista para enviar a un potencial cliente</h2>
            <p className="text-lago-200 max-w-xl mx-auto mb-8 text-base">Probá el flujo público, entrá al panel y mostrá cómo una consulta se convierte en reserva controlada.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600">Probar reserva</Link>
              <Link href="/admin" className="btn-outline border-white/40 text-white hover:bg-white/10">Entrar al panel</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
