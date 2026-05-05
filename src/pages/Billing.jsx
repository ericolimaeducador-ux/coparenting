import { useQuery } from '@tanstack/react-query'
import { CreditCard, Lock, Users, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, Spinner } from '@/components/ui/misc'
import { formatCurrency } from '@/lib/utils'

const TOTAL_CENTS = 3000
const PAYER_CENTS = 1500

function statusInfo(status) {
  if (status === 'paid') return { label: 'Pago', variant: 'success', icon: CheckCircle }
  if (status === 'exempt') return { label: 'Isento', variant: 'sage', icon: CheckCircle }
  return { label: 'Pendente', variant: 'warning', icon: Clock }
}

function PaymentRow({ name, email, status, checkoutUrl, isCurrentUser }) {
  const info = statusInfo(status)
  const Icon = info.icon
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 truncate">{name || 'Responsavel'}</p>
          {isCurrentUser && <Badge variant="outline">Voce</Badge>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={info.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {info.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatCurrency(PAYER_CENTS / 100)} por mes</span>
        </div>
      </div>
      <Button
        type="button"
        variant={checkoutUrl ? 'default' : 'outline'}
        size="sm"
        className="gap-2"
        disabled={!checkoutUrl || status === 'paid'}
        onClick={() => checkoutUrl && window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
      >
        {status === 'paid' ? 'Em dia' : checkoutUrl ? 'Pagar minha parte' : 'Checkout em breve'}
        {checkoutUrl && status !== 'paid' && <ExternalLink className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

export default function Billing() {
  const { userId } = useAuth()
  const { partnership, isLoading: partnershipLoading } = usePartnershipChildren()

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ['partnership-billing', partnership?.id],
    queryFn: async () => {
      if (!partnership?.id) return null
      const { data, error } = await supabase
        .from('partnership_billing')
        .select('*')
        .eq('partnership_id', partnership.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!partnership?.id,
  })

  const parent1Status = billing?.parent_1_status || 'pending'
  const parent2Status = billing?.parent_2_status || 'pending'
  const bothPaid = ['paid', 'exempt'].includes(parent1Status) && ['paid', 'exempt'].includes(parent2Status)

  return (
    <PartnershipGuard>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Assinatura compartilhada</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A assinatura e dividida igualmente entre os dois responsaveis.
          </p>
        </div>

        {partnershipLoading || billingLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary-600" />
                  Plano Familia Compartilhada
                </CardTitle>
                <CardDescription>
                  Tudo permanece compartilhado entre o par: filhos, agenda, chat, financas, documentos e vacinas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-100 p-4">
                    <p className="text-xs text-muted-foreground">Valor total</p>
                    <p className="font-display text-2xl font-bold text-slate-900">{formatCurrency(TOTAL_CENTS / 100)}</p>
                    <p className="text-xs text-muted-foreground">por mes</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-4">
                    <p className="text-xs text-muted-foreground">Cada responsavel</p>
                    <p className="font-display text-2xl font-bold text-primary-700">{formatCurrency(PAYER_CENTS / 100)}</p>
                    <p className="text-xs text-muted-foreground">metade para cada um</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-4">
                    <p className="text-xs text-muted-foreground">Status do par</p>
                    <p className="font-display text-2xl font-bold text-slate-900">{bothPaid ? 'Ativo' : 'Preparado'}</p>
                    <p className="text-xs text-muted-foreground">cobranca ainda nao ativada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary-600" />
                  Pagamento dividido
                </CardTitle>
                <CardDescription>
                  Quando a monetizacao for ativada, cada responsavel tera sua propria cobranca de R$ 15,00.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <PaymentRow
                  name={partnership?.parent_1_name}
                  email={partnership?.parent_1_email}
                  status={parent1Status}
                  checkoutUrl={billing?.parent_1_checkout_url}
                  isCurrentUser={partnership?.parent_1_id === userId}
                />
                <PaymentRow
                  name={partnership?.parent_2_name}
                  email={partnership?.parent_2_email}
                  status={parent2Status}
                  checkoutUrl={billing?.parent_2_checkout_url}
                  isCurrentUser={partnership?.parent_2_id === userId}
                />
              </CardContent>
            </Card>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" />
                <p>
                  Nenhuma chave de pagamento fica no app. A etapa real deve ser feita por Edge Function no Supabase,
                  criando duas cobrancas de R$ 15,00 e salvando as URLs de checkout nesta tela.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </PartnershipGuard>
  )
}
