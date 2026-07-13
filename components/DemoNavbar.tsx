'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Menu, Phone, X } from 'lucide-react'
import { DEMO_LODGING } from '@/lib/demo-config'

export default function DemoNavbar() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '/cabanas', label: 'Cabañas' },
    { href: '/salon', label: 'Eventos' },
    { href: '/admin', label: 'Panel demo' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-lago-950/88 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/cabanas" className="leading-tight">
          <span className="block font-display text-lg tracking-tight">{DEMO_LODGING.name}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-arena-300">Demo de alojamiento</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-lago-100 transition hover:text-white">
              {link.label}
            </Link>
          ))}
          <a href={`tel:${DEMO_LODGING.phoneHref}`} className="flex items-center gap-2 text-sm text-lago-100 hover:text-white">
            <Phone size={15} /> {DEMO_LODGING.phoneDisplay}
          </a>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10">
            <ArrowLeft size={14} /> Volver a Alto Cauce
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-lago-950 px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-lago-100 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
            <a href={`tel:${DEMO_LODGING.phoneHref}`} className="rounded-xl px-3 py-3 text-sm text-lago-100">{DEMO_LODGING.phoneDisplay}</a>
            <Link href="/" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-2 rounded-xl border border-white/20 px-3 py-3 text-sm">
              <ArrowLeft size={15} /> Volver a Alto Cauce
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
