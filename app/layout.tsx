import type { Metadata } from 'next'
import { Prata, Figtree } from 'next/font/google'
import './globals.css'
import { DEMO_CONFIG } from '@/lib/demo-config'

// Fuentes cargadas con next/font (self-hosted, sin FOUT ni requests externas).
// Antes el CSS declaraba familias que nunca se cargaban.
const displayFont = Prata({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${DEMO_CONFIG.brandName} — ${DEMO_CONFIG.productName}`,
  description: 'Sistema de reservas para cabañas y alojamientos turísticos del Salto del Laja y alrededores: disponibilidad, consultas ordenadas, pagos, estados y panel administrativo. Salón de eventos como módulo opcional.',
  keywords: 'sistema de reservas, cabañas, Salto del Laja, turismo Biobío, reservas WhatsApp, administración de cabañas, Alto Cauce',
  openGraph: {
    title: DEMO_CONFIG.brandName,
    description: DEMO_CONFIG.productName,
    url: DEMO_CONFIG.baseUrl,
    siteName: DEMO_CONFIG.brandName,
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-body bg-arena-50 text-lago-900 antialiased">
        {children}
      </body>
    </html>
  )
}
