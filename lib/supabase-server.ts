import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type {
  Cabana,
  Client,
  Reservation,
  ReservationFull,
  SalonQuote,
} from './supabase'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let supabaseAdminClient: SupabaseClient | null = null

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

function assertSupabasePublicEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Cliente con service_role para operaciones de servidor. Si falta service_role se usa anon solo para mantener fallback público de demo.
export function getSupabaseAdmin() {
  assertSupabasePublicEnv()
  if (!supabaseAdminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const key = serviceRoleKey || supabaseAnonKey!

    if (!serviceRoleKey && process.env.NODE_ENV !== 'development') {
      console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY no configurada. Las escrituras admin pueden fallar.')
    }

    supabaseAdminClient = createClient(supabaseUrl!, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  return supabaseAdminClient
}

// Cliente server-side con cookies (para auth del admin)
export async function createServerSupabase() {
  assertSupabasePublicEnv()
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
