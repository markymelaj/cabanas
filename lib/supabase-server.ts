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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
let supabaseAdminClient: SupabaseClient | null = null

// Cliente con service_role para operaciones de servidor (bypass RLS)
export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const key = serviceRoleKey || supabaseAnonKey

    supabaseAdminClient = createClient(supabaseUrl, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  return supabaseAdminClient
}

// Cliente server-side con cookies (para auth del admin)
export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
