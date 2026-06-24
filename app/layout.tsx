import type { Metadata } from 'next'
import './globals.css'
import { DEMO_CONFIG } from '@/lib/demo-config'

export const metadata: Metadata = {
  title: `${DEMO_CONFIG.brandName} — ${DEMO_CONFIG.productName}`,
  description: 'Sistema de reservas para cabañas y alojamientos turísticos: disponibilidad, consultas ordenadas, pagos, estados, clientes y panel administrativo. Eventos como módulo adicional.',
  keywords: 'sistema de reservas, cabañas, turismo, reservas WhatsApp, administración de cabañas, Alto Cauce',
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
    <html lang="es">
      <body className="font-body bg-arena-50 text-lago-900 antialiased">
        {children}
      </body>
    </html>
  )
}
