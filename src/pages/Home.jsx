import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, DollarSign, MessageCircle, Gift, User, School, Baby, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, Badge, Spinner } from '@/components/ui/misc'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { formatDate, formatCurrency, calculateAge } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ChildForm from '@/components/children/ChildForm'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function ChildCard({ child }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <Avatar src={child.photo_url} name={child.full_name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-slate-900 truncate">{child.full_name}</h3>
          <p className="text-sm text-muted-foreground">{calculateAge(child.birth_date)}</p>
          {child.school_name && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <School className="h-3 w-3" />
              <span className="truncate">{child.school_name}</span>
            </div>
          )}
          {child.allergies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {child.allergies.slice(0, 2).map((a) => (
                <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
              ))}
              {child.allergies.length > 2 && (
                <Badge variant="outline" className="text-xs">+{child.allergies.length - 2}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50">
        <Link to={`/child-profile?id=${child.id}`}>
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <User className="h-3.5 w-3.5" />
            Ver Perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}

function QuickStat({ icon: Icon, label, value, color }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="font-display text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { userDisplayName, userId } = useAuth()
  const { partnership, children, childIds, isLoading } = usePartnershipChildren()
  const [showChildForm, setShowChildForm] = useState(false)
  const qc = useQueryClient()
  const firstName = userDisplayName.split(' ')[0]
  const now = new Date()

  const { data: events = [] } = useQuery({
    queryKey: ['upcoming-events', childIds],
    queryFn: async () => {
      if (!childIds.length) return []
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .in('child_id', childIds)
        .gte('start_date', now.toISOString())
        .order('start_date')
        .limit(5)
      return data || []
    },
    enabled: childIds.length > 0,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['recent-expenses', childIds],
    queryFn: async () => {
      if (!childIds.length) return []
      const { data } = await supabase
        .from('expenses')
        .select('*, children(full_name)')
        .in('child_id', childIds)
        .order('date', { ascending: false })
        .limit(5)
      return data || []
    },
    enabled: childIds.length > 0,
  })

  const { data: stats } = useQuery({
    queryKey: ['home-stats', childIds, partnership?.id, userId],
    queryFn: async () => {
      if (!childIds.length) return {}
      const monthStart = startOfMonth(now).toISOString()
      const monthEnd = endOfMonth(now).toISOString()

      const [eventsRes, expensesRes, msgsRes, giftsRes] = await Promise.all([
        supabase.from('calendar_events').select('id', { count: 'exact', head: true })
          .in('child_id', childIds).gte('start_date', monthStart).lte('start_date', monthEnd),
        supabase.from('expenses').select('amount, type').in('child_id', childIds)
          .gte('date', monthStart.split('T')[0]).lte('date', monthEnd.split('T')[0]),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true })
          .eq('partnership_id', partnership.id).eq('read', false).neq('sender_id', userId),
        supabase.from('gift_suggestions').select('id', { count: 'exact', head: true })
          .in('child_id', childIds).eq('status', 'suggested'),
      ])

      const totalExpenses = (expensesRes.data || [])
        .filter(e => e.type === 'expense')
        .reduce((s, e) => s + (e.amount || 0), 0)

      return {
        eventCount: eventsRes.count || 0,
        expenseTotal: totalExpenses,
        unreadMessages: msgsRes.count || 0,
        pendingGifts: giftsRes.count || 0,
      }
    },
    enabled: childIds.length > 0 && !!partnership?.id && !!userId,
  })

  return (
    <PartnershipGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button onClick={() => setShowChildForm(true)} className="gap-2 hidden sm:flex">
            <Plus className="h-4 w-4" />
            Cadastrar Filho
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickStat icon={Calendar} label="Eventos do mês" value={stats?.eventCount ?? 0} color="bg-blue-50 text-blue-700 border-blue-100" />
              <QuickStat icon={DollarSign} label="Despesas do mês" value={formatCurrency(stats?.expenseTotal ?? 0)} color="bg-green-50 text-green-700 border-green-100" />
              <QuickStat icon={MessageCircle} label="Msgs não lidas" value={stats?.unreadMessages ?? 0} color="bg-purple-50 text-purple-700 border-purple-100" />
              <QuickStat icon={Gift} label="Presentes pend." value={stats?.pendingGifts ?? 0} color="bg-pink-50 text-pink-700 border-pink-100" />
            </div>

            {/* Children */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-slate-900">Crianças</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowChildForm(true)} className="gap-1 sm:hidden">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>
              {children.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <Baby className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-4">Nenhuma criança cadastrada ainda.</p>
                  <Button onClick={() => setShowChildForm(true)} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> Cadastrar primeiro filho
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {children.map((child) => <ChildCard key={child.id} child={child} />)}
                </div>
              )}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary-600" /> Próximos eventos
                  </CardTitle>
                  <Link to="/calendar">
                    <Button variant="ghost" size="sm" className="text-xs text-primary-600">Ver todos</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento próximo.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((ev) => (
                        <div key={ev.id} className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 shrink-0"
                            style={{ backgroundColor: ev.color || '#0e8fe7' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{ev.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{formatDate(ev.start_date, 'dd/MM HH:mm')}</span>
                              <CategoryBadge category={ev.category} type="event" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" /> Últimas movimentações
                  </CardTitle>
                  <Link to="/finances">
                    <Button variant="ghost" size="sm" className="text-xs text-primary-600">Ver todas</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação.</p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((exp) => (
                        <div key={exp.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${exp.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                            {exp.type === 'income'
                              ? <TrendingUp className="h-4 w-4 text-green-600" />
                              : <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{exp.description || exp.category}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{formatDate(exp.date)}</span>
                              <CategoryBadge category={exp.category} type="expense" />
                            </div>
                          </div>
                          <span className={`text-sm font-semibold shrink-0 ${exp.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {showChildForm && (
        <ChildForm
          open={showChildForm}
          onClose={() => setShowChildForm(false)}
          onSaved={() => { qc.invalidateQueries(['children']); setShowChildForm(false) }}
        />
      )}
    </PartnershipGuard>
  )
}
