import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function Footer() {
  return (
    <footer className="bg-lago-950 text-lago-300 py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-display text-2xl text-white font-light mb-3">
              Alto Cauce <span className="text-arena-300 italic">Reservas</span>
            </p>
            <p className="text-sm leading-relaxed text-lago-400">
              Sistema de reservas y administración para cabañas, alojamientos turísticos y espacios de eventos.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-lago-500 mb-4 font-medium">Navegación</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/cabanas" className="hover:text-white transition-colors">Reservas</Link></li>
              <li><Link href="/salon" className="hover:text-white transition-colors">Eventos</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Panel</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-lago-500 mb-4 font-medium">Contacto</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-lago-500" />
                {DEMO_CONFIG.locationLong}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-lago-500" />
                <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="hover:text-white transition-colors">{DEMO_CONFIG.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-lago-500" />
                <a href={`mailto:${DEMO_CONFIG.email}`} className="hover:text-white transition-colors">
                  {DEMO_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-lago-800 pt-6 text-xs text-lago-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Alto Cauce. Sistema de reservas para alojamientos.</span>
          <a href={DEMO_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-lago-400 transition-colors">
            Conocer Alto Cauce →
          </a>
        </div>
      </div>
    </footer>
  )
}
