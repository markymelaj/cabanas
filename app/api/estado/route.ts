import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const key = serviceKey || anonKey
  const anonRole = readKeyRole(anonKey)
  const serviceRole = readKeyRole(serviceKey)

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
  let detail: {
    client?: string
    code?: string
    status?: number
    table?: string
    message?: string
    details?: string
    hint?: string
  } | null = null
  const tables: Record<string, number | string> = {}

  if (url && key) {
    try {
      if (serviceKey && serviceRole && serviceRole !== 'service_role' && serviceRole !== 'secret_key') {
        reason = 'wrong_service_key'
        detail = {
          client: 'service',
          message: `SUPABASE_SERVICE_ROLE_KEY tiene rol ${serviceRole}, no service_role.`,
        }
        throw new Error(detail.message)
      }

      const tableNames = ['cabanas', 'clients', 'reservations', 'salon_quotes', 'blocked_dates']
      for (const table of tableNames) {
        const result = await checkRestTable({ url, key, table, clientName: serviceKey ? 'service' : 'anon' })
        tables[table] = result.status
      }

      if (anonKey) {
        const publicRead = await checkRestTable({ url, key: anonKey, table: 'cabanas', clientName: 'anon' })
        tables.cabanas_public = publicRead.status
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
    } catch (error: any) {
      checks.database = 'error'
      reason = reason ?? classifyError(error)
      detail = detail ?? normalizeErrorDetail(error)
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
      checks: {
        ...checks,
        anonRole,
        serviceRole,
        tables,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

async function checkRestTable({
  url,
  key,
  table,
  clientName,
}: {
  url: string
  key: string
  table: string
  clientName: string
}) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    const parsed = parseBody(body)
    const error = new Error(parsed.message || body || response.statusText) as Error & {
      client?: string
      code?: string
      details?: string
      hint?: string
      status?: number
      table?: string
    }

    error.client = clientName
    error.code = parsed.code
    error.details = parsed.details
    error.hint = parsed.hint
    error.status = response.status
    error.table = table
    throw error
  }

  return { status: response.status }
}

function classifyError(error: any) {
  const code = String(error?.code ?? '')
  const message = String(`${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`).toLowerCase()
  const status = Number(error?.status)

  if (String(error?.message ?? '').includes('no service_role')) return 'wrong_service_key'

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
  if (reason === 'wrong_service_key') return 'La clave administrativa configurada no es service_role.'
  if (reason === 'table_missing') return 'La conexion responde, pero faltan tablas del sistema.'
  if (reason === 'invalid_or_wrong_key') return 'La conexion no pudo autenticar las claves configuradas.'
  if (reason === 'permission_error') return 'La conexion responde, pero faltan permisos de lectura/escritura.'
  if (reason === 'network_error') return 'La conexion no respondio desde el servidor.'
  return 'La app tiene configuracion, pero no pudo leer la base.'
}

function nextStep(reason: string | null, detail: { table?: string; message?: string } | null) {
  if (reason === 'missing_service_key') return 'Configurar SUPABASE_SERVICE_ROLE_KEY en Vercel y redeployar.'
  if (reason === 'missing_admin_email') return 'Configurar ADMIN_EMAIL en Vercel y crear ese mismo usuario en Authentication > Users.'
  if (reason === 'wrong_service_key') return 'En Supabase Settings > API copia la key service_role/secret, no la anon/publishable, y redeploya.'
  if (reason === 'table_missing') return `Ejecutar el schema SQL principal. Falta o no se ve la tabla ${detail?.table ?? 'principal'}.`
  if (reason === 'invalid_or_wrong_key') return 'Revisar que las keys sean del mismo proyecto, sin comillas ni espacios, y redeployar.'
  if (reason === 'permission_error') return 'Ejecutar supabase/fix_api_access.sql para reparar grants, politicas y recargar el schema cache.'
  if (reason === 'network_error') return 'Revisar que el proyecto este activo y que la URL del proyecto sea correcta.'
  return detail?.message
    ? `Error REST detectado: ${detail.message}`
    : 'Abrir Supabase SQL Editor y ejecutar supabase/fix_api_access.sql; luego recargar /api/estado.'
}

function sanitize(value: unknown) {
  if (!value) return undefined
  return String(value)
    .replace(/eyJ[a-zA-Z0-9._-]+/g, '[token]')
    .replace(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/g, '[project-url]')
    .slice(0, 240)
}

function parseBody(body: string) {
  try {
    return JSON.parse(body)
  } catch {
    return { message: body }
  }
}

function normalizeErrorDetail(error: any) {
  return {
    client: sanitize(error?.client),
    code: sanitize(error?.code),
    status: Number(error?.status) || undefined,
    table: sanitize(error?.table),
    message: sanitize(error?.message ?? String(error)),
    details: sanitize(error?.details),
    hint: sanitize(error?.hint),
  }
}

function readKeyRole(key?: string) {
  if (!key) return 'missing'
  if (key.startsWith('sb_secret_')) return 'secret_key'
  if (key.startsWith('sb_publishable_')) return 'publishable_key'
  if (!key.startsWith('eyJ')) return 'unknown'

  try {
    const payload = key.split('.')[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return sanitize(decoded.role || 'unknown')
  } catch {
    return 'unknown'
  }
}
