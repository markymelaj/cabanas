import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCLP } from '@/lib/pricing'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { reserva?: string; status?: string }
}) {
  const { reserva: reservaId, status } = searchParams

  let reservation: any = null
  if (reservaId) {
    const supabaseAdmin = getSupabaseAdmin()
    const { data } = await supabaseAdmin
      .from('reservations_full')
      .select('*')
      .eq('id', reservaId)
      .single()
    reservation = data
  }

  const fmt = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  const isSuccess = status === 'success' || reservation?.payment_status === 'approved'
  const isFailure = status === 'failure' || reservation?.payment_status === 'rejected'

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-arena-50 flex items-center justify-center py-20 px-6">
        <div className="bg-white rounded-2xl card-shadow p-10 max-w-lg w-full text-center">
          {isSuccess && (
            <>
              <CheckCircle size={52} className="mx-auto text-lago-600 mb-4" />
              <h1 className="font-display text-4xl text-lago-900 mb-2">¡Reserva confirmada!</h1>
              <p className="text-volcán-500 text-sm mb-6">
                Te enviamos un email de confirmación. ¡Te esperamos!
              </p>
              {reservation && (
                <div className="bg-lago-50 rounded-xl p-5 text-left space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-volcán-500">Cabaña</span>
                    <span className="font-medium">{reservation.cabana_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-volcán-500">Check-in</span>
                    <span>{fmt(reservation.check_in)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-volcán-500">Check-out</span>
                    <span>{fmt(reservation.check_out)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-volcán-500">Huéspedes</span>
                    <span>{reservation.guests}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-lago-100">
                    <span>Total reserva</span>
                    <span className="text-lago-700">{formatCLP(reservation.total_amount)}</span>
                  </div>
                  <p className="text-xs text-volcán-400">
                    Anticipo pagado: {formatCLP(reservation.anticipo_monto ?? 0)} · Saldo al llegar: {formatCLP(reservation.total_amount - (reservation.anticipo_monto ?? 0))}
                  </p>
                </div>
              )}
            </>
          )}

          {isFailure && (
            <>
              <XCircle size={52} className="mx-auto text-red-400 mb-4" />
              <h1 className="font-display text-4xl text-lago-900 mb-2">Pago rechazado</h1>
              <p className="text-volcán-500 text-sm mb-6">
                Tu pago no fue procesado. Puedes intentarlo nuevamente o contactarnos.
              </p>
            </>
          )}

          {!isSuccess && !isFailure && (
            <>
              <Clock size={52} className="mx-auto text-arena-400 mb-4" />
              <h1 className="font-display text-4xl text-lago-900 mb-2">Pago pendiente</h1>
              <p className="text-volcán-500 text-sm mb-6">
                Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.
              </p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cabanas" className="btn-outline text-sm">Ver otras cabañas</Link>
            <a href="tel:+56965880268" className="btn-primary text-sm">Llamar al +569 6588 0268</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
