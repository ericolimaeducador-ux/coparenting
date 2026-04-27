import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Calendar, DollarSign, MessageCircle, Gift,
  Settings, LogOut, Menu, X, Heart, Baby
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/misc'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navItems = [
  { to: '/home', icon: Home, label: 'Início' },
  { to: '/calendar', icon: Calendar, label: 'Calendário' },
  { to: '/finances', icon: DollarSign, label: 'Finanças' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/gifts', icon: Gift, label: 'Presentes' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { userDisplayName, userEmail, userAvatar, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Até logo!')
    navigate('/')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 bg-white border-r border-slate-100 shadow-sm">
        <SidebarContent
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onSignOut={handleSignOut}
          onNavClick={closeMobile}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-semibold text-slate-900">CoParent</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="min-h-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ userDisplayName, userEmail, userAvatar, onSignOut, onNavClick }) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200">
          <Heart className="h-4.5 w-4.5 text-white fill-white" />
        </div>
        <div>
          <p className="font-display font-bold text-slate-900 leading-none">CoParent</p>
          <p className="text-xs text-muted-foreground mt-0.5">Juntos pelos filhos</p>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-slate-50 border border-slate-100">
        <Avatar src={userAvatar} name={userDisplayName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">{userDisplayName}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
