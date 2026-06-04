import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-lago-950 text-lago-300 py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-display text-2xl text-white font-light mb-3">
              Cabañas <span className="text-arena-300 italic">Puerto Varas</span>
            </p>
            <p className="text-sm leading-relaxed text-lago-400">
              Naturaleza y exclusividad junto al lago Llanquihue. Km 17.5, Ruta 225.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-lago-500 mb-4 font-medium">Navegación</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/cabanas" className="hover:text-white transition-colors">Nuestras cabañas</Link></li>
              <li><Link href="/salon" className="hover:text-white transition-colors">Salón de eventos</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-lago-500 mb-4 font-medium">Contacto</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-lago-500" />
                Camino a Ensenada S/N km 17.5, Ruta 225, Puerto Varas, Los Lagos
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-lago-500" />
                <a href="tel:+56957845292" className="hover:text-white transition-colors">+569 5784 5292</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-lago-500" />
                <a href="mailto:reservas@cabanaspuertovaras.cl" className="hover:text-white transition-colors">
                  reservas@cabanaspuertovaras.cl
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-lago-800 pt-6 text-xs text-lago-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Cabañas Puerto Varas. Todos los derechos reservados.</span>
          <a href="https://maps.app.goo.gl/4YxTYtfonpoMj6rKA" target="_blank" rel="noopener noreferrer" className="hover:text-lago-400 transition-colors">
            Ver en Google Maps →
          </a>
        </div>
      </div>
    </footer>
  )
}
