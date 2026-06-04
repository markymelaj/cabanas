import { getSupabaseAdmin } from '@/lib/supabase-server'
import AdminBlockDates from '@/components/AdminBlockDates'
import AdminShell from '@/components/AdminShell'

export const revalidate = 0

export default function AdminDisponibilidadPage() {
  return (
    <AdminShell>
      <DisponibilidadContent />
    </AdminShell>
  )
}

async function DisponibilidadContent() {
  let cabanas: any[] = []
  let blocked: any[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const [{ data: cabanasData }, { data: blockedData }] = await Promise.all([
      supabaseAdmin
        .from('cabanas')
        .select('id, nombre, slug')
        .eq('activa', true)
        .order('orden'),
      supabaseAdmin
        .from('blocked_dates')
        .select('*')
        .order('fecha', { ascending: true }),
    ])

    cabanas = cabanasData ?? []
    blocked = blockedData ?? []
  } catch (error) {
    console.error('[admin.disponibilidad]', error)
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-lago-900 mb-2">Gestion de disponibilidad</h1>
      <p className="text-volcan-500 text-sm mb-8">Bloquea fechas manualmente para cabanas o el salon de eventos.</p>
      <AdminBlockDates cabanas={cabanas} blocked={blocked} />
    </div>
  )
}
