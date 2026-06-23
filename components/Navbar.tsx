'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/cabanas', label: 'Probar reservas' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#modulos', label: 'Módulos' },
    { href: '/admin', label: 'Panel demo' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-lago-950/88 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-white font-light tracking-wide">
          Alto Cauce <span className="text-arena-300 italic">Reservas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-lago-200 hover:text-white text-sm transition-colors">
              {link.label}
            </Link>
          ))}
          <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="flex items-center gap-2 text-lago-200 hover:text-white text-sm transition-colors">
            <Phone size={14} />{DEMO_CONFIG.phoneDisplay}
          </a>
          <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-sm py-2 px-4">
            Ver demo
          </Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1" aria-label="Abrir menú">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-lago-950 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-lago-200 text-sm" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="text-lago-200 text-sm">{DEMO_CONFIG.phoneDisplay}</a>
          <Link href="/cabanas" className="btn-primary bg-arena-500 text-sm text-center" onClick={() => setOpen(false)}>Ver demo</Link>
        </div>
      )}
    </header>
  )
}
