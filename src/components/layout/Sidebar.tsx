import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, TrendingUp, CreditCard, Settings, Lock, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: false },
  { path: '/transfers', label: 'Transferencias', icon: ArrowLeftRight, locked: false },
  { path: '/investments', label: 'Investimentos', icon: TrendingUp, locked: true },
  { path: '/cards', label: 'Cartoes', icon: CreditCard, locked: true },
  { path: '/settings', label: 'Configuracoes', icon: Settings, locked: true },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <span className="text-xl font-bold text-foreground">FinanceApp</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          if (item.locked) {
            return (
              <div key={item.path} className="flex cursor-not-allowed items-center justify-between rounded-lg px-4 py-3 text-muted-foreground opacity-60">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Lock className="h-4 w-4" />
              </div>
            )
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                active ? 'bg-primary text-white' : 'text-secondary hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
            <span className="font-semibold text-foreground">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || 'Usuario'}</p>
            <p className="truncate text-xs text-secondary">{user?.email || 'user@email.com'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
