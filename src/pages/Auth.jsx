import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/misc'
import AppLogo from '@/components/shared/AppLogo'
import { generateToken } from '@/lib/utils'
import { toast } from 'sonner'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite') || ''
  const redirect = searchParams.get('redirect') || '/home'
  const isInviteFlow = !!inviteToken
  const requestedMode = searchParams.get('mode')

  const [mode, setMode] = useState(isInviteFlow || requestedMode === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', partnerEmail: '' })
  const { signIn, signUp, signInWithGoogle, resetPassword, userDisplayName } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const acceptInvite = async ({ email, fullName }) => {
    const { error } = await supabase.rpc('accept_partnership_invite', {
      p_invite_token: inviteToken,
      p_parent_email: email.trim().toLowerCase(),
      p_parent_name: fullName || userDisplayName || email.split('@')[0],
    })
    if (error) throw error
  }

  const createPendingPartnership = async ({ userId, email, fullName, partnerEmail }) => {
    const token = generateToken()
    const { error } = await supabase.from('partnerships').insert({
      parent_1_id: userId,
      parent_1_email: email.trim().toLowerCase(),
      parent_1_name: fullName,
      parent_2_email: partnerEmail.trim().toLowerCase(),
      invite_token: token,
      status: 'pending',
    })
    if (error) throw error
    return token
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await signIn({ email: form.email, password: form.password })
        if (error) throw error

        if (inviteToken) {
          const fullName = data?.user?.user_metadata?.full_name || data?.user?.user_metadata?.name || userDisplayName
          await acceptInvite({ email: form.email, fullName })
          toast.success('Parceria aceita com sucesso.')
          navigate('/home')
          return
        }

        toast.success('Bem-vindo de volta.')
        navigate(redirect)
        return
      }

      if (mode === 'register') {
        if (!form.fullName.trim()) {
          toast.error('Informe seu nome completo')
          return
        }
        if (!isInviteFlow && !form.partnerEmail.trim()) {
          toast.error('Informe o e-mail do outro responsavel')
          return
        }

        const { data, error } = await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        })
        if (error) throw error

        if (isInviteFlow) {
          await acceptInvite({ email: form.email, fullName: form.fullName })
          toast.success('Conta criada e parceria vinculada.')
          navigate('/home')
          return
        }

        if (data?.user?.id) {
          const token = await createPendingPartnership({
            userId: data.user.id,
            email: form.email,
            fullName: form.fullName,
            partnerEmail: form.partnerEmail,
          })
          toast.success('Conta criada. Convite de parceria gerado.')
          navigate(`/settings?createdInvite=${encodeURIComponent(token)}`)
          return
        }

        toast.success('Conta criada. Confirme seu e-mail e entre para concluir o convite.')
        setMode('login')
        return
      }

      if (mode === 'forgot') {
        const { error } = await resetPassword(form.email)
        if (error) throw error
        toast.success('E-mail de recuperacao enviado.')
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
      const googleRedirect = inviteToken ? `/settings?invite=${inviteToken}` : redirect
      const { error } = await signInWithGoogle(googleRedirect)
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar com Google.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 mesh-bg">
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
          <AppLogo markClassName="h-12 w-16" wordmarkClassName="text-white text-xl" />
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Juntos pelos filhos,<br />mesmo separados.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-sm">
            Cadastre-se, convide o outro responsavel e comece a compartilhar tudo em um ambiente privado.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { text: 'Calendario compartilhado' },
              { text: 'Controle de despesas' },
              { text: 'Comunicacao direta' },
              { text: 'Caderneta de vacinas' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-primary-200 text-sm">
          © {new Date().getFullYear()} CoParent · Privado e seguro
        </p>
      </div>

      <div className="flex-1 min-w-0 w-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full min-w-0 animate-fade-in" style={{ maxWidth: 'min(28rem, calc(100vw - 4rem))' }}>
          <AppLogo className="mb-8 lg:hidden" markClassName="h-10 w-14" wordmarkClassName="text-base" />

          <div className="w-full max-w-full bg-white rounded-2xl border border-slate-100 shadow-lg p-6 sm:p-8 overflow-hidden">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {mode === 'login' && (isInviteFlow ? 'Entrar e vincular' : 'Entrar na conta')}
                {mode === 'register' && (isInviteFlow ? 'Criar conta vinculada' : 'Criar conta')}
                {mode === 'forgot' && 'Recuperar senha'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === 'login' && (isInviteFlow ? 'Use o e-mail convidado para aceitar a parceria.' : 'Bem-vindo de volta.')}
                {mode === 'register' && (isInviteFlow ? 'O link sera usado para parear sua conta automaticamente.' : 'Informe tambem o e-mail do outro responsavel.')}
                {mode === 'forgot' && 'Enviaremos um link para seu e-mail.'}
              </p>
            </div>

            {mode !== 'forgot' && (
              <>
                {isInviteFlow && (
                  <div className="rounded-xl border border-primary-100 bg-primary-50 p-3 text-sm text-primary-800 mb-4">
                    Convite de parceria detectado. Cadastre-se ou entre com o e-mail convidado.
                  </div>
                )}

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
                <>
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

                  {!isInviteFlow && (
                    <div className="space-y-1.5">
                      <Label htmlFor="partnerEmail">E-mail do outro responsavel</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="partnerEmail"
                          type="email"
                          placeholder="mae-ou-pai@email.com"
                          className="pl-9"
                          value={form.partnerEmail}
                          onChange={set('partnerEmail')}
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
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
                      placeholder={mode === 'register' ? 'Minimo 8 caracteres' : '********'}
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
                    {mode === 'login' && (isInviteFlow ? 'Entrar e vincular' : 'Entrar')}
                    {mode === 'register' && (isInviteFlow ? 'Criar conta e vincular' : 'Criar conta e gerar convite')}
                    {mode === 'forgot' && 'Enviar link'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === 'login' && (
                <>
                  Nao tem conta?{' '}
                  <button className="text-primary-600 font-medium hover:underline" onClick={() => setMode('register')}>
                    Cadastre-se gratis
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  Ja tem conta?{' '}
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
