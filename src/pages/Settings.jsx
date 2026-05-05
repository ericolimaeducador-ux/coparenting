import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Copy, Check, Users, AlertTriangle, CheckCircle, Trash2, Send, RefreshCw, Settings as SettingsIcon, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Spinner, Badge } from '@/components/ui/misc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { generateToken } from '@/lib/utils'
import { toast } from 'sonner'

export default function Settings() {
  const { userId, userDisplayName, userEmail, updatePassword } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [updatingPass, setUpdatingPass] = useState(false)
  const [acceptingInvite, setAcceptingInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const qc = useQueryClient()

  const { data: partnership, isLoading } = useQuery({
    queryKey: ['partnership', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await supabase
        .from('partnerships')
        .select('*')
        .or(`parent_1_id.eq.${userId},parent_2_id.eq.${userId}`)
        .maybeSingle()
      return data
    },
    enabled: !!userId,
  })

  // Handle invite token in URL
  useEffect(() => {
    const token = searchParams.get('invite')
    if (!token || !userId) return
    const acceptInvite = async () => {
      setAcceptingInvite(true)
      setInviteError('')
      try {
        const { data: acceptedPartnership, error: acceptError } = await supabase.rpc('accept_partnership_invite', {
          p_invite_token: token,
          p_parent_email: userEmail,
          p_parent_name: userDisplayName,
        })
        if (acceptError) throw acceptError
        toast.success('Parceria aceita com sucesso! Bem-vindo(a)!')
        qc.setQueryData(['partnership', userId], acceptedPartnership)
        qc.invalidateQueries({ queryKey: ['partnership'] })
        qc.invalidateQueries({ queryKey: ['children'] })
        setSearchParams({})
        return
      } catch (err) {
        const message = err.message === 'invalid_or_expired_invite'
          ? 'Convite invalido, expirado ou ja aceito.'
          : err.message
        setInviteError(message)
        toast.error('Erro ao aceitar convite: ' + message)
      } finally {
        setAcceptingInvite(false)
      }
    }
    acceptInvite()
  }, [searchParams, setSearchParams, userDisplayName, userEmail, userId, qc])

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const token = generateToken()
      const link = `${window.location.origin}${window.location.pathname}#/settings?invite=${token}`
      const { error } = await supabase.from('partnerships').insert({
        parent_1_id: userId,
        parent_1_email: userEmail,
        parent_1_name: userDisplayName,
        invite_token: token,
        status: 'pending',
      })
      if (error) throw error
      setInviteLink(link)
      toast.success('Parceria criada! Compartilhe o link com o co-responsável.')
      qc.invalidateQueries(['partnership'])
    } catch (err) {
      toast.error('Erro: ' + err.message)
    } finally {
      setInviting(false)
    }
  }

  const cancelPartnership = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('partnerships').delete().eq('id', partnership.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Parceria removida.')
      setInviteLink('')
      qc.invalidateQueries(['partnership'])
    },
    onError: (e) => toast.error(e.message),
  })

  const copyLink = () => {
    const link = inviteLink || (partnership?.invite_token
      ? `${window.location.origin}${window.location.pathname}#/settings?invite=${partnership.invite_token}`
      : '')
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Senha deve ter no mínimo 8 caracteres'); return }
    setUpdatingPass(true)
    const { error } = await updatePassword(newPassword)
    if (error) toast.error(error.message)
    else { toast.success('Senha atualizada!'); setNewPassword('') }
    setUpdatingPass(false)
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-slate-900">Configurações</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {userDisplayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-slate-900">{userDisplayName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={updatingPass}>
              {updatingPass ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Partnership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Parceria Coparental</CardTitle>
          <CardDescription>Vincule-se ao outro responsável para compartilhar informações.</CardDescription>
        </CardHeader>
        <CardContent>
          {acceptingInvite && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-4 flex items-center gap-3 text-sm text-blue-800">
              <Spinner size="sm" />
              Aceitando convite de parceria...
            </div>
          )}

          {inviteError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 mb-4 text-sm text-red-700">
              Nao foi possivel aceitar o convite: {inviteError}
            </div>
          )}

          {!partnership ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-muted-foreground">
                <p>💡 Crie uma parceria e compartilhe o link com o co-responsável pelos seus filhos. Após aceitar, vocês terão acesso compartilhado a todas as informações.</p>
              </div>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>E-mail do parceiro(a) <span className="text-xs text-muted-foreground">(informativo)</span></Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <Button type="submit" className="gap-2" disabled={inviting}>
                  <Send className="h-4 w-4" />
                  {inviting ? 'Criando...' : 'Gerar link de convite'}
                </Button>
              </form>

              {inviteLink && (
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-primary-900">Link de convite gerado!</p>
                  <p className="text-xs text-primary-700">Compartilhe este link com o co-responsável:</p>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="text-xs" />
                    <Button size="icon" variant="outline" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : partnership.status === 'pending' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 text-sm">Aguardando confirmação</p>
                  <p className="text-yellow-700 text-xs mt-1">O convite foi enviado. Compartilhe o link abaixo com o co-responsável.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}${window.location.pathname}#/settings?invite=${partnership.invite_token}`}
                  readOnly
                  className="text-xs"
                />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Cancelar e reenviar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                    <AlertDialogDescription>O link atual ficará inválido. Você precisará gerar um novo convite.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelPartnership.mutate()}>Cancelar convite</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 text-sm">Parceria ativa</p>
                  <p className="text-green-700 text-xs mt-1">Vocês têm acesso compartilhado a todas as informações.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {partnership.parent_1_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{partnership.parent_1_name || 'Responsável 1'}</p>
                    <p className="text-xs text-muted-foreground">{partnership.parent_1_email}</p>
                  </div>
                  {partnership.parent_1_id === userId && <Badge variant="default" className="ml-auto text-xs">Você</Badge>}
                </div>
                {partnership.parent_2_id && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-semibold text-sm">
                      {partnership.parent_2_name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{partnership.parent_2_name || 'Responsável 2'}</p>
                      <p className="text-xs text-muted-foreground">{partnership.parent_2_email}</p>
                    </div>
                    {partnership.parent_2_id === userId && <Badge variant="sage" className="ml-auto text-xs">Você</Badge>}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-muted-foreground">
                🔒 O acesso é compartilhado apenas entre vocês dois. Nenhum terceiro pode visualizar os dados.
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" /> Remover parceria
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover parceria?</AlertDialogTitle>
                    <AlertDialogDescription>Ao remover, vocês perderão o acesso compartilhado. Os dados das crianças serão mantidos.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelPartnership.mutate()}>Remover</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
