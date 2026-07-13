import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DEMO_CONFIG, SALES_PLANS } from '@/lib/demo-config'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  PartyPopper,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react'

const features = [
  { icon: CalendarCheck, title: 'Disponibilidad centralizada', text: 'Reservas confirmadas, bloqueos y próximas salidas en un solo calendario.' },
  { icon: MessageCircle, title: 'WhatsApp con contexto', text: 'La consulta llega con unidad, fechas, huéspedes, total y datos del cliente.' },
  { icon: CreditCard, title: 'Pagos y saldos', text: 'Anticipos, abonos, comprobantes y saldo pendiente asociados a cada estadía.' },
  { icon: Smartphone, title: 'Operación móvil', text: 'Panel diseñado para revisar, confirmar y cobrar desde el teléfono.' },
  { icon: Users, title: 'Ficha del huésped', text: 'Contacto, historial, notas internas y check-in en una misma vista.' },
  { icon: ShieldCheck, title: 'Sin dobles reservas', text: 'Validación de fechas en la aplicación y protección a nivel de base de datos.' },
]

const steps = [
  ['El huésped consulta', 'Elige una cabaña, marca fechas, indica huéspedes y ve el total estimado.'],
  ['La solicitud llega completa', 'El alojamiento recibe unidad, fechas, personas y contacto, sin reconstruir la conversación.'],
  ['El equipo confirma y cobra', 'Cambia el estado, registra el anticipo y controla el saldo hasta el check-out.'],
]

