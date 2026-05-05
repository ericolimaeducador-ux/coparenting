import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/misc'
import AppLogo from '@/components/shared/AppLogo'
import { toast } from 'sonner'

export default function UpdatePassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Senha deve ter no minimo 8 caracteres')
      return
    }
    if (password !== confirm) {
      toast.error('As senhas nao conferem')
      return
    }

    setLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      toast.success('Senha atualizada. Entre novamente.')
      navigate('/auth', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full min-w-0" style={{ maxWidth: 'min(28rem, calc(100vw - 4rem))' }}>
        <AppLogo className="mb-8" markClassName="h-10 w-14" wordmarkClassName="text-base" />
        <div className="w-full max-w-full bg-white rounded-2xl border border-slate-100 shadow-lg p-6 sm:p-8 overflow-hidden">
          <h1 className="font-display text-2xl font-bold text-slate-900">Atualizar senha</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Defina uma nova senha para sua conta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? 'Atualizando...' : 'Salvar nova senha'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
