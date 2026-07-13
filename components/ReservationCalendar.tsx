'use client'

import type { Cabana } from '@/lib/supabase'
import CabanaReservationForm from '@/components/CabanaReservationForm'

export default function ReservationCalendar({ cabana }: { cabana: Cabana }) {
  return <CabanaReservationForm cabanas={[cabana]} initialCabanaId={cabana.id} />
}
