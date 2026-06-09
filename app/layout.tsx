import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cabañas y Eventos — Reservas online',
  description: 'Sistema de reservas para cabañas, eventos, pagos, disponibilidad y administración integral.',
  keywords: 'reservas cabañas, salón de eventos, sistema de reservas, hospedaje, eventos',
  openGraph: {
    title: 'Cabañas y Eventos',
    description: 'Reservas online para hospedaje y eventos',
    url: 'https://demo-reservas.vercel.app',
    siteName: 'Cabañas y Eventos',
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-arena-50 text-lago-900 antialiased">
        {children}
      </body>
    </html>
  )
}
