import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CheckCircle, Clock, AlertTriangle, XCircle, Syringe, Trash2, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge, Spinner } from '@/components/ui/misc'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { formatDate, calculateAge } from '@/lib/utils'
import { differenceInMonths, differenceInDays, parseISO, addMonths, addDays } from 'date-fns'
import VaccinationForm from '@/components/vaccination/VaccinationForm'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getVaccineStatus(vaccine, appliedVaccines, childBirthDate) {
  const applied = appliedVaccines.filter(v =>
    v.vaccine_catalog_id === vaccine.id ||
    v.vaccine_name === vaccine.vaccine_name
  )
  if (applied.length > 0) return { status: 'completed', applied }

  if (!childBirthDate) return { status: 'upcoming', applied: [] }

  const now = new Date()
  const birthDate = typeof childBirthDate === 'string' ? parseISO(childBirthDate) : childBirthDate
  const ageInMonths = differenceInMonths(now, birthDate)

  const windowStart = vaccine.window_start_months ?? (vaccine.window_start_days ? vaccine.window_start_days / 30 : 0)
  const windowEnd = vaccine.window_end_months ?? (vaccine.window_end_days ? vaccine.window_end_days / 30 : null)
  const maxAge = vaccine.max_age_months

  if (maxAge && ageInMonths > maxAge) return { status: 'window_missed', applied: [] }
  if (windowEnd && ageInMonths > windowEnd) return { status: 'overdue', applied: [] }
  if (ageInMonths >= windowStart) {
    const daysUntilEnd = windowEnd ? differenceInDays(addMonths(birthDate, windowEnd), now) : 999
    if (daysUntilEnd <= 30) return { status: 'due_soon', applied: [] }
    return { status: 'upcoming', applied: [] }
  }
  return { status: 'upcoming', applied: [] }
}

