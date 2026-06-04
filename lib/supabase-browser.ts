import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseBrowserClient: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (!supabaseBrowserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Acceso no disponible en este momento.')
    }

    supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseBrowserClient
}
