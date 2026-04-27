import { Link } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 mesh-bg p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-8 w-8 fill-white text-white" />
        </div>
        <h1 className="font-display text-6xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="font-display text-xl font-semibold text-slate-700 mb-3">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/home">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  )
}
