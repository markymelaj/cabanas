import AdminLoginForm from '@/components/AdminLoginForm'
import { DEMO_CONFIG } from '@/lib/demo-config'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-lago-950 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl card-shadow p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl text-lago-900 mb-1">
            Alto Cauce <span className="text-arena-600 italic">Reservas</span>
          </p>
          <p className="text-xs text-volcan-500">Panel demo para dueño / recepción</p>
          <p className="text-[11px] text-volcan-400 mt-2">{DEMO_CONFIG.productName}</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
