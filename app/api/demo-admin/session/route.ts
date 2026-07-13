import { NextResponse } from 'next/server'

function demoAdminEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ADMIN_ENABLED === 'true' || process.env.DEMO_ADMIN_ENABLED === 'true'
}

export async function POST() {
  if (!demoAdminEnabled()) return NextResponse.json({ error: 'La demo pública no está habilitada.' }, { status: 404 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set('alto_cauce_demo_admin', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('alto_cauce_demo_admin', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
