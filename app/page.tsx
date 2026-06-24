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
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  PartyPopper,
  ShieldCheck,
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
  { icon: MessageCircle, title: 'Consultas completas', text: 'Cada solicitud llega con fechas, cantidad de huéspedes, datos de contacto y monto estimado.' },
  { icon: CalendarCheck, title: 'Disponibilidad clara', text: 'El equipo puede revisar reservas, fechas ocupadas, solicitudes pendientes y bloqueos desde el mismo panel.' },
  { icon: CreditCard, title: 'Pagos ordenados', text: 'Anticipos, saldos, comprobantes y estados de pago quedan asociados a cada reserva.' },
  { icon: LayoutDashboard, title: 'Control diario', text: 'Próximas llegadas, reservas pendientes y acciones importantes quedan visibles para operar mejor.' },
]

const STEPS = [
  { title: 'Solicitud del huésped', text: 'La persona elige cabaña, fechas y número de huéspedes. El sistema calcula noches, limpieza y total estimado.' },
  { title: 'Registro automático', text: 'La consulta queda guardada con datos de contacto, fechas, monto, estado y origen de la solicitud.' },
  { title: 'Confirmación y seguimiento', text: 'Desde el panel se contacta al huésped, se confirma la reserva, se registra el anticipo y se controla el saldo.' },
]

const ADMIN_BENEFITS = [
  'Crear reservas manuales cuando alguien llama, escribe o llega directo.',
  'Buscar por nombre, teléfono, fecha, cabaña, estado o código de reserva.',
  'Cambiar estados: pendiente, confirmada, check-in, check-out, cancelada o no-show.',
  'Ver pagos, saldos, notas internas y próximas llegadas sin revisar conversaciones sueltas.',
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
                Reservas para cabañas y alojamientos
              </p>
              <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-none mb-6">
                Ordena reservas, pagos<br /><em className="text-arena-300">y disponibilidad en un solo lugar</em>
              </h1>
              <p className="text-lago-100 text-lg font-body font-light max-w-2xl mb-10 leading-relaxed">
                Sistema web para cabañas, lodge y complejos turísticos. El huésped consulta con datos completos y el negocio administra reservas, estados, pagos y seguimiento desde un panel privado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-white">Consultar disponibilidad</Link>
                <Link href="/admin" className="btn-outline border-white/40 text-white hover:bg-white/10">Ver panel de administración</Link>
                <Link href="#modulos" className="btn-outline border-arena-300/60 text-arena-100 hover:bg-arena-500/15">Módulo eventos</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-b border-arena-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['Sin comisión por reserva', 'El negocio conserva el control de sus consultas y ventas.'],
                ['WhatsApp ordenado', 'Menos preguntas repetidas y más información desde el primer contacto.'],
                ['Panel móvil', 'La operación puede revisarse desde celular, tablet o computador.'],
                ['Eventos opcional', 'El cotizador de salón se agrega solo cuando el negocio lo necesita.'],
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
                <p className="text-arena-600 font-display italic text-lg mb-3">Cómo funciona</p>
                <h2 className="section-title mb-5">Del primer contacto a la reserva confirmada</h2>
                <p className="text-volcan-600 leading-relaxed mb-7">
                  El sistema reduce el desorden habitual de las consultas por mensaje: reúne datos, calcula valores, guarda la solicitud y permite hacer seguimiento hasta confirmar la estadía.
                </p>
                <Link href="/cabanas" className="btn-primary">Ver disponibilidad <ArrowRight size={16} /></Link>
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
              <p className="text-arena-600 font-display italic text-lg mb-3">Reservas online</p>
              <h2 className="section-title mb-4">Cabañas con información clara antes de consultar</h2>
              <p className="text-volcan-600 leading-relaxed">Cada unidad puede mostrar fotos, capacidad, precio por noche, limpieza, condiciones y total estimado para que la consulta llegue más completa.</p>
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
                      <span className="rounded-lg bg-arena-50 px-3 py-2 flex items-center gap-1"><TreePine size={13} /> Estancia</span>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-arena-100 gap-4">
                      <div><span className="text-2xl font-display font-medium text-lago-900">${cab.precio_noche.toLocaleString('es-CL')}</span><span className="text-volcan-500 text-sm ml-1">/ noche</span></div>
                      <Link href="/cabanas" className="btn-primary text-sm whitespace-nowrap">Consultar</Link>
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
                <p className="text-lago-300 font-display italic text-lg mb-3">Administración</p>
                <h2 className="font-display text-5xl text-white font-light mb-5">Un panel para operar el día a día</h2>
                <p className="text-lago-200 leading-relaxed mb-8">El equipo puede revisar solicitudes, confirmar reservas, controlar pagos, registrar notas y ver próximas llegadas sin depender de memoria ni conversaciones dispersas.</p>
                <Link href="/admin" className="btn-primary bg-arena-500 hover:bg-arena-600">Abrir panel</Link>
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
                    <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Panel administrativo</p>
                    <h3 className="font-display text-3xl text-lago-900">Control de reservas</h3>
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
                <p className="text-arena-600 font-display italic text-lg mb-3">Operación más simple</p>
                <h2 className="section-title mb-5">Menos mensajes perdidos, más reservas controladas</h2>
                <p className="text-volcan-600 leading-relaxed mb-6">El sistema deja trazabilidad de cada consulta: quién escribió, por qué fechas, qué cabaña pidió, cuánto debe pagar y en qué estado está la reserva.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/cabanas" className="btn-primary">Consultar una cabaña</Link>
                  <Link href="/admin" className="btn-outline">Ver administración</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-arena-50" id="modulos">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-arena-600 font-display italic text-lg mb-3">Implementación</p>
              <h2 className="section-title mb-4">Base para cabañas, con eventos como adicional</h2>
              <p className="text-volcan-600 leading-relaxed">La instalación principal cubre reservas de alojamiento. Si el negocio también arrienda salón o recibe eventos, se puede sumar un cotizador específico y seguimiento comercial.</p>
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
                <p className="font-display text-3xl font-light mb-2">Módulo para salón de eventos</p>
                <p className="text-lago-200 text-sm leading-relaxed">Permite recibir consultas de eventos con fecha, tipo de celebración, cantidad de invitados, jornada, servicios adicionales y valor estimado.</p>
              </div>
              <Link href="/salon" className="btn-primary bg-arena-500 hover:bg-arena-600"><PartyPopper size={16} /> Ver módulo eventos</Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-lago-800 text-white text-center">
          <div className="container mx-auto px-6">
            <ShieldCheck size={40} className="mx-auto mb-6 text-arena-300 opacity-80" />
            <h2 className="font-display text-5xl font-light mb-4">Sistema listo para revisar en funcionamiento</h2>
            <p className="text-lago-200 max-w-xl mx-auto mb-8 text-base">Recorre la experiencia de reserva y luego abre el panel para ver cómo se administra la operación del alojamiento.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600">Ver reservas</Link>
              <Link href="/admin" className="btn-outline border-white/40 text-white hover:bg-white/10">Abrir panel</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
