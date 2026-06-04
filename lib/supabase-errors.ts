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
  const clientId = crypto.randomUUID()
  const email = input.email.trim().toLowerCase()

  const { error: insertError } = await supabaseAdmin
    .from('clients')
    .insert({
      id: clientId,
      nombre: input.nombre.trim(),
      email,
      telefono: input.telefono?.trim() || null,
    })

  if (!insertError) return clientId

  if (insertError?.code === '23505') {
    const { data: existingClient, error: lookupError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!lookupError && existingClient?.id) return existingClient.id as string
    logSupabaseError('clients.lookup', lookupError)
  } else {
    logSupabaseError('clients.insert', insertError)
  }

  throw new Error('No pudimos registrar tus datos. Escribenos por WhatsApp para terminar la solicitud.')
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
