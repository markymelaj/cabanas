import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks = {
    app: 'ok',
    database: 'error',
    authConfig: Boolean(url && anonKey),
    adminConfig: Boolean(serviceKey),
    whatsapp: process.env.WHATSAPP_ADMIN_NUMBER || '56957845292',
  }

  let message = 'Falta configurar la conexion.'

  if (url && (serviceKey || anonKey)) {
    try {
      const key = serviceKey || anonKey
      if (!key) throw new Error('missing-key')

      const client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { error } = await client
        .from('cabanas')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (error) throw error

      checks.database = 'connected'
      message = checks.adminConfig
        ? 'Conexion lista.'
        : 'Conexion publica lista. Falta configurar acceso administrativo.'
    } catch {
      checks.database = 'error'
      message = 'La app tiene configuracion, pero no pudo leer la base.'
    }
  }

  return NextResponse.json(
    {
      ok: checks.database === 'connected' && checks.authConfig,
      message,
      checks,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
