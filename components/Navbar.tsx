'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-lago-950/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-white font-light tracking-wide">
          Cabañas <span className="text-arena-300 italic">Puerto Varas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/cabanas" className="text-lago-200 hover:text-white text-sm transition-colors">Cabañas</Link>
          <Link href="/salon" className="text-lago-200 hover:text-white text-sm transition-colors">Salón de eventos</Link>
          <a href="tel:+56965880268" className="flex items-center gap-2 text-lago-200 hover:text-white text-sm transition-colors">
            <Phone size={14} />+569 6588 0268
          </a>
          <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-sm py-2 px-4">
            Reservar
          </Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-lago-950 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="/cabanas" className="text-lago-200 text-sm" onClick={() => setOpen(false)}>Cabañas</Link>
          <Link href="/salon" className="text-lago-200 text-sm" onClick={() => setOpen(false)}>Salón de eventos</Link>
          <a href="tel:+56965880268" className="text-lago-200 text-sm">+569 6588 0268</a>
          <Link href="/cabanas" className="btn-primary bg-arena-500 text-sm text-center" onClick={() => setOpen(false)}>Reservar</Link>
        </div>
      )}
    </header>
  )
}
