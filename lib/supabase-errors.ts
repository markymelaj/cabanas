import type { SupabaseClient } from '@supabase/supabase-js'

type ClientInput = {
  nombre: string
  email: string
  telefono?: string | null
}

type SupabaseErrorLike = {
  code?: string
  details?: string
  hint?: string
  message?: string
}

export function logSupabaseError(context: string, error: SupabaseErrorLike | null | undefined) {
  if (!error) return
  console.error(`[supabase:${context}]`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  })
}

export async function getOrCreateClientId(supabaseAdmin: SupabaseClient, input: ClientInput) {
  const email = input.email.trim().toLowerCase()

  const { data: existingClient, error: lookupError } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (lookupError) {
    logSupabaseError('clients.lookup', lookupError)
    throw new Error('No pudimos registrar tus datos. Escríbenos por WhatsApp para terminar la solicitud.')
  }

  if (existingClient?.id) return existingClient.id as string

  const { data: newClient, error: insertError } = await supabaseAdmin
    .from('clients')
    .insert({
      nombre: input.nombre.trim(),
      email,
      telefono: input.telefono?.trim() || null,
    })
    .select('id')
    .single()

  if (insertError || !newClient?.id) {
    logSupabaseError('clients.insert', insertError)
    throw new Error('No pudimos registrar tus datos. Escríbenos por WhatsApp para terminar la solicitud.')
  }

  return newClient.id as string
}

export function normalizeRpcDates(data: unknown, key: string) {
  if (!Array.isArray(data)) return []

  return data
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && key in item) {
        return String((item as Record<string, unknown>)[key])
      }
      return null
    })
    .filter((date): date is string => Boolean(date))
}
