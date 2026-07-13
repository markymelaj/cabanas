import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DEMO_CONFIG, SALES_PLANS } from '@/lib/demo-config'
import { ArrowRight, CalendarCheck, Check, CircleDollarSign, Clock3, CreditCard, LayoutDashboard, MessageCircle, MonitorSmartphone, PartyPopper, ShieldCheck, Smartphone, Users } from 'lucide-react'

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
  ['La solicitud queda registrada', 'El negocio recibe información completa en el panel y por WhatsApp.'],
  ['El equipo confirma y cobra', 'Cambia el estado, registra el anticipo y controla el saldo hasta el check-out.'],
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-lago-950 pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
          <img src={DEMO_CONFIG.heroImage} alt="Bosque y agua del sur de Chile" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(199,180,158,0.18),transparent_35%),linear-gradient(to_bottom,rgba(20,30,25,0.35),#141e19)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
            <div>
              <p className="eyebrow eyebrow-dark mb-6">Reservas sin comisión · Implementación personalizada</p>
              <h1 className="max-w-3xl font-display text-5xl leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">Menos mensajes sueltos. Más reservas bajo control.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-lago-100">Un sistema simple para alojamientos que venden por WhatsApp: disponibilidad, consultas completas, pagos, saldos y operación diaria desde cualquier dispositivo.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/cabanas" className="btn-primary">Probar experiencia huésped <ArrowRight size={16} /></Link>
                <Link href="/admin" className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10">Entrar al panel demo</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-lago-300">
                <span className="flex items-center gap-2"><Check size={15} /> Sin comisión</span>
                <span className="flex items-center gap-2"><Check size={15} /> Adaptado a tu negocio</span>
                <span className="flex items-center gap-2"><Check size={15} /> Capacitación incluida</span>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="border-b border-arena-200/70 bg-white py-8">
          <div className="mx-auto grid max-w-7xl gap-5 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
            <Value icon={Clock3} title="Respuesta más rápida" text="Toda la información llega desde el primer contacto." />
            <Value icon={CircleDollarSign} title="Sin comisión" text="El canal y los datos siguen siendo del alojamiento." />
            <Value icon={MonitorSmartphone} title="Funciona en cualquier equipo" text="Celular, tablet o computador, sin instalar programas." />
            <Value icon={LayoutDashboard} title="Una sola operación" text="Reservas, pagos, eventos y seguimiento conectados." />
          </div>
        </section>

        <section id="como-funciona" className="bg-arena-50 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
            <div>
              <p className="eyebrow mb-4">Cómo funciona</p>
              <h2 className="section-title">Del mensaje inicial al check-out.</h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-volcan-700">La automatización ordena la información; tu equipo conserva el control de la relación y decide qué confirmar.</p>
              <Link href="/cabanas" className="btn-primary mt-8">Recorrer la demo <ArrowRight size={16} /></Link>
            </div>
            <div className="grid gap-3">
              {steps.map(([title, text], index) => (
                <article key={title} className="surface-card flex gap-5 p-6 sm:p-7">
                  <span className="font-display text-4xl text-arena-500">0{index + 1}</span>
                  <div><h3 className="font-display text-2xl text-lago-950">{title}</h3><p className="mt-2 text-sm leading-relaxed text-volcan-600">{text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow justify-center mb-4">Demo completa</p>
              <h2 className="section-title">Mira ambos lados del sistema.</h2>
              <p className="mt-5 text-volcan-700">La experiencia del huésped está separada de la presentación comercial para que puedas evaluar cómo se sentiría en un alojamiento real.</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <DemoCard image={DEMO_CONFIG.cabanaImage} label="Experiencia huésped" title="Buscar, cotizar y solicitar" text="Catálogo, fechas, huéspedes, cálculo y WhatsApp con la información completa." href="/cabanas" button="Probar reservas" />
              <DemoCard label="Experiencia propietario" title="Operar el negocio desde el panel" text="Pendientes, llegadas, salidas, saldos, notas, disponibilidad y acciones rápidas." href="/admin" button="Abrir panel" admin />
            </div>
          </div>
        </section>

        <section id="funciones" className="bg-lago-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl"><p className="eyebrow eyebrow-dark mb-4">Operación real</p><h2 className="section-title !text-white">Lo necesario para vender y administrar sin parches.</h2></div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => <article key={title} className="bg-lago-950 p-6 sm:p-7"><Icon size={22} className="text-arena-300" /><h3 className="mt-5 font-display text-2xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-lago-300">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section id="modulos" className="bg-arena-50 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
            <div className="overflow-hidden rounded-3xl"><img src={DEMO_CONFIG.salonImage} alt="Salón preparado para un evento" className="aspect-[4/3] h-full w-full object-cover" /></div>
            <div><p className="eyebrow mb-4">Módulo opcional</p><h2 className="section-title">Cabañas y eventos en la misma operación.</h2><p className="mt-6 text-base leading-relaxed text-volcan-700">Para complejos que también arriendan salón, restaurante o espacios para celebraciones. Recibe cotizaciones con fecha, invitados, servicios y valor estimado.</p><Link href="/salon" className="btn-outline mt-8"><PartyPopper size={17} /> Ver cotizador de eventos</Link></div>
          </div>
        </section>

        <section id="planes" className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl"><p className="eyebrow mb-4">Implementación</p><h2 className="section-title">Una base sólida, adaptada a cada alojamiento.</h2><p className="mt-5 text-volcan-700">Los valores son referenciales y se afinan según unidades, reglas, carga inicial e integraciones.</p></div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {SALES_PLANS.map((plan, index) => <article key={plan.name} className={`rounded-2xl border p-7 ${index === 1 ? 'border-lago-700 bg-lago-950 text-white shadow-2xl' : 'border-arena-200 bg-arena-50'}`}><span className={`text-xs font-bold uppercase tracking-[0.16em] ${index === 1 ? 'text-arena-300' : 'text-arena-600'}`}>{plan.badge}</span><h3 className="mt-5 font-display text-3xl">{plan.name}</h3><p className={`mt-2 text-xl font-semibold ${index === 1 ? 'text-white' : 'text-lago-900'}`}>{plan.price}</p><p className={`mt-5 text-sm leading-relaxed ${index === 1 ? 'text-lago-200' : 'text-volcan-600'}`}>{plan.detail}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-arena-600 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-6 sm:px-8 lg:flex-row lg:items-center lg:px-12">
            <div><p className="font-display text-4xl tracking-tight">Ordena las reservas antes de sumar más ventas.</p><p className="mt-2 text-arena-100">Demo funcional, adaptación visual, carga inicial y capacitación.</p></div>
            <a href={`https://wa.me/${DEMO_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hola, quiero revisar Alto Cauce Reservas para mi alojamiento.')}`} className="btn-outline border-white/30 bg-white text-arena-700 hover:bg-arena-50">Hablar por WhatsApp <ArrowRight size={16} /></a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function DashboardPreview() {
  return <div className="relative mx-auto w-full max-w-xl"><div className="absolute -inset-8 rounded-full bg-arena-400/10 blur-3xl" /><div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/95 p-3 text-lago-950 shadow-2xl"><div className="flex items-center gap-2 border-b border-arena-100 px-3 py-3"><span className="h-2.5 w-2.5 rounded-full bg-arena-500" /><span className="h-2.5 w-2.5 rounded-full bg-arena-300" /><span className="h-2.5 w-2.5 rounded-full bg-lago-400" /><span className="ml-3 text-xs font-semibold text-volcan-500">Panel operativo</span></div><div className="grid gap-3 p-3 sm:grid-cols-3"><PreviewMetric label="Pendientes" value="4" /><PreviewMetric label="Llegan hoy" value="2" /><PreviewMetric label="Saldo" value="$285.000" /></div><div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-arena-100"><div className="flex items-center justify-between bg-arena-50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-wide text-volcan-500">Próximas estadías</span><CalendarCheck size={16} className="text-lago-600" /></div>{[['Carolina Muñoz','Cabaña Bosque · 14–17 jul'],['Matías Rojas','Cabaña Familiar · 18–20 jul'],['Paula Soto','Cabaña Bosque · 21–24 jul']].map(([name, detail],i)=><div key={name} className="flex items-center justify-between border-t border-arena-100 px-4 py-3"><div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-volcan-500">{detail}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${i===0?'bg-amber-100 text-amber-800':'bg-green-100 text-green-800'}`}>{i===0?'PENDIENTE':'CONFIRMADA'}</span></div>)}</div></div></div>
}

function PreviewMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-arena-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-volcan-500">{label}</p><p className="mt-2 font-display text-2xl">{value}</p></div> }
function Value({ icon: Icon, title, text }: { icon: typeof Clock3; title: string; text: string }) { return <div className="flex gap-3"><Icon size={20} className="mt-1 shrink-0 text-arena-600" /><div><p className="font-semibold text-lago-950">{title}</p><p className="mt-1 text-sm leading-relaxed text-volcan-600">{text}</p></div></div> }
function DemoCard({ image, label, title, text, href, button, admin = false }: { image?: string; label: string; title: string; text: string; href: string; button: string; admin?: boolean }) { return <article className={`overflow-hidden rounded-3xl border ${admin ? 'border-lago-800 bg-lago-950 text-white' : 'border-arena-200 bg-arena-50'}`}>{image ? <img src={image} alt="Cabaña de demostración" className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(199,180,158,.24),transparent_30%),linear-gradient(135deg,#22322b,#141e19)]"><LayoutDashboard size={76} className="text-arena-300" /></div>}<div className="p-7"><p className={`text-xs font-bold uppercase tracking-[0.18em] ${admin ? 'text-arena-300' : 'text-arena-600'}`}>{label}</p><h3 className="mt-3 font-display text-3xl">{title}</h3><p className={`mt-3 text-sm leading-relaxed ${admin ? 'text-lago-200' : 'text-volcan-600'}`}>{text}</p><Link href={href} className={`mt-6 ${admin ? 'btn-primary' : 'btn-outline'}`}>{button} <ArrowRight size={16} /></Link></div></article> }
