'use client'
import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

const DEMO_EMAIL = 'demo@cabanas.cl'
const DEMO_PASSWORD = '12345678'

function withTimeout<T>(promise: Promise<T>, ms = 12000) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ])
}

export default function AdminLoginForm() {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) {
      setError('Completa email y contraseña.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await withTimeout(
        getSupabaseBrowser().auth.signInWithPassword({ email, password })
      )
      if (authError) {
        setError('Credenciales incorrectas o acceso no disponible en este momento.')
        setLoading(false)
      } else {
        router.replace('/admin')
        router.refresh()
      }
    } catch {
      setError('El acceso no respondió. Revisa /api/estado y vuelve a intentar.')
      setLoading(false)
    }
  }

  function restoreDemoAccess() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-arena-100 bg-arena-50 p-3 text-xs text-volcan-600">
        Acceso demo precargado. Si se borra, puedes restaurarlo con el botón inferior.
      </div>
      <div>
        <label className="label-text">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="admin@cabanaspuertovaras.cl"
          className="input-field"
        />
      </div>
      <div>
        <label className="label-text">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="input-field"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle size={16} />{error}
        </div>
      )}
      <button onClick={handleLogin} disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
        {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Ingresando...</span> : 'Ingresar'}
      </button>
      <button type="button" onClick={restoreDemoAccess} className="btn-outline w-full text-sm">
        Restaurar acceso demo
      </button>
    </div>
  )
}
