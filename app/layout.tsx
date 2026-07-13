import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DEMO_CONFIG } from '@/lib/demo-config'

export const metadata: Metadata = {
  metadataBase: new URL(DEMO_CONFIG.baseUrl),
  title: {
    default: `${DEMO_CONFIG.brandName} — ${DEMO_CONFIG.productName}`,
    template: `%s — ${DEMO_CONFIG.brandName}`,
  },
  description: 'Sistema de reservas para cabañas y alojamientos turísticos: disponibilidad, consultas ordenadas, pagos, estados y administración móvil.',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14251e',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="font-body bg-arena-50 text-lago-900 antialiased">
        {children}
      </body>
    </html>
  )
}
