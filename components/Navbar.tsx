'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#funciones', label: 'Funciones' },
    { href: '/#planes', label: 'Planes' },
    { href: '/admin', label: 'Panel demo' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-lago-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="leading-none">
          <span className="font-display text-xl tracking-tight">Alto Cauce</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] text-arena-300">Reservas</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-lago-100 hover:text-white">{link.label}</Link>)}
          <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="flex items-center gap-2 text-sm text-lago-100 hover:text-white"><Phone size={14} />{DEMO_CONFIG.phoneDisplay}</a>
          <Link href="/cabanas" className="btn-primary min-h-10 px-4 py-2 text-xs">Probar como huésped</Link>
        </nav>
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 md:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-lago-950 px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-lago-100 hover:bg-white/10">{link.label}</Link>)}
            <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="rounded-xl px-3 py-3 text-sm text-lago-100">{DEMO_CONFIG.phoneDisplay}</a>
            <Link href="/cabanas" onClick={() => setOpen(false)} className="btn-primary mt-2">Probar como huésped</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
