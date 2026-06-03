import AdminLoginForm from '@/components/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-lago-950 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl card-shadow p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl text-lago-900 mb-1">
            Cabañas <span className="text-arena-600 italic">Puerto Varas</span>
          </p>
          <p className="text-xs text-volcán-500">Panel de administración</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
