import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppLogo from '@/components/shared/AppLogo'

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 mesh-bg p-6">
      <div className="text-center max-w-md animate-fade-in">
        <AppLogo className="justify-center mx-auto mb-6" markClassName="h-16 w-16" wordmarkClassName="text-xl" />
        <h1 className="font-display text-6xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="font-display text-xl font-semibold text-slate-700 mb-3">Pagina nao encontrada</h2>
        <p className="text-muted-foreground mb-8">
          A pagina que voce esta procurando nao existe ou foi movida.
        </p>
        <Link to="/home">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
