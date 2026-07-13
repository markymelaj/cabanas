import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function Footer() {
  return (
    <footer className="bg-lago-950 py-14 text-lago-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="font-display text-2xl text-white">Alto Cauce <span className="text-arena-300">Reservas</span></p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed">Sistema sin comisión por reserva para alojamientos que necesitan ordenar disponibilidad, pagos y seguimiento sin perder la cercanía de WhatsApp.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-lago-500">Producto</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/cabanas" className="hover:text-white">Demo de huésped</Link>
              <Link href="/admin" className="hover:text-white">Panel administrativo</Link>
              <Link href="/salon" className="hover:text-white">Módulo de eventos</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-lago-500">Contacto</p>
            <div className="flex flex-col gap-3 text-sm">
              <span className="flex items-start gap-2"><MapPin size={15} className="mt-1 shrink-0" />{DEMO_CONFIG.locationShort}</span>
              <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="flex items-center gap-2 hover:text-white"><Phone size={15} />{DEMO_CONFIG.phoneDisplay}</a>
              <a href={`mailto:${DEMO_CONFIG.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={15} />{DEMO_CONFIG.email}</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-lago-800 pt-6 text-xs text-lago-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Alto Cauce. Soluciones digitales para negocios reales.</span>
          <a href={DEMO_CONFIG.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-lago-300">altocauce.cl</a>
        </div>
      </div>
    </footer>
  )
}
