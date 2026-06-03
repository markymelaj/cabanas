import { supabaseAdmin } from '@/lib/supabase'
import AdminBlockDates from '@/components/AdminBlockDates'

export const revalidate = 0

export default async function AdminDisponibilidadPage() {
  const { data: cabanas } = await supabaseAdmin
    .from('cabanas')
    .select('id, nombre, slug')
    .eq('activa', true)
    .order('orden')

  const { data: blocked } = await supabaseAdmin
    .from('blocked_dates')
    .select('*')
    .order('fecha', { ascending: true })

  return (
    <div>
      <h1 className="font-display text-3xl text-lago-900 mb-2">Gestión de disponibilidad</h1>
      <p className="text-volcán-500 text-sm mb-8">Bloquea fechas manualmente para cabañas o el salón de eventos.</p>
      <AdminBlockDates cabanas={cabanas ?? []} blocked={blocked ?? []} />
    </div>
  )
}