const STATUS_CONFIG = {
  completed: { label: 'Aplicada', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', badge: 'success' },
  due_soon: { label: 'Próxima', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', badge: 'warning' },
  overdue: { label: 'Atrasada', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: 'destructive' },
  window_missed: { label: 'Janela perdida', icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', badge: 'secondary' },
  upcoming: { label: 'Futura', icon: Syringe, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', badge: 'default' },
}

function VaccineDoseCard({ vaccine, status, applied, onRegister, onDelete }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming
  const Icon = cfg.icon
  return (
    <div className={cn('rounded-xl border p-4 transition-shadow hover:shadow-sm', cfg.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', `bg-white`)}>
            <Icon className={cn('h-4.5 w-4.5', cfg.color)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-slate-900">{vaccine.vaccine_name}</p>
              <Badge variant={cfg.badge} className="text-xs">{vaccine.dose_label}</Badge>
              <Badge variant={cfg.badge} className="text-xs">{cfg.label}</Badge>
            </div>
            {vaccine.notes && <p className="text-xs text-muted-foreground mt-0.5">{vaccine.notes}</p>}
            {applied.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {applied.map((a, i) => (
                  <p key={i} className="text-xs text-green-700">
                    Aplicada em {formatDate(a.applied_date)}
                    {a.applied_location && ` · ${a.applied_location}`}
                    {a.lot_number && ` · Lote: ${a.lot_number}`}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {status !== 'completed' && status !== 'window_missed' && (
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onRegister(vaccine)}>
              <Plus className="h-3 w-3" /> Registrar
            </Button>
          )}
          {applied.length > 0 && applied.map((a) => (
            <AlertDialog key={a.id}>
              <AlertDialogTrigger asChild>
                <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                  <AlertDialogDescription>O registro de vacinação será removido permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(a.id)}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Vaccination() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState(null)

  const { data: child } = useQuery({
    queryKey: ['child', id],
    queryFn: async () => {
      const { data } = await supabase.from('children').select('*').eq('id', id).single()
      return data
    },
    enabled: !!id,
  })

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: ['vaccine-catalog'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vaccine_catalog')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      return data || []
    },
  })

  const { data: applied = [], isLoading: appliedLoading } = useQuery({
    queryKey: ['child-vaccinations', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('child_vaccinations')
        .select('*')
        .eq('child_id', id)
        .order('applied_date', { ascending: false })
      return data || []
    },
    enabled: !!id,
  })

  const deleteVaccination = useMutation({
    mutationFn: async (vacId) => {
      const { error } = await supabase.from('child_vaccinations').delete().eq('id', vacId)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries(['child-vaccinations']); toast.success('Registro removido.') },
    onError: (e) => toast.error(e.message),
  })

  const isLoading = catalogLoading || appliedLoading

  const vaccinesWithStatus = catalog.map(v => ({
    ...v,
    ...getVaccineStatus(v, applied, child?.birth_date),
  }))

  const pending = vaccinesWithStatus.filter(v => ['overdue', 'due_soon', 'upcoming'].includes(v.status))
  const completed = vaccinesWithStatus.filter(v => v.status === 'completed')
  const overdue = vaccinesWithStatus.filter(v => v.status === 'overdue')
  const dueSoon = vaccinesWithStatus.filter(v => v.status === 'due_soon')

  const handleRegister = (vaccine) => {
    setSelectedVaccine(vaccine)
    setShowForm(true)
  }

  if (!id) return <div className="text-center py-12 text-muted-foreground">ID da criança não informado.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Vacinação {child ? `· ${child.full_name}` : ''}
          </h1>
          {child && <p className="text-muted-foreground text-sm">{calculateAge(child.birth_date)}</p>}
        </div>
        <Button onClick={() => { setSelectedVaccine(null); setShowForm(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar Vacina
        </Button>
      </div>

      {/* Summary */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
            <p className="font-display text-2xl font-bold text-green-700">{completed.length}</p>
            <p className="text-xs text-green-600">Aplicadas</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
            <p className="font-display text-2xl font-bold text-red-700">{overdue.length}</p>
            <p className="text-xs text-red-600">Atrasadas</p>
          </div>
          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3 text-center">
            <p className="font-display text-2xl font-bold text-yellow-700">{dueSoon.length}</p>
            <p className="text-xs text-yellow-600">Próximas</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-center">
            <p className="font-display text-2xl font-bold text-blue-700">{catalog.length}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">Pendentes ({pending.length})</TabsTrigger>
            <TabsTrigger value="history">Histórico ({applied.length})</TabsTrigger>
            <TabsTrigger value="all">Calendário ({catalog.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-2 mt-4">
            {pending.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Tudo em dia!</p>
                <p className="text-muted-foreground text-sm">Nenhuma vacina pendente no momento.</p>
              </div>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">⚠️ Atrasadas</p>
                    <div className="space-y-2">
                      {overdue.map(v => (
                        <VaccineDoseCard key={v.id} vaccine={v} status={v.status} applied={v.applied} onRegister={handleRegister} onDelete={(id) => deleteVaccination.mutate(id)} />
                      ))}
                    </div>
                  </div>
                )}
                {dueSoon.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-yellow-600 mb-2 uppercase tracking-wide">📅 Próximas (30 dias)</p>
                    <div className="space-y-2">
                      {dueSoon.map(v => (
                        <VaccineDoseCard key={v.id} vaccine={v} status={v.status} applied={v.applied} onRegister={handleRegister} onDelete={(id) => deleteVaccination.mutate(id)} />
                      ))}
                    </div>
                  </div>
                )}
                {pending.filter(v => v.status === 'upcoming').length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">🔜 Futuras</p>
                    <div className="space-y-2">
                      {pending.filter(v => v.status === 'upcoming').map(v => (
                        <VaccineDoseCard key={v.id} vaccine={v} status={v.status} applied={v.applied} onRegister={handleRegister} onDelete={(id) => deleteVaccination.mutate(id)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2 mt-4">
            {applied.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">Nenhuma vacina registrada ainda.</p>
            ) : (
              applied.map(v => (
                <div key={v.id} className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{v.vaccine_name}</p>
                    <p className="text-xs text-muted-foreground">{v.dose_label} · Aplicada em {formatDate(v.applied_date)}</p>
                    {v.applied_location && <p className="text-xs text-muted-foreground">Local: {v.applied_location}</p>}
                    {v.lot_number && <p className="text-xs text-muted-foreground">Lote: {v.lot_number}</p>}
                    {v.notes && <p className="text-xs text-slate-600 mt-1">{v.notes}</p>}
                    {v.attachment_url && (
                      <a href={v.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1">
                        <Download className="h-3 w-3" /> Ver anexo
                      </a>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteVaccination.mutate(v.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-2 mt-4">
            {vaccinesWithStatus.map(v => (
              <VaccineDoseCard key={v.id} vaccine={v} status={v.status} applied={v.applied} onRegister={handleRegister} onDelete={(id) => deleteVaccination.mutate(id)} />
            ))}
          </TabsContent>
        </Tabs>
      )}

      {showForm && (
        <VaccinationForm
          open={showForm}
          childId={id}
          vaccine={selectedVaccine}
          catalog={catalog}
          onClose={() => setShowForm(false)}
          onSaved={() => { qc.invalidateQueries(['child-vaccinations']); setShowForm(false) }}
        />
      )}
    </div>
  )
}
