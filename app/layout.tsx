import type { Metadata } from 'next'
import './globals.css'
import { DEMO_CONFIG } from '@/lib/demo-config'

export const metadata: Metadata = {
  title: `${DEMO_CONFIG.brandName} — ${DEMO_CONFIG.productName}`,
  description: 'Demo comercial de sistema de reservas, cotizaciones, disponibilidad, pagos, WhatsApp y panel administrativo para cabañas, salones de eventos y complejos mixtos.',
  keywords: 'sistema de reservas, cabañas, salón de eventos, turismo, cotizaciones WhatsApp, Alto Cauce',
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
