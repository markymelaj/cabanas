import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const key = serviceKey || anonKey

  const checks = {
    app: 'ok',
    database: 'error',
    authConfig: Boolean(url && anonKey),
    serviceConfig: Boolean(serviceKey),
    adminConfig: Boolean(adminEmail),
    whatsapp: process.env.WHATSAPP_ADMIN_NUMBER || '56957845292',
  }

  let message = 'Falta configurar la conexion.'
  let reason: string | null = null
  let detail: { code?: string; status?: number; table?: string; message?: string; hint?: string } | null = null

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
            message: sanitize(error.message),
            hint: sanitize(error.hint),
          }
          throw error
        }
      }

      checks.database = 'connected'
      if (!checks.serviceConfig) {
        reason = 'missing_service_key'
        message = 'Conexion publica lista. Falta clave administrativa.'
      } else if (!checks.adminConfig) {
        reason = 'missing_admin_email'
        message = 'Conexion lista. Falta configurar email admin.'
      } else {
        message = 'Conexion lista.'
      }
    } catch (error) {
      checks.database = 'error'
      reason = reason ?? classifyError(error)
      message = publicMessage(reason)
    }
  }

  return NextResponse.json(
    {
      ok: checks.database === 'connected' && checks.authConfig && checks.serviceConfig && checks.adminConfig,
      message,
      reason,
      detail,
      nextStep: nextStep(reason, detail),
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
  if (reason === 'missing_service_key') return 'Conexion publica lista. Falta clave administrativa.'
  if (reason === 'missing_admin_email') return 'Conexion lista. Falta configurar email admin.'
  if (reason === 'table_missing') return 'La conexion responde, pero faltan tablas del sistema.'
  if (reason === 'invalid_or_wrong_key') return 'La conexion no pudo autenticar las claves configuradas.'
  if (reason === 'permission_error') return 'La conexion responde, pero faltan permisos de lectura/escritura.'
  if (reason === 'network_error') return 'La conexion no respondio desde el servidor.'
  return 'La app tiene configuracion, pero no pudo leer la base.'
}

function nextStep(reason: string | null, detail: { table?: string } | null) {
  if (reason === 'missing_service_key') return 'Configurar SUPABASE_SERVICE_ROLE_KEY en Vercel y redeployar.'
  if (reason === 'missing_admin_email') return 'Configurar ADMIN_EMAIL en Vercel y crear ese mismo usuario en Authentication > Users.'
  if (reason === 'table_missing') return `Ejecutar el schema SQL principal. Falta o no se ve la tabla ${detail?.table ?? 'principal'}.`
  if (reason === 'invalid_or_wrong_key') return 'Revisar que las keys sean del mismo proyecto, sin comillas ni espacios, y redeployar.'
  if (reason === 'permission_error') return 'Ejecutar repair_seed_cabanas.sql para reparar permisos y datos base.'
  if (reason === 'network_error') return 'Revisar que el proyecto este activo y que la URL del proyecto sea correcta.'
  return 'Abrir Supabase SQL Editor y probar: select count(*) from cabanas; luego copiar este JSON para identificar el error exacto.'
}

function sanitize(value: unknown) {
  if (!value) return undefined
  return String(value)
    .replace(/eyJ[a-zA-Z0-9._-]+/g, '[token]')
    .replace(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/g, '[project-url]')
    .slice(0, 240)
}
