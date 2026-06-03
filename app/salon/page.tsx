import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SalonQuoteForm from '@/components/SalonQuoteForm'

export default function SalonPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative bg-lago-900 text-white py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://cabanaspuertovaras.cl/wp-content/uploads/2021/06/Salon-de-eventos-Cabanas-Puerto-Varas-3.jpg')] bg-cover bg-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-lago-900/60 to-lago-900" />
          <div className="relative container mx-auto max-w-3xl text-center">
            <p className="font-display italic text-lago-300 text-lg mb-3">Eventos</p>
            <h1 className="font-display text-5xl md:text-6xl font-light mb-6">Salón de Eventos</h1>
            <p className="text-lago-200 text-base leading-relaxed max-w-xl mx-auto">
              290 m² frente al lago Llanquihue y los volcanes. Para matrimonios, eventos corporativos y celebraciones hasta 200 invitados.
            </p>
          </div>
        </div>

        {/* Características */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { emoji: '🏛️', title: '290 m²', desc: 'Espacio principal' },
                { emoji: '👥', title: '200 personas', desc: 'Capacidad máxima' },
                { emoji: '🌋', title: 'Vista volcanes', desc: 'Panorama único' },
                { emoji: '🍽️', title: 'Cocina equipada', desc: 'Para banquetería' },
                { emoji: '🎵', title: 'Pista de baile', desc: 'Con equipo de sonido' },
                { emoji: '🚗', title: 'Estacionamiento', desc: 'Para todos tus invitados' },
              ].map((f) => (
                <div key={f.title} className="text-center p-6 rounded-xl bg-arena-50">
                  <div className="text-3xl mb-2">{f.emoji}</div>
                  <p className="font-display text-xl text-lago-900 mb-0.5">{f.title}</p>
                  <p className="text-xs text-volcán-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cotizador */}
        <section className="bg-arena-50 py-20 px-6">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <p className="text-arena-600 font-display italic text-lg mb-2">¿Tienes una fecha en mente?</p>
              <h2 className="font-display text-4xl text-lago-900 font-light">Cotiza tu evento</h2>
              <p className="text-volcán-500 text-sm mt-2">Completa el formulario y te respondemos en menos de 24 horas.</p>
            </div>
            <SalonQuoteForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
