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
  title: 'Cabañas Puerto Varas — Naturaleza y tranquilidad junto al lago',
  description: 'Cabañas rústicas con vista a los volcanes y el lago Llanquihue. A 15 minutos del centro de Puerto Varas. Salón de eventos para hasta 200 personas.',
  keywords: 'cabañas puerto varas, cabaña lago llanquihue, arriendo cabaña puerto varas, salón eventos puerto varas, volcán osorno',
  openGraph: {
    title: 'Cabañas Puerto Varas',
    description: 'Naturaleza y exclusividad junto al lago Llanquihue',
    url: 'https://cabanaspuertovaras.cl',
    siteName: 'Cabañas Puerto Varas',
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
