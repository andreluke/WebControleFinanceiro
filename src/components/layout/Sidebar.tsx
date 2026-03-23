import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Repeat, TrendingUp, CreditCard, Settings, Lock, LogOut, Target, PiggyBank, Bell, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/auth'
import { useUnreadCount } from '@/hooks/useNotifications'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: false },
  { path: '/transfers', label: 'Transferencias', icon: ArrowLeftRight, locked: false },
  { path: '/recurring', label: 'Recorrentes', icon: Repeat, locked: false },
  { path: '/goals', label: 'Metas', icon: PiggyBank, locked: false },
  { path: '/budgets', label: 'Orçamentos', icon: Target, locked: false },
  { path: '/notifications', label: 'Notificacoes', icon: Bell, locked: false, hasBadge: true },
  { path: '/investments', label: 'Investimentos', icon: TrendingUp, locked: true },
  { path: '/cards', label: 'Cartoes', icon: CreditCard, locked: true },
  { path: '/settings', label: 'Configuracoes', icon: Settings, locked: true },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { data: unreadData } = useUnreadCount()

  const unreadCount = unreadData?.count ?? 0

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } catch {
      // Ignore logout API errors
    }
    logout()
    navigate('/login')
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden z-40 fixed inset-0 bg-black/50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - fixed on desktop, drawer on mobile */}
<aside className={`
  fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar
  w-60 transition-transform duration-300 ease-in-out
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  md:translate-x-0 md:flex
`}>
        <div className="flex justify-between items-center p-4 md:p-6 border-border border-b">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-primary rounded-lg w-10 h-10">
              <span className="font-bold text-white text-xl">F</span>
            </div>
            <span className="font-bold text-foreground text-xl">FinanceApp</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="md:hidden hover:bg-muted p-2 rounded-md text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 min-h-0 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            if (item.locked) {
              return (
                <div key={item.path} className="flex justify-between items-center opacity-60 px-4 py-3 rounded-lg text-muted-foreground cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Lock className="w-4 h-4" />
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  active ? 'bg-primary text-white' : 'text-secondary hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.hasBadge && unreadCount > 0 && (
                    <span className="-top-1.5 -right-1.5 absolute flex justify-center items-center bg-danger rounded-full w-4 h-4 font-medium text-[10px] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

          <div className="p-4 border-border border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex justify-center items-center bg-muted rounded-full w-10 h-10 overflow-hidden">
                <span className="font-semibold text-foreground">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{user?.name || 'Usuario'}</p>
              <p className="text-secondary text-xs truncate">{user?.email || 'user@email.com'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-md w-full text-secondary hover:text-foreground text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="md:hidden hover:bg-muted p-2 rounded-md text-secondary"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}