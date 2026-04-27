import { useLocation, Link } from 'react-router-dom'
import { AlertTriangle, Settings } from 'lucide-react'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import { Spinner } from '@/components/ui/misc'

export default function PartnershipGuard({ children }) {
  const { partnership, isLoading } = usePartnershipChildren()
  const location = useLocation()

  // Allow invite link to pass through to settings
  const hasInvite = new URLSearchParams(location.search).has('invite')
  if (hasInvite) return children

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-yellow-900 mb-2">
            Parceria não encontrada
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Você precisa de uma parceria ativa para acessar esta área. Convide o co-responsável pelos seus filhos.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Ir para Configurações
          </Link>
        </div>
      </div>
    )
  }

  return children
}
