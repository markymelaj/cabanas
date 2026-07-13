'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Calendar, CalendarX, Home, LayoutDashboard, LogOut, Menu, PartyPopper, Settings, X } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const NAV = [
  { href: '/admin', label: 'Dashboard', short: 'Inicio', icon: LayoutDashboard },
  { href: '/admin/reservas', label: 'Reservas', short: 'Reservas', icon: Calendar },
  { href: '/admin/disponibilidad', label: 'Disponibilidad', short: 'Fechas', icon: CalendarX },
  { href: '/admin/salon', label: 'Salón y eventos', short: 'Eventos', icon: PartyPopper },
  { href: '/admin/cabanas', label: 'Catálogo de cabañas', short: 'Cabañas', icon: Home },
  { href: '/admin/configuracion', label: 'Configuración', short: 'Ajustes', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function activeFor(href: string) {
    return pathname === href || (href !== '/admin' && pathname.startsWith(href))
  }

  async function handleLogout() {
    await fetch('/api/demo-admin/session', { method: 'DELETE' }).catch(() => null)
    await getSupabaseBrowser().auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-lago-950 text-white lg:flex print:hidden">
        <div className="border-b border-lago-800 p-6"><p className="font-display text-xl">Alto Cauce <span className="text-arena-300">Reservas</span></p><p className="mt-1 text-xs text-lago-400">Operación de alojamiento</p></div>
        <nav className="flex-1 space-y-1 p-3">{NAV.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activeFor(href) ? 'bg-white/12 text-white' : 'text-lago-300 hover:bg-white/7 hover:text-white'}`}><Icon size={18} />{label}</Link>)}</nav>
        <div className="border-t border-lago-800 p-3"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-lago-400 hover:bg-white/7 hover:text-white"><LogOut size={18} />Cerrar sesión</button></div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-arena-200 bg-white/95 px-4 backdrop-blur lg:hidden print:hidden">
        <div><p className="font-display text-lg leading-none text-lago-950">Alto Cauce</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-arena-600">Panel de reservas</p></div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-arena-200 p-2.5 text-lago-900" aria-label="Abrir navegación"><Menu size={21} /></button>
      </header>

      {open && <div className="fixed inset-0 z-50 lg:hidden print:hidden"><button type="button" className="absolute inset-0 bg-lago-950/55 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Cerrar navegación" /><aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-lago-950 text-white shadow-2xl"><div className="flex items-center justify-between border-b border-lago-800 p-5"><div><p className="font-display text-xl">Alto Cauce <span className="text-arena-300">Reservas</span></p><p className="mt-1 text-xs text-lago-400">Menú de administración</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-lago-200" aria-label="Cerrar navegación"><X size={22} /></button></div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{NAV.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ${activeFor(href) ? 'bg-white/12 text-white' : 'text-lago-300'}`}><Icon size={19} />{label}</Link>)}</nav><div className="safe-bottom border-t border-lago-800 p-3"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-lago-300"><LogOut size={18} />Cerrar sesión</button></div></aside></div>}

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-arena-200 bg-white/97 px-1 pt-1 shadow-[0_-10px_30px_rgba(20,30,25,.08)] backdrop-blur lg:hidden print:hidden">
        {NAV.slice(0, 4).map(({ href, short, icon: Icon }) => <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${activeFor(href) ? 'text-arena-700' : 'text-volcan-500'}`}><Icon size={19} /><span>{short}</span></Link>)}
      </nav>
    </>
  )
}