const planItems = [
  ['Sitio y catálogo de unidades', 'Consulta con fechas y huéspedes', 'Panel básico de reservas'],
  ['Pagos, saldos y estados', 'Clientes, notas y check-in', 'Carga inicial y capacitación'],
  ['Cotizador de celebraciones', 'Servicios, capacidad y fechas', 'Seguimiento comercial'],
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-lago-950 text-white">
          <img
            src={DEMO_CONFIG.heroImage}
            alt="Bosque y agua del sur de Chile"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,25,20,0.98)_0%,rgba(16,29,23,0.93)_42%,rgba(17,29,24,0.60)_72%,rgba(17,29,24,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(199,180,158,0.20),transparent_30%),linear-gradient(to_bottom,transparent_55%,rgba(20,30,25,0.96)_100%)]" />
          <div className="pointer-events-none absolute left-[8%] top-28 h-48 w-48 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute left-[12%] top-40 h-28 w-28 rounded-full border border-white/[0.04]" />

          <div className="relative mx-auto grid min-h-[690px] max-w-[1420px] items-center gap-12 px-6 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-12 xl:gap-20">
            <div className="max-w-[740px]">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-arena-200">
                <span className="h-px w-8 bg-arena-300/75" />
                Reservas sin comisión
                <span className="text-white/35">·</span>
                Implementación personalizada
              </div>

              <h1 className="max-w-[730px] text-balance font-display text-[48px] leading-[0.98] tracking-[-0.042em] text-white sm:text-[58px] lg:text-[58px] xl:text-[64px]">
                Menos mensajes sueltos.
                <span className="mt-1 block text-arena-100">Más reservas bajo control.</span>
              </h1>

              <p className="mt-7 max-w-[640px] text-[17px] leading-8 text-lago-100 sm:text-lg">
                Un sistema simple para alojamientos que venden por WhatsApp: disponibilidad, consultas completas, pagos, saldos y operación diaria desde cualquier dispositivo.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/cabanas" className="btn-primary min-h-12 px-6">
                  Probar experiencia huésped <ArrowRight size={16} />
                </Link>
                <Link href="/admin" className="btn-outline min-h-12 border-white/20 bg-white/[0.06] px-6 text-white hover:border-white/35 hover:bg-white/[0.11]">
                  Entrar al panel demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-lago-200">
                <span className="flex items-center gap-2"><Check size={15} className="text-arena-300" /> Sin comisión</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-arena-300" /> Adaptado a tu negocio</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-arena-300" /> Capacitación incluida</span>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </section>

        <section className="relative z-20 -mt-10 px-5 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-2xl border border-arena-200/80 bg-white shadow-[0_22px_60px_rgba(20,30,25,0.13)] sm:grid-cols-2 lg:grid-cols-4">
            <Value icon={Clock3} title="Respuesta más rápida" text="La información llega completa desde el primer contacto." />
            <Value icon={CircleDollarSign} title="Sin comisión" text="El canal y los datos siguen siendo del alojamiento." />
            <Value icon={MonitorSmartphone} title="Desde cualquier equipo" text="Celular, tablet o computador, sin instalar programas." />
            <Value icon={LayoutDashboard} title="Una sola operación" text="Reservas, pagos y seguimiento en el mismo lugar." />
          </div>
        </section>

        <section id="como-funciona" className="bg-arena-50 pb-20 pt-24 sm:pb-24 sm:pt-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:px-12">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow mb-4">Cómo funciona</p>
              <h2 className="section-title max-w-xl">Del primer mensaje al check-out, sin perder el control.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-volcan-700">
                La automatización ordena la información. Tu equipo conserva la relación con el huésped y decide qué confirmar.
              </p>
              <Link href="/cabanas" className="btn-primary mt-8">Recorrer la demo <ArrowRight size={16} /></Link>
            </div>

            <div className="grid gap-4">
              {steps.map(([title, text], index) => (
                <article key={title} className="group grid gap-5 rounded-2xl border border-arena-200/80 bg-white p-6 shadow-[0_14px_38px_rgba(20,30,25,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(20,30,25,0.09)] sm:grid-cols-[72px_1fr] sm:p-7">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lago-950 font-display text-2xl text-arena-200 transition group-hover:bg-arena-600 group-hover:text-white">0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl text-lago-950 sm:text-[28px]">{title}</h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-7 text-volcan-600">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.65fr]">
              <div>
                <p className="eyebrow mb-4">Demo funcional</p>
                <h2 className="section-title max-w-3xl">Dos experiencias separadas, una sola operación.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-volcan-700 lg:justify-self-end">
                Recorre el sitio como huésped y después entra al panel para ver cómo se administra la misma solicitud.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
              <DemoCard
                image={DEMO_CONFIG.cabanaImage}
                label="Experiencia huésped"
                title="Buscar, cotizar y solicitar"
                text="Catálogo, fechas, huéspedes, cálculo y WhatsApp con la información completa."
                href="/cabanas"
                button="Probar reservas"
              />
              <DemoCard
                label="Experiencia propietario"
                title="Operar desde el panel"
                text="Pendientes, llegadas, salidas, saldos, notas, disponibilidad y acciones rápidas."
                href="/admin"
                button="Abrir panel"
                admin
              />
            </div>
          </div>
        </section>

        <section id="funciones" className="relative overflow-hidden bg-lago-950 py-20 text-white sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(199,180,158,0.10),transparent_28%),radial-gradient(circle_at_92%_90%,rgba(148,68,60,0.10),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.62fr] lg:items-end">
              <div>
                <p className="eyebrow eyebrow-dark mb-4">Operación real</p>
                <h2 className="section-title max-w-4xl !text-white">Lo necesario para vender y administrar sin parches.</h2>
              </div>
              <p className="max-w-lg text-base leading-7 text-lago-200 lg:justify-self-end">
                Cabañas primero. El módulo de eventos se suma cuando el negocio realmente lo necesita.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-arena-300/30 hover:bg-white/[0.065] sm:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-arena-300/20 bg-arena-300/10">
                    <Icon size={21} className="text-arena-200" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-lago-200">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="bg-arena-50 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
            <div className="relative">
              <div className="absolute -bottom-5 -left-5 hidden h-full w-full rounded-3xl border border-arena-300/60 lg:block" />
              <div className="relative overflow-hidden rounded-3xl shadow-[0_22px_55px_rgba(20,30,25,0.14)]">
                <img src={DEMO_CONFIG.salonImage} alt="Salón preparado para un evento" className="aspect-[4/3] h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-lago-950/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">Módulo opcional</div>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Cabañas primero</p>
              <h2 className="section-title">Suma eventos solo cuando haga falta.</h2>
              <p className="mt-6 text-base leading-7 text-volcan-700">
                Para complejos que también arriendan salón, restaurante o espacios para celebraciones. Recibe cotizaciones con fecha, invitados, servicios y valor estimado sin mezclar esa operación con las estadías.
              </p>
              <Link href="/salon" className="btn-outline mt-8"><PartyPopper size={17} /> Ver cotizador de eventos</Link>
            </div>
          </div>
        </section>

        <section id="planes" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.62fr] lg:items-end">
              <div>
                <p className="eyebrow mb-4">Implementación</p>
                <h2 className="section-title max-w-3xl">Una base sólida, adaptada a cada alojamiento.</h2>
              </div>
              <p className="max-w-lg text-base leading-7 text-volcan-700 lg:justify-self-end">
                Los valores son referenciales y se afinan según unidades, reglas, carga inicial e integraciones.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {SALES_PLANS.map((plan, index) => (
                <article key={plan.name} className={`relative flex min-h-[390px] flex-col rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 ${index === 1 ? 'border-lago-800 bg-lago-950 text-white shadow-[0_24px_60px_rgba(20,30,25,0.19)]' : 'border-arena-200 bg-arena-50 shadow-[0_14px_34px_rgba(20,30,25,0.05)]'}`}>
                  {index === 1 && <span className="absolute right-5 top-5 rounded-full bg-arena-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Más completo</span>}
                  <span className={`text-xs font-bold uppercase tracking-[0.16em] ${index === 1 ? 'text-arena-300' : 'text-arena-600'}`}>{plan.badge}</span>
                  <h3 className="mt-5 font-display text-3xl">{plan.name}</h3>
                  <p className={`mt-2 text-xl font-semibold ${index === 1 ? 'text-white' : 'text-lago-900'}`}>{plan.price}</p>
                  <p className={`mt-5 text-sm leading-7 ${index === 1 ? 'text-lago-200' : 'text-volcan-600'}`}>{plan.detail}</p>
                  <div className={`my-6 h-px ${index === 1 ? 'bg-white/10' : 'bg-arena-200'}`} />
                  <ul className="grid gap-3 text-sm">
                    {planItems[index].map((item) => (
                      <li key={item} className={`flex gap-2.5 ${index === 1 ? 'text-lago-100' : 'text-lago-800'}`}>
                        <Check size={15} className={`mt-0.5 shrink-0 ${index === 1 ? 'text-arena-300' : 'text-arena-600'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href={`https://wa.me/${DEMO_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hola, quiero revisar el plan ${plan.name} de Alto Cauce Reservas.`)}`} className={`mt-auto pt-8 text-sm font-semibold ${index === 1 ? 'text-arena-200 hover:text-white' : 'text-lago-800 hover:text-arena-700'}`}>
                    Consultar este plan <ArrowRight size={15} className="ml-1 inline" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-arena-600 py-16 text-white sm:py-18">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-arena-100"><MapPin size={14} /> Sur de Chile · atención cercana</div>
              <p className="max-w-3xl font-display text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">Ordena las reservas antes de sumar más ventas.</p>
              <p className="mt-3 text-arena-100">Demo funcional, adaptación visual, carga inicial y capacitación.</p>
            </div>
            <a href={`https://wa.me/${DEMO_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola, quiero revisar Alto Cauce Reservas para mi alojamiento.')}`} className="btn-outline min-h-12 border-white/30 bg-white px-6 text-arena-700 hover:bg-arena-50">Hablar por WhatsApp <ArrowRight size={16} /></a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function DashboardPreview() {
  const stays = [
    ['Carolina Muñoz', 'Cabaña Bosque · 14–17 jul', 'PENDIENTE'],
    ['Matías Rojas', 'Cabaña Familiar · 18–20 jul', 'CONFIRMADA'],
    ['Paula Soto', 'Cabaña Bosque · 21–24 jul', 'CONFIRMADA'],
  ]

  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:justify-self-end">
      <div className="absolute -inset-8 rounded-full bg-arena-300/10 blur-3xl" />
      <div className="absolute -right-3 -top-4 hidden rounded-2xl border border-white/15 bg-lago-900/85 px-4 py-3 text-white shadow-xl backdrop-blur-md sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-arena-200">Nueva solicitud</p>
        <p className="mt-1 text-sm font-semibold">2 noches · Cabaña Bosque</p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/[0.97] p-3 text-lago-950 shadow-[0_34px_80px_rgba(5,12,9,0.38)]">
        <div className="flex items-center gap-2 border-b border-arena-100 px-3 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-arena-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-arena-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-lago-400" />
          <span className="ml-3 text-xs font-semibold text-volcan-500">Panel operativo</span>
          <span className="ml-auto rounded-full bg-lago-50 px-2.5 py-1 text-[10px] font-bold text-lago-700">HOY</span>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-3">
          <PreviewMetric label="Pendientes" value="4" />
          <PreviewMetric label="Llegan hoy" value="2" />
          <PreviewMetric label="Saldo" value="$285.000" />
        </div>

        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-arena-100 bg-white">
          <div className="flex items-center justify-between bg-arena-50 px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-volcan-500">Próximas estadías</span>
            <CalendarCheck size={16} className="text-lago-600" />
          </div>
          {stays.map(([name, detail, status]) => (
            <div key={name} className="flex items-center justify-between gap-3 border-t border-arena-100 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-volcan-500">{detail}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide ${status === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-2xl border border-arena-200 bg-white px-4 py-3 text-lago-950 shadow-xl sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-800"><CalendarCheck size={17} /></div>
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-volcan-500">Disponibilidad</p><p className="text-sm font-semibold">18–20 julio libre</p></div>
      </div>
    </div>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-arena-100 bg-arena-50/80 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-volcan-500">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  )
}

function Value({ icon: Icon, title, text }: { icon: typeof Clock3; title: string; text: string }) {
  return (
    <div className="flex gap-3 border-b border-arena-200/70 p-5 last:border-b-0 sm:min-h-[132px] sm:border-r sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-child(3)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-arena-50"><Icon size={19} className="text-arena-600" /></div>
      <div>
        <p className="font-semibold text-lago-950">{title}</p>
        <p className="mt-1.5 text-[13px] leading-6 text-volcan-600">{text}</p>
      </div>
    </div>
  )
}

function DemoCard({ image, label, title, text, href, button, admin = false }: { image?: string; label: string; title: string; text: string; href: string; button: string; admin?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-3xl border transition duration-300 hover:-translate-y-1 ${admin ? 'border-lago-800 bg-lago-950 text-white shadow-[0_20px_52px_rgba(20,30,25,0.18)]' : 'border-arena-200 bg-arena-50 shadow-[0_16px_42px_rgba(20,30,25,0.07)]'}`}>
      {image ? (
        <div className="relative overflow-hidden">
          <img src={image} alt="Cabaña de demostración" className="h-72 w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-950/45 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-lago-950/65 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">Demo de alojamiento</span>
        </div>
      ) : (
        <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(199,180,158,.22),transparent_30%),linear-gradient(135deg,#2b4036,#141e19)]">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-white/[0.06]" />
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-md"><LayoutDashboard size={72} className="text-arena-200" /></div>
        </div>
      )}
      <div className="p-7 sm:p-8">
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${admin ? 'text-arena-300' : 'text-arena-600'}`}>{label}</p>
        <h3 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h3>
        <p className={`mt-4 max-w-xl text-sm leading-7 ${admin ? 'text-lago-200' : 'text-volcan-600'}`}>{text}</p>
        <Link href={href} className={`mt-7 ${admin ? 'btn-primary' : 'btn-outline'}`}>{button} <ArrowRight size={16} /></Link>
      </div>
    </article>
  )
}
