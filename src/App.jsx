import { HashRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import { Spinner } from '@/components/ui/misc'

// Pages
import BetaWelcome from '@/pages/BetaWelcome'
import AuthPage from '@/pages/Auth'
import Home from '@/pages/Home'
import CalendarPage from '@/pages/Calendar'
import Finances from '@/pages/Finances'
import Chat from '@/pages/Chat'
import Gifts from '@/pages/Gifts'
import Settings from '@/pages/Settings'
import ChildProfile from '@/pages/ChildProfile'
import Vaccination from '@/pages/Vaccination'
import UpdatePassword from '@/pages/UpdatePassword'
import PageNotFound from '@/pages/PageNotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10000,
    },
  },
})

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="text-muted-foreground text-sm mt-3">Carregando...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace />
  }
  return children
}

function AuthRedirect() {
  const [searchParams] = useSearchParams()
  const invite = searchParams.get('invite')
  if (invite) return <Navigate to={`/settings?invite=${encodeURIComponent(invite)}`} replace />
  const redirect = searchParams.get('redirect') || '/home'
  return <Navigate to={redirect} replace />
}

// Layout wrapper for authenticated pages
function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<BetaWelcome />} />
      <Route path="/auth" element={isAuthenticated ? <AuthRedirect /> : <AuthPage />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* Protected with layout */}
      <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
      <Route path="/finances" element={<AppLayout><Finances /></AppLayout>} />
      <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
      <Route path="/gifts" element={<AppLayout><Gifts /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/child-profile" element={<AppLayout><ChildProfile /></AppLayout>} />
      <Route path="/vaccination" element={<AppLayout><Vaccination /></AppLayout>} />

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'DM Sans, system-ui, sans-serif' },
            }}
          />
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}
