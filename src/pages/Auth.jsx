import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/misc'
import { toast } from 'sonner'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/home'

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn({ email: form.email, password: form.password })
        if (error) throw error
        toast.success('Bem-vindo de volta!')
        navigate(redirect)
      } else if (mode === 'register') {
        if (!form.fullName.trim()) { toast.error('Informe seu nome completo'); return }
        const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName })
        if (error) throw error
        toast.success('Conta criada! Verifique seu e-mail para confirmar.')
        setMode('login')
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(form.email)
        if (error) throw error
        toast.success('E-mail de recuperação enviado!')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar com Google.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 mesh-bg">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="font-display text-xl font-bold">CoParent</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Juntos pelos filhos,<br />mesmo separados.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-sm">
            Centralize tudo que importa para a criação dos seus filhos em um só lugar, compartilhado e seguro.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '📅', text: 'Calendário compartilhado' },
              { emoji: '💰', text: 'Controle de despesas' },
              { emoji: '💬', text: 'Comunicação direta' },
              { emoji: '💉', text: 'Caderneta de vacinas' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <span>{f.emoji}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-primary-200 text-sm">
          © {new Date().getFullYear()} CoParent · Privado e seguro
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Heart className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-display font-bold text-slate-900">CoParent</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {mode === 'login' && 'Entrar na conta'}
                {mode === 'register' && 'Criar conta'}
                {mode === 'forgot' && 'Recuperar senha'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === 'login' && 'Bem-vindo de volta!'}
                {mode === 'register' && 'Crie sua conta gratuitamente.'}
                {mode === 'forgot' && 'Enviaremos um link para seu e-mail.'}
              </p>
            </div>

            {/* Google button */}
            {mode !== 'forgot' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 mb-4"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      className="pl-9"
                      value={form.fullName}
                      onChange={set('fullName')}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                      className="pl-9 pr-10"
                      value={form.password}
                      onChange={set('password')}
                      minLength={mode === 'register' ? 8 : undefined}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-xs text-primary-600 hover:underline"
                      onClick={() => setMode('forgot')}
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                {loading ? 'Aguarde...' : (
                  <>
                    {mode === 'login' && 'Entrar'}
                    {mode === 'register' && 'Criar conta'}
                    {mode === 'forgot' && 'Enviar link'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === 'login' && (
                <>
                  Não tem conta?{' '}
                  <button className="text-primary-600 font-medium hover:underline" onClick={() => setMode('register')}>
                    Cadastre-se grátis
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  Já tem conta?{' '}
                  <button className="text-primary-600 font-medium hover:underline" onClick={() => setMode('login')}>
                    Entrar
                  </button>
                </>
              )}
              {mode === 'forgot' && (
                <button className="text-primary-600 font-medium hover:underline" onClick={() => setMode('login')}>
                  Voltar ao login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
