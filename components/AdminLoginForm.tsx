'use client'
import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    const { error: authError } = await getSupabaseBrowser().auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Credenciales incorrectas o variables de Supabase incompletas.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
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
    </div>
  )
}
