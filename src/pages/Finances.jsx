import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, FileText, Edit, Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatDate, formatCurrency } from '@/lib/utils'
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import ExpenseForm from '@/components/finances/ExpenseForm'
import { toast } from 'sonner'

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: 'all', label: 'Todos' },
]

const CHART_COLORS = ['#0e8fe7', '#52a85a', '#e87d0e', '#9b59b6', '#e74c3c', '#16a085', '#f39c12', '#2c3e50']

function getDateRange(period) {
  const now = new Date()
  if (period === 'month') return { start: startOfMonth(now).toISOString().split('T')[0], end: endOfMonth(now).toISOString().split('T')[0] }
  if (period === 'last_month') { const lm = subMonths(now, 1); return { start: startOfMonth(lm).toISOString().split('T')[0], end: endOfMonth(lm).toISOString().split('T')[0] } }
  if (period === '3months') return { start: subMonths(now, 3).toISOString().split('T')[0], end: now.toISOString().split('T')[0] }
  return null
}

export default function Finances() {
  const [period, setPeriod] = useState('month')
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const { childIds, children, parentIds, partnership, isLoading: pcLoading } = usePartnershipChildren()
  const qc = useQueryClient()

  const dateRange = getDateRange(period)

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', childIds, period],
    queryFn: async () => {
      if (!childIds.length) return []
      let q = supabase.from('expenses').select('*, children(full_name)').in('child_id', childIds).order('date', { ascending: false })
      if (dateRange) { q = q.gte('date', dateRange.start).lte('date', dateRange.end) }
      const { data, error } = await q
      if (error) throw error
      return data || []
    },
    enabled: !pcLoading && childIds.length > 0,
  })

  const deleteExpense = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Removido!') },
    onError: (e) => toast.error(e.message),
  })

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0)
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount || 0), 0)
  const balance = totalIncome - totalExpense

  const chartData = Object.entries(
    expenses.filter(e => e.type === 'expense').reduce((acc, e) => {
      const cat = e.category || 'other'
      acc[cat] = (acc[cat] || 0) + (e.amount || 0)
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const parents = [
    { id: partnership?.parent_1_id, name: partnership?.parent_1_name || 'Responsável 1' },
    { id: partnership?.parent_2_id, name: partnership?.parent_2_name || 'Responsável 2' },
  ].filter(p => p.id)

  return (
    <PartnershipGuard>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-display text-2xl font-bold text-slate-900">Finanças</h1>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => { setEditExpense(null); setShowForm(true) }} className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>

        {(pcLoading || isLoading) ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-medium text-green-600">Receitas</p>
                <p className="font-display text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-medium text-red-600">Despesas</p>
                <p className="font-display text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalExpense)}</p>
              </div>
              <div className={`rounded-xl border p-4 ${balance >= 0 ? 'border-blue-100 bg-blue-50' : 'border-orange-100 bg-orange-50'}`}>
                <p className={`text-xs font-medium ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Saldo</p>
                <p className={`font-display text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCurrency(balance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="lg:col-span-2 space-y-2">
                {expenses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <p className="text-muted-foreground text-sm">Nenhuma movimentação no período.</p>
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 hover:shadow-sm transition-shadow">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${exp.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {exp.type === 'income'
                          ? <TrendingUp className="h-4 w-4 text-green-600" />
                          : <TrendingDown className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{exp.description || '—'}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <CategoryBadge category={exp.category} type="expense" />
                          <span className="text-xs text-muted-foreground">{formatDate(exp.date)}</span>
                          {exp.children?.full_name && <span className="text-xs text-muted-foreground">· {exp.children.full_name}</span>}
                          {exp.paid_by && <span className="text-xs text-muted-foreground">· pago por {exp.paid_by}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-semibold ${exp.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                        </span>
                        {exp.receipt_url && (
                          <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon-sm"><FileText className="h-3.5 w-3.5" /></Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => { setEditExpense(exp); setShowForm(true) }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteExpense.mutate(exp.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Despesas por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem dados suficientes.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend formatter={(v) => v} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <p className="text-center text-sm font-semibold text-red-600 mt-2">{formatCurrency(totalExpense)}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          open={showForm}
          expense={editExpense}
          childrenList={children}
          parents={parents}
          onClose={() => setShowForm(false)}
          onSaved={() => { qc.invalidateQueries(['expenses']); setShowForm(false) }}
        />
      )}
    </PartnershipGuard>
  )
}
