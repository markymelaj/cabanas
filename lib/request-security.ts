import { NextRequest, NextResponse } from 'next/server'

const buckets = new Map<string, { count: number; resetAt: number }>()
const CLEANUP_INTERVAL = 100
let calls = 0

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}

function cleanup(now: number) {
  calls += 1
  if (calls % CLEANUP_INTERVAL !== 0) return
  for (const [key, value] of Array.from(buckets.entries())) {
    if (value.resetAt <= now) buckets.delete(key)
  }
}

export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  options: { limit?: number; windowMs?: number } = {}
): NextResponse | null {
  const limit = options.limit ?? 6
  const windowMs = options.windowMs ?? 10 * 60 * 1000
  const now = Date.now()
  cleanup(now)

  const key = `${scope}:${clientIp(req)}`
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera unos minutos antes de volver a enviar.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  current.count += 1
  return null
}

export function looksAutomated(submittedAt?: number): boolean {
  if (!submittedAt) return false
  const elapsed = Date.now() - submittedAt
  return elapsed < 1200 || elapsed > 24 * 60 * 60 * 1000
}
