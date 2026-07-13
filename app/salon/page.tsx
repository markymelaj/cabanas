import type { Metadata } from 'next'
import DemoNavbar from '@/components/DemoNavbar'
import DemoFooter from '@/components/DemoFooter'
import SalonQuoteFormV2 from '@/components/SalonQuoteFormV2'
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase-server'
import { DEMO_LODGING } from '@/lib/demo-config'
import { Building2, CalendarCheck, Check, Sparkles, Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Eventos en Refugios del Salto', description: 'Cotiza celebraciones y encuentros cerca del Salto del Laja.' }

export const dynamic = 'force-dynamic'

async function getSalonConfig() {
  if (!hasSupabaseConfig()) return { settings: null, services: [] }
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [{ data: settings }, { data: services }] = await Promise.all([
      supabaseAdmin.from('salon_settings').select('*').limit(1).maybeSingle(),
      supabaseAdmin.from('salon_services').select('*').eq('activa', true).order('orden'),
    ])
    return { settings, services: services ?? [] }
  } catch {
    return { settings: null, services: [] }
  }
}

export default async function SalonPage() {
  const { settings, services } = await getSalonConfig()
  const capacity = Number(settings?.capacidad ?? 200)
  const meters = Number(settings?.metros_cuadrados ?? 290)
  return <><DemoNavbar /><main className="pt-[68px]">
    <section className="relative min-h-[590px] overflow-hidden bg-lago-950 text-white"><img src={DEMO_LODGING.salonImage} alt="Salón preparado para una celebración" className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-lago-950 via-lago-950/75 to-transparent" /><div className="relative mx-auto flex min-h-[590px] max-w-7xl items-end px-6 pb-20 sm:px-8 lg:px-12"><div className="max-w-3xl"><p className="eyebrow eyebrow-dark mb-5">Celebraciones y encuentros</p><h1 className="font-display text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Un espacio que se adapta a tu evento.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-lago-100">Cotiza fecha, cantidad de invitados, jornada y servicios. El equipo revisará el montaje antes de confirmar.</p><a href="#cotizar" className="btn-primary mt-8">Preparar cotización</a></div></div></section>
    <section className="bg-white py-10"><div className="mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12"><Feature icon={Building2} title={`${meters} m²`} text="Espacio principal" /><Feature icon={Users} title={`${capacity} personas`} text="Capacidad máxima" /><Feature icon={CalendarCheck} title="Fecha revisada" text="Confirmación manual" /><Feature icon={Sparkles} title="Servicios flexibles" text="Según cada celebración" /></div></section>
    <section className="bg-arena-50 py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12"><div><p className="eyebrow mb-4">Antes de cotizar</p><h2 className="section-title">Cuéntanos la idea, no solo el número.</h2><p className="mt-6 text-volcan-700">El estimado permite ordenar la primera conversación. La propuesta final considera fecha, montaje, horarios, alimentación y necesidades técnicas.</p><ul className="mt-7 space-y-3 text-sm text-volcan-700">{['Matrimonios, aniversarios y cumpleaños','Jornadas de empresa y reuniones','Media jornada o jornada completa','Servicios adicionales configurables'].map((item) => <li key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-lago-100 text-lago-700"><Check size={14} /></span>{item}</li>)}</ul></div><div id="cotizar" className="scroll-mt-24"><SalonQuoteFormV2 settings={settings} services={services} /></div></div></section>
  </main><DemoFooter /></>
}

function Feature({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) { return <div className="rounded-2xl border border-arena-200 bg-arena-50 p-5"><Icon size={20} className="text-arena-600" /><p className="mt-4 font-display text-2xl text-lago-950">{title}</p><p className="mt-1 text-sm text-volcan-600">{text}</p></div> }
