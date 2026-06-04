import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const key = serviceKey || anonKey

  const checks = {
    app: 'ok',
    database: 'error',
    authConfig: Boolean(url && anonKey),
    adminConfig: Boolean(serviceKey),
    whatsapp: process.env.WHATSAPP_ADMIN_NUMBER || '56957845292',
  }

  let message = 'Falta configurar la conexion.'
  let reason: string | null = null
  let detail: { code?: string; status?: number; table?: string } | null = null

  if (url && key) {
    try {
      const client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const tables = ['cabanas', 'clients', 'reservations', 'salon_quotes']
      for (const table of tables) {
        const { error } = await client
          .from(table)
          .select('id', { count: 'exact', head: true })
          .limit(1)

        if (error) {
          reason = classifyError(error)
          detail = {
            code: error.code,
            status: Number((error as any).status) || undefined,
            table,
          }
          throw error
        }
      }

      checks.database = 'connected'
      message = checks.adminConfig
        ? 'Conexion lista.'
        : 'Conexion publica lista. Falta configurar acceso administrativo.'
    } catch (error) {
      checks.database = 'error'
      reason = reason ?? classifyError(error)
      message = publicMessage(reason)
    }
  }

  return NextResponse.json(
    {
      ok: checks.database === 'connected' && checks.authConfig,
      message,
      reason,
      detail,
      checks,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

function classifyError(error: any) {
  const code = String(error?.code ?? '')
  const message = String(error?.message ?? '').toLowerCase()
  const status = Number(error?.status)

  if (code === '42P01' || code === 'PGRST205' || message.includes('could not find') || message.includes('does not exist')) {
    return 'table_missing'
  }

  if (status === 401 || status === 403 || message.includes('jwt') || message.includes('api key') || message.includes('invalid')) {
    return 'invalid_or_wrong_key'
  }

  if (code === '42501' || message.includes('permission') || message.includes('rls')) {
    return 'permission_error'
  }

  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'network_error'
  }

  return 'database_error'
}

function publicMessage(reason: string | null) {
  if (reason === 'table_missing') return 'La conexion responde, pero faltan tablas del sistema.'
  if (reason === 'invalid_or_wrong_key') return 'La conexion no pudo autenticar las claves configuradas.'
  if (reason === 'permission_error') return 'La conexion responde, pero faltan permisos de lectura/escritura.'
  if (reason === 'network_error') return 'La conexion no respondio desde el servidor.'
  return 'La app tiene configuracion, pero no pudo leer la base.'
}
