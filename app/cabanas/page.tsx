import type { Metadata } from 'next'
import { getSupabaseAdmin, hasSupabaseConfig, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import DemoNavbar from '@/components/DemoNavbar'
import DemoFooter from '@/components/DemoFooter'
import CabanaBookingExperience from '@/components/CabanaBookingExperience'
import { DEMO_LODGING } from '@/lib/demo-config'
import { CalendarCheck, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'Refugios del Salto — Cabañas cerca del Salto del Laja', description: 'Revisa cabañas, fechas y valores para una estadía cerca del Salto del Laja.' }

export const dynamic = 'force-dynamic'

async function getCabanas(): Promise<Cabana[]> {
  if (!hasSupabaseConfig()) return DEFAULT_CABANAS
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from('cabanas').select('*').eq('activa', true).order('orden')
    if (error) { logSupabaseError('cabanas.list', error); return DEFAULT_CABANAS }
    const rows = (data as Cabana[]) ?? []
    return rows.length > 0 ? rows : DEFAULT_CABANAS
  } catch {
    return DEFAULT_CABANAS
  }
}

export default async function CabanasPage() {
  const cabanas = await getCabanas()
  return <><DemoNavbar /><main className="pt-[68px]">
    <section className="relative min-h-[620px] overflow-hidden bg-lago-950 text-white sm:min-h-[680px]">
      <img src={DEMO_LODGING.heroImage} alt="Cabaña rodeada de bosque" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-r from-lago-950 via-lago-950/80 to-lago-950/20" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-6 pb-20 sm:min-h-[680px] sm:px-8 sm:pb-24 lg:px-12">
        <div className="max-w-3xl"><p className="eyebrow eyebrow-dark mb-5">{DEMO_LODGING.location}</p><h1 className="font-display text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Descansa cerca del agua, sin apurar el viaje.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-lago-100">{DEMO_LODGING.tagline}. Revisa unidades, disponibilidad y valor antes de enviar tu solicitud.</p><a href="#reservas" className="btn-primary mt-8">Ver cabañas y fechas</a></div>
      </div>
    </section>
    <section className="border-b border-arena-200 bg-white py-8"><div className="mx-auto grid max-w-7xl gap-5 px-6 sm:px-8 md:grid-cols-3 lg:px-12"><Trust icon={CalendarCheck} title="Fechas visibles" text="Consulta disponibilidad antes de escribir." /><Trust icon={MessageCircle} title="Confirmación personal" text="La reserva se termina de coordinar por WhatsApp." /><Trust icon={ShieldCheck} title="Total transparente" text="Noches, limpieza y extras se muestran antes de enviar." /></div></section>
    <section id="reservas" className="bg-arena-50 py-20 sm:py-28"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12"><div className="mb-14 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="eyebrow mb-4">Tu estadía</p><h2 className="section-title">Elige el espacio que calza contigo.</h2></div><p className="flex items-center gap-2 text-sm text-volcan-600"><MapPin size={16} className="text-arena-600" /> A minutos del Salto del Laja</p></div><CabanaBookingExperience cabanas={cabanas} /></div></section>
  </main><DemoFooter /></>
}

function Trust({ icon: Icon, title, text }: { icon: typeof CalendarCheck; title: string; text: string }) { return <div className="flex gap-3"><Icon size={20} className="mt-1 shrink-0 text-arena-600" /><div><p className="font-semibold text-lago-950">{title}</p><p className="mt-1 text-sm text-volcan-600">{text}</p></div></div> }
