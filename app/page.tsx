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
  Check,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  MonitorSmartphone,
  TreePine,
  Users,
  UtensilsCrossed,
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

/* Firma visual: la línea de la cascada. Un trazo que corre y cae,
   como el salto. Se usa bajo el titular y como divisor de secciones. */
function CascadaLine({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 44"
      className={className}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 6 H118 C140 6 138 38 160 38 H320"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

const PRODUCT_POINTS = [
  { icon: MessageCircle, title: 'Consultas completas', text: 'Cada solicitud llega con fechas, cantidad de huéspedes, datos de contacto y monto estimado.' },
  { icon: CalendarCheck, title: 'Disponibilidad clara', text: 'Reservas, fechas ocupadas, solicitudes pendientes y bloqueos se revisan desde el mismo panel.' },
  { icon: CreditCard, title: 'Pagos ordenados', text: 'Anticipos, saldos, comprobantes y estados de pago quedan asociados a cada reserva.' },
  { icon: LayoutDashboard, title: 'Control diario', text: 'Próximas llegadas, reservas pendientes y acciones importantes quedan a la vista para operar mejor.' },
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

const BASE_INCLUDES = [
  'Sitio de presentación con tus cabañas, fotos y precios',
  'Consulta de disponibilidad por fechas con total estimado',
  'Registro automático de cada solicitud en el panel',
  'Estados de reserva, pagos, anticipos y saldos',
  'WhatsApp ordenado y notificaciones por correo',
]

const SALON_ADDS = [
  'Cotizador de eventos: fecha, tipo de celebración e invitados',
  'Servicios adicionales configurables (banquetería, jornada, extras)',
  'Valor estimado automático para cada cotización',
  'Seguimiento comercial de eventos en el mismo panel',
  'Control de fechas del salón junto al calendario de cabañas',
]

export default async function HomePage() {
  const cabanas = await getCabanas()

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex items-end pb-24 pt-32 overflow-hidden bg-lago-950">
          <img
            src={DEMO_CONFIG.heroImage}
            alt="Cauce y bosque del sur de Chile"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-950 via-lago-950/70 to-lago-950/25" />
          <div className="relative container mx-auto px-6 md:px-12">
            <div className="max-w-4xl animate-fade-up">
              <p className="eyebrow eyebrow-dark mb-6">
                Sistema de reservas · {DEMO_CONFIG.locationShort}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-[4.25rem] text-arena-50 leading-[1.06] mb-5 text-balance">
                Cada consulta llega completa.
                <br />
                Cada fecha, bajo control.
              </h1>
              <CascadaLine className="w-56 h-8 text-arena-300 mb-7" />
              <p className="text-lago-100 text-lg max-w-2xl mb-10 leading-relaxed">
                Sistema web para cabañas, lodge y complejos turísticos. El huésped consulta
                con datos completos y el negocio administra reservas, estados, pagos y
                seguimiento desde un panel privado. Sin comisión por reserva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cabanas" className="btn-primary">
                  Probar la demo como huésped <ArrowRight size={16} />
                </Link>
                <Link href="/admin" className="btn-outline border-arena-50/50 text-arena-50 hover:bg-white/10">
                  Entrar al panel de administración
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Franja de valor ─────────────────────────────────── */}
        <section className="py-12 bg-white border-b border-arena-200/60">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-4">
              {[
                ['Sin comisión por reserva', 'El negocio conserva el control de sus consultas y ventas.'],
                ['WhatsApp ordenado', 'Menos preguntas repetidas y más información desde el primer contacto.'],
                ['Panel móvil', 'La operación se revisa desde celular, tablet o computador.'],
                ['Salón como opcional', 'El cotizador de eventos se agrega solo si el negocio lo necesita.'],
              ].map(([title, text]) => (
                <div key={title} className="border-l border-arena-300/70 pl-4">
                  <p className="font-display text-lg text-lago-900">{title}</p>
                  <p className="text-sm text-volcan-600 mt-1 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ───────────────────────────────────── */}
        <section className="py-24 bg-arena-50" id="como-funciona">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-start">
              <div>
                <p className="eyebrow mb-4">Cómo funciona</p>
                <h2 className="section-title mb-5">Del primer contacto a la reserva confirmada</h2>
                <p className="text-volcan-700 leading-relaxed mb-8">
                  El sistema reduce el desorden habitual de las consultas por mensaje:
                  reúne datos, calcula valores, guarda la solicitud y permite hacer
                  seguimiento hasta confirmar la estadía.
                </p>
                <Link href="/cabanas" className="btn-primary">Ver disponibilidad <ArrowRight size={16} /></Link>
              </div>
              <ol className="grid gap-px bg-arena-200/70 border border-arena-200/70 rounded-lg overflow-hidden">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="bg-white p-7 flex gap-6">
                    <span className="font-display text-4xl text-arena-500 leading-none select-none" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-lago-900">{step.title}</h3>
                      <p className="text-sm text-volcan-700 leading-relaxed mt-1.5">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Cabañas ─────────────────────────────────────────── */}
        <section className="py-24 bg-white" id="cabanas">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-12">
              <p className="eyebrow mb-4">Reservas online</p>
              <h2 className="section-title mb-4">Cabañas con información clara antes de consultar</h2>
              <p className="text-volcan-700 leading-relaxed">
                Cada unidad muestra fotos, capacidad, precio por noche, limpieza,
                condiciones y total estimado para que la consulta llegue completa.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {cabanas.slice(0, 2).map((cab) => (
                <div key={cab.id} className="bg-white rounded-lg overflow-hidden card-shadow group border border-arena-200/70">
                  <div className="relative h-64 overflow-hidden bg-lago-100">
                    {cab.fotos?.[0] ? (
                      <img src={cab.fotos[0]} alt={cab.nombre} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lago-300"><TreePine size={48} /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-lago-950/85 text-arena-50 rounded px-3 py-1 text-xs font-medium">
                      Hasta {cab.capacidad} personas
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl text-lago-900 mb-2">{cab.nombre}</h3>
                    <p className="text-volcan-700 text-sm leading-relaxed mb-5">{cab.descripcion_corta}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-xs text-volcan-700">
                      <span className="flex items-center gap-1.5"><Users size={13} /> {cab.capacidad} huéspedes</span>
                      <span className="flex items-center gap-1.5"><BedDouble size={13} /> {cab.dormitorios ?? 1} dormitorio{(cab.dormitorios ?? 1) > 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1.5"><TreePine size={13} /> Entorno natural</span>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-arena-200/70 gap-4">
                      <div>
                        <span className="text-2xl font-display text-lago-900">${cab.precio_noche.toLocaleString('es-CL')}</span>
                        <span className="text-volcan-500 text-sm ml-1">/ noche</span>
                      </div>
                      <Link href="/cabanas" className="btn-primary text-sm whitespace-nowrap">Consultar</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Panel ───────────────────────────────────────────── */}
        <section className="py-24 bg-lago-950 text-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
              <div>
                <p className="eyebrow eyebrow-dark mb-4">Administración</p>
                <h2 className="font-display text-4xl md:text-5xl text-arena-50 leading-[1.08] mb-5">
                  Un panel para operar el día a día
                </h2>
                <p className="text-lago-200 leading-relaxed mb-8">
                  El equipo revisa solicitudes, confirma reservas, controla pagos,
                  registra notas y ve las próximas llegadas sin depender de la memoria
                  ni de conversaciones dispersas.
                </p>
                <ul className="space-y-2.5 mb-9">
                  {ADMIN_BENEFITS.map((benefit) => (
                    <li key={benefit} className="text-sm text-lago-100 flex gap-2.5 leading-relaxed">
                      <CheckCircle2 size={16} className="text-arena-300 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link href="/admin" className="btn-primary">Abrir panel de administración</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden">
                {PRODUCT_POINTS.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="bg-lago-900 p-7">
                    <Icon className="text-arena-300 mb-4" size={22} />
                    <h3 className="font-display text-xl text-arena-50 mb-2">{title}</h3>
                    <p className="text-sm text-lago-200 leading-relaxed">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Recorrido de la demo ────────────────────────────── */}
        <section className="py-24 bg-white" id="demo">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-12">
              <p className="eyebrow mb-4">Prueba la demo</p>
              <h2 className="section-title mb-4">Recorre el sistema en funcionamiento</h2>
              <p className="text-volcan-700 leading-relaxed">
                La demo está abierta: primero recorre la experiencia del huésped y
                después entra al panel para ver cómo queda registrada tu propia consulta.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Link
                href="/cabanas"
                className="group rounded-lg border border-arena-200/70 bg-arena-50 p-8 hover:border-lago-400 transition-colors"
              >
                <MonitorSmartphone size={26} className="text-lago-700 mb-5" />
                <p className="eyebrow mb-3">Paso 1 · Como huésped</p>
                <h3 className="font-display text-2xl text-lago-900 mb-2">Haz una consulta de reserva</h3>
                <p className="text-sm text-volcan-700 leading-relaxed mb-6">
                  Elige una cabaña, marca fechas y envía la solicitud. Verás el cálculo
                  de noches, limpieza, total estimado y anticipo sugerido.
                </p>
                <span className="text-sm font-medium text-arena-600 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Ir a reservas <ArrowRight size={15} />
                </span>
              </Link>
              <Link
                href="/admin"
                className="group rounded-lg border border-arena-200/70 bg-arena-50 p-8 hover:border-lago-400 transition-colors"
              >
                <LayoutDashboard size={26} className="text-lago-700 mb-5" />
                <p className="eyebrow mb-3">Paso 2 · Como administrador</p>
                <h3 className="font-display text-2xl text-lago-900 mb-2">Entra al panel de prueba</h3>
                <p className="text-sm text-volcan-700 leading-relaxed mb-6">
                  Acceso en un clic, sin registro. Encontrarás tu consulta guardada y
                  podrás cambiar estados, registrar pagos y contactar por WhatsApp.
                </p>
                <span className="text-sm font-medium text-arena-600 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Entrar a la demo del panel <ArrowRight size={15} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Módulo opcional: salón / restaurante ────────────── */}
        <section className="py-24 bg-arena-50" id="modulos">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mb-4">
              <p className="eyebrow mb-4">Módulo opcional</p>
              <h2 className="section-title mb-5">Salón de eventos o restaurante: se agrega solo si lo necesitas</h2>
              <p className="text-volcan-700 leading-relaxed">
                El sistema base cubre las reservas de alojamiento y <strong className="text-lago-900">no incluye</strong> el
                módulo de salón o restaurante. Si tu negocio también arrienda un salón,
                recibe matrimonios o tiene restaurante con eventos, el módulo se contrata
                como adicional y se integra al mismo panel.
              </p>
            </div>
            <CascadaLine className="w-40 h-7 text-arena-400 mb-12" />
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="rounded-lg bg-white border border-arena-200/70 p-8 card-shadow">
                <p className="eyebrow mb-4">Sistema base · Incluido</p>
                <h3 className="font-display text-2xl text-lago-900 mb-5">Reservas de cabañas</h3>
                <ul className="space-y-3">
                  {BASE_INCLUDES.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-volcan-800 leading-relaxed">
                      <Check size={16} className="text-lago-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-lago-950 text-white p-8 relative overflow-hidden">
                <p className="eyebrow eyebrow-dark mb-4">Módulo opcional · Adicional</p>
                <h3 className="font-display text-2xl text-arena-50 mb-5 flex items-center gap-3">
                  <UtensilsCrossed size={22} className="text-arena-300" />
                  Salón de eventos / restaurante
                </h3>
                <ul className="space-y-3 mb-7">
                  {SALON_ADDS.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-lago-100 leading-relaxed">
                      <Check size={16} className="text-arena-300 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/salon" className="btn-primary">Ver el módulo en la demo <ArrowRight size={15} /></Link>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SALES_PLANS.map((plan) => (
                <article key={plan.name} className="rounded-lg bg-white border border-arena-200/70 p-7 card-shadow">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-arena-600 mb-4">{plan.badge}</p>
                  <h3 className="font-display text-2xl text-lago-900">{plan.name}</h3>
                  <p className="text-3xl font-display text-lago-800 mt-3">{plan.price}</p>
                  <p className="text-sm text-volcan-700 leading-relaxed mt-4">{plan.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cierre ──────────────────────────────────────────── */}
        <section className="py-24 bg-lago-950 text-white">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <CascadaLine className="w-40 h-7 text-arena-300 mx-auto mb-8" />
            <h2 className="font-display text-4xl md:text-5xl text-arena-50 leading-[1.1] mb-5">
              El sistema está funcionando. Revísalo ahora.
            </h2>
            <p className="text-lago-200 max-w-xl mx-auto mb-9 leading-relaxed">
              Recorre la experiencia de reserva como huésped y luego abre el panel de
              prueba para ver cómo se administra la operación completa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cabanas" className="btn-primary">Probar como huésped</Link>
              <Link href="/admin" className="btn-outline border-arena-50/50 text-arena-50 hover:bg-white/10">Entrar a la demo del panel</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
