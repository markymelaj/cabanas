'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const links = [
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#funciones', label: 'Funciones' },
    { href: '/#planes', label: 'Planes' },
    { href: '/admin', label: 'Panel demo' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-lago-950/95 shadow-[0_10px_30px_rgba(5,12,9,0.14)] backdrop-blur-xl' : 'border-b border-white/[0.08] bg-lago-950/78 backdrop-blur-md'}`}>
      <div className="mx-auto flex h-[74px] max-w-[1420px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3 leading-none" aria-label="Alto Cauce Reservas, inicio">
          <span className="font-display text-[22px] tracking-[-0.02em] text-white transition group-hover:text-arena-100">Alto Cauce</span>
          <span className="h-5 w-px bg-white/20" />
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-arena-300">Reservas</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-1.5 py-2 text-[13px] font-medium text-lago-100 transition hover:text-white">{link.label}</Link>
          ))}
          <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="ml-1 flex items-center gap-2 border-l border-white/15 pl-5 text-[13px] text-lago-100 transition hover:text-white">
            <Phone size={14} />{DEMO_CONFIG.phoneDisplay}
          </a>
          <Link href="/cabanas" className="btn-primary ml-1 min-h-10 rounded-xl px-4 py-2 text-xs">Probar como huésped</Link>
        </nav>

        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition hover:bg-white/10 md:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-lago-950/98 px-5 py-5 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-lago-100 transition hover:bg-white/10">{link.label}</Link>)}
            <a href={`tel:${DEMO_CONFIG.phoneHref}`} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-lago-100"><Phone size={15} />{DEMO_CONFIG.phoneDisplay}</a>
            <Link href="/cabanas" onClick={() => setOpen(false)} className="btn-primary mt-2">Probar como huésped</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
