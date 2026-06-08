'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, CalendarX, Home, LayoutDashboard, LogOut, PartyPopper, Settings } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cabanas', label: 'Catalogo cabanas', icon: Home },
  { href: '/admin/reservas', label: 'Reservas cabanas', icon: Calendar },
  { href: '/admin/salon', label: 'Salon y eventos', icon: PartyPopper },
  { href: '/admin/disponibilidad', label: 'Disponibilidad', icon: CalendarX },
  { href: '/admin/configuracion', label: 'Precios salon', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-lago-950 text-white flex flex-col min-h-screen flex-shrink-0 print:hidden">
      <div className="p-5 border-b border-lago-800">
        <p className="font-display text-sm text-white font-light">Cabanas</p>
        <p className="font-display text-sm text-arena-300 italic">Puerto Varas</p>
        <p className="text-xs text-lago-500 mt-1">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-lago-700 text-white' : 'text-lago-300 hover:bg-lago-800 hover:text-white'}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-lago-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-lago-400 hover:text-white hover:bg-lago-800 w-full transition-colors">
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
