import Link from 'next/link'
import { getSupabaseAdmin, type Cabana } from '@/lib/supabase-server'
import { logSupabaseError } from '@/lib/supabase-errors'
import { DEFAULT_CABANAS } from '@/lib/default-cabanas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MapPin, Phone, Mail, Mountain, Waves, TreePine, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCabanas(): Promise<Cabana[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('cabanas')
      .select('*')
      .eq('activa', true)
      .order('orden')

    if (error) {
      logSupabaseError('home.cabanas.list', error)
      return DEFAULT_CABANAS
    }

    const cabanas = (data as Cabana[]) ?? []
    return cabanas.length > 0 ? cabanas : DEFAULT_CABANAS
  } catch (error) {
    console.error('[home.cabanas.list]', error)
    return DEFAULT_CABANAS
  }
}

const ATRACCIONES = [
  { lugar: 'Puerto Varas', dist: '15 min' },
  { lugar: 'Volcán Osorno', dist: '40 min' },
  { lugar: 'Saltos del Petrohué', dist: '30 min' },
  { lugar: 'Ensenada', dist: '25 min' },
  { lugar: 'Frutillar', dist: '45 min' },
  { lugar: 'Puerto Montt', dist: '35 min' },
  { lugar: 'Aeropuerto El Tepual', dist: '40 min' },
  { lugar: 'Chiloé', dist: '2 horas' },
]

const AMENIDADES = [
  { icon: '🌊', label: 'Acceso al lago' },
  { icon: '🚗', label: 'Estacionamiento' },
  { icon: '📶', label: 'WiFi' },
  { icon: '🔥', label: 'Parrilla en terraza' },
  { icon: '🍳', label: 'Cocina equipada' },
  { icon: '🚴', label: 'Acceso ciclovía' },
  { icon: '🌿', label: 'Áreas verdes' },
  { icon: '🎠', label: 'Juegos infantiles' },
  { icon: '👕', label: 'Lavandería' },
  { icon: '📍', label: 'Ubicación privilegiada' },
]

