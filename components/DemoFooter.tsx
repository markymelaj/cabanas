import Link from 'next/link'
import { MapPin, MessageCircle } from 'lucide-react'
import { DEMO_LODGING } from '@/lib/demo-config'

export default function DemoFooter() {
  return (
    <footer className="bg-lago-950 py-12 text-lago-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-12">
        <div>
          <p className="font-display text-2xl text-white">{DEMO_LODGING.name}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-lago-300">Esta es una experiencia demostrativa. El nombre, las fotografías y los datos del alojamiento se reemplazan al implementar el sistema para cada negocio.</p>
          <p className="mt-4 flex items-center gap-2 text-sm"><MapPin size={15} /> {DEMO_LODGING.location}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={`https://wa.me/${DEMO_LODGING.whatsappNumber}`} className="btn-primary"><MessageCircle size={16} /> Consultar</a>
          <Link href="/" className="btn-outline border-white/20 bg-transparent text-white hover:bg-white/10">Ver el sistema</Link>
        </div>
      </div>
    </footer>
  )
}
