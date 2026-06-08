import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import GuestCheckInForm from '@/components/GuestCheckInForm'

export const dynamic = 'force-dynamic'

export default async function CheckInPage({ params }: { params: { token: string } }) {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: reservation } = await supabaseAdmin
    .from('reservations_full')
    .select('*')
    .eq('checkin_token', params.token)
    .maybeSingle()

  if (!reservation) {
    return (
      <main className="min-h-screen bg-arena-50 px-6 py-20">
        <div className="mx-auto max-w-xl bg-white border border-arena-100 rounded-lg p-8 text-center">
          <h1 className="font-display text-3xl text-lago-900">Link no disponible</h1>
          <p className="text-sm text-volcan-500 mt-2">Contactanos por WhatsApp para revisar tu reserva.</p>
        </div>
      </main>
    )
  }

  const fmt = (value: string) => format(new Date(`${value}T12:00:00`), "d 'de' MMMM yyyy", { locale: es })

  return (
    <main className="min-h-screen bg-arena-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-lago-600 font-medium">Check-in online</p>
          <h1 className="font-display text-4xl text-lago-900">Completa tus datos de llegada</h1>
          <p className="text-sm text-volcan-500 mt-2">Esta informacion ayuda a agilizar tu ingreso y confirmar los datos de tu estadia.</p>
        </div>

        <div className="bg-lago-950 text-white rounded-lg p-5 mb-5">
          <p className="font-display text-2xl">{reservation.cabana_nombre ?? 'Cabana'}</p>
          <div className="mt-3 grid gap-2 text-sm text-lago-100 md:grid-cols-3">
            <span>Check-in: {fmt(reservation.check_in)}</span>
            <span>Check-out: {fmt(reservation.check_out)}</span>
            <span>{reservation.guests} huespedes</span>
          </div>
        </div>

        <GuestCheckInForm token={params.token} expectedGuests={reservation.guests ?? 1} />
      </div>
    </main>
  )
}
