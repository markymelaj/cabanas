import type { User } from '@supabase/supabase-js'

export function getConfiguredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || ''
}

export function isConfiguredAdmin(user: User | null | undefined) {
  const email = user?.email?.trim().toLowerCase()
  const configuredEmail = getConfiguredAdminEmail()

  if (!email) return false
  if (!configuredEmail) return true

  return email === configuredEmail
}