export default async function HomePage() {
  const cabanas = await getCabanas()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-end pb-20 overflow-hidden bg-lago-950">
          <div className="absolute inset-0 bg-[url('https://cabanaspuertovaras.cl/wp-content/uploads/2025/12/Cabanas-para-2-y-4-scaled.jpeg')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-950 via-lago-950/40 to-transparent" />
          <div className="relative container mx-auto px-6 md:px-12">
            <div className="max-w-3xl animate-fade-up">
              <p className="text-arena-300 font-display text-lg italic mb-4 tracking-wide">
                Km 17.5, Ruta 225 — Puerto Varas
              </p>
              <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-none mb-6">
                Donde encuentras<br />
                <em className="text-arena-300">tranquilidad</em> y<br />
                naturaleza
              </h1>
              <p className="text-lago-200 text-lg font-body font-light max-w-xl mb-10 leading-relaxed">
                Cabañas rústicas con vista panorámica a los volcanes y el lago Llanquihue. A 15 minutos del centro de Puerto Varas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600 text-white">
                  Ver cabañas
                </Link>
                <Link href="/salon" className="btn-outline border-white/40 text-white hover:bg-white/10">
                  Salón de eventos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cabañas */}
        <section className="py-24 bg-arena-50" id="cabanas">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-xl mb-16">
              <p className="text-arena-600 font-display italic text-lg mb-3">Hospedaje</p>
              <h2 className="section-title mb-4">Cabañas rústicas</h2>
              <p className="text-volcán-600 text-base leading-relaxed">
                Cada cabaña fue diseñada para integrarse al paisaje. Madera, piedra y comodidad, con vista al lago desde la terraza.
              </p>
            </div>
            {cabanas.length === 0 ? (
              <div className="bg-white rounded-2xl card-shadow p-8 text-center max-w-xl">
                <TreePine size={36} className="mx-auto text-lago-400 mb-4" />
                <h3 className="font-display text-2xl text-lago-900 mb-2">Reserva tu cabana</h3>
                <p className="text-volcÃ¡n-500 text-sm leading-relaxed mb-5">
                  Estamos cargando las cabaÃ±as disponibles. EscrÃ­benos por WhatsApp y te respondemos con fechas y valores.
                </p>
                <a href="https://wa.me/56957845292" className="btn-primary inline-flex">
                  Consultar disponibilidad
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {cabanas.map((cab, i) => (
                <div key={cab.id} className="bg-white rounded-2xl overflow-hidden card-shadow group">
                  <div className="relative h-64 overflow-hidden bg-lago-100">
                    {cab.fotos[0] ? (
                      <img
                        src={cab.fotos[0]}
                        alt={cab.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lago-300">
                        <TreePine size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-lago-800">
                      Hasta {cab.capacidad} personas
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl text-lago-900 mb-2">{cab.nombre}</h3>
                    <p className="text-volcán-600 text-sm leading-relaxed mb-5">{cab.descripcion_corta}</p>
                    <ul className="grid grid-cols-2 gap-1 mb-6">
                      {cab.amenidades.slice(0, 4).map((a) => (
                        <li key={a} className="text-xs text-volcán-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-lago-400 inline-block flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-5 border-t border-arena-100">
                      <div>
                        <span className="text-2xl font-display font-medium text-lago-900">
                          ${cab.precio_noche.toLocaleString('es-CL')}
                        </span>
                        <span className="text-volcán-500 text-sm ml-1">/ noche</span>
                      </div>
                      <Link href={`/reservar/${cab.slug}`} className="btn-primary text-sm">
                        Reservar
                      </Link>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Salón */}
        <section className="py-24 bg-lago-900 text-white" id="salon">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-lago-300 font-display italic text-lg mb-3">Eventos</p>
                <h2 className="font-display text-5xl text-white font-light mb-6">
                  Salón de<br /><em className="text-arena-300">eventos</em>
                </h2>
                <p className="text-lago-200 leading-relaxed mb-8">
                  290 m² de campo, naturaleza y elegancia frente a los volcanes y el lago Llanquihue. Capacidad para hasta 200 invitados. Ideal para matrimonios, eventos corporativos y celebraciones.
                </p>
                <ul className="space-y-2 mb-10">
                  {['Climatización', 'Pista de baile', 'Cocina equipada', 'Terraza al lago', 'Estacionamiento', 'Jardín para matrimonio civil'].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-lago-200">
                      <span className="w-5 h-5 rounded-full bg-lago-700 flex items-center justify-center flex-shrink-0">
                        <Star size={10} className="text-arena-300" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/salon" className="btn-primary bg-arena-500 hover:bg-arena-600">
                  Cotizar mi evento
                </Link>
              </div>
              <div className="relative h-96 lg:h-auto rounded-2xl overflow-hidden bg-lago-800">
                <img
                  src="https://cabanaspuertovaras.cl/wp-content/uploads/2021/06/Salon-de-eventos-Cabanas-Puerto-Varas-3.jpg"
                  alt="Salón de eventos"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Amenidades */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="section-title text-center mb-12">Todo lo que necesitas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {AMENIDADES.map((a) => (
                <div key={a.label} className="text-center p-5 rounded-xl bg-arena-50 hover:bg-lago-50 transition-colors">
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <p className="text-xs font-medium text-volcán-700">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className="py-20 bg-arena-50">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-xl mb-12">
              <p className="text-arena-600 font-display italic text-lg mb-3">Ubicación</p>
              <h2 className="section-title mb-4">Punto de partida perfecto</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ATRACCIONES.map((a) => (
                <div key={a.lugar} className="bg-white rounded-xl p-4 card-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={12} className="text-lago-500" />
                    <span className="text-xs text-volcán-500">{a.dist}</span>
                  </div>
                  <p className="font-display text-lg text-lago-900">{a.lugar}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-lago-800 text-white text-center">
          <div className="container mx-auto px-6">
            <Mountain size={40} className="mx-auto mb-6 text-arena-300 opacity-70" />
            <h2 className="font-display text-5xl font-light mb-4">¿Listo para desconectarte?</h2>
            <p className="text-lago-200 max-w-md mx-auto mb-8 text-base">
              Reserva tu cabaña o cotiza tu evento. Respondemos en menos de 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cabanas" className="btn-primary bg-arena-500 hover:bg-arena-600">
                Reservar cabaña
              </Link>
              <Link href="/salon" className="btn-outline border-white/40 text-white hover:bg-white/10">
                Cotizar salón
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
