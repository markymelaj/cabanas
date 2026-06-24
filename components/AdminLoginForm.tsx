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
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function enterDemoPanel() {
    setDemoLoading(true)
    setError(null)
    document.cookie = 'alto_cauce_demo_admin=1; path=/; max-age=43200; SameSite=Lax'
    router.replace('/admin')
    router.refresh()
  }

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
      setError('El acceso no respondió. Puedes usar el acceso de prueba para revisar el panel.')
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
      <button onClick={enterDemoPanel} disabled={demoLoading} className="btn-primary w-full disabled:opacity-50">
        {demoLoading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Ingresando...</span> : 'Entrar al panel de prueba'}
      </button>

      <div className="flex items-center gap-3 text-xs text-volcan-400">
        <span className="h-px flex-1 bg-arena-100" />
        <span>o usar credenciales</span>
        <span className="h-px flex-1 bg-arena-100" />
      </div>

      <div>
        <label className="label-text">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="contacto@tudominio.cl"
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
      <button onClick={handleLogin} disabled={loading} className="btn-outline w-full disabled:opacity-50">
        {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Ingresando...</span> : 'Ingresar con credenciales'}
      </button>
      <button type="button" onClick={restoreDemoAccess} className="text-xs text-volcan-500 hover:text-lago-700 w-full text-center">
        Restaurar datos de acceso
      </button>
    </div>
  )
}
