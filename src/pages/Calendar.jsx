import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, MapPin, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/misc'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { formatDate } from '@/lib/utils'
import EventForm from '@/components/calendar/EventForm'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function CalendarGrid({ currentMonth, events, selectedDate, onSelectDate }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = []
  let day = calStart
  while (day <= calEnd) { days.push(day); day = addDays(day, 1) }

  const getEventsForDay = (d) => events.filter(ev => {
    try { return isSameDay(parseISO(ev.start_date), d) } catch { return false }
  })

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d)
          const isSelected = selectedDate && isSameDay(d, selectedDate)
          const isToday = isSameDay(d, new Date())
          const isCurrentMonth = isSameMonth(d, currentMonth)
          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className={cn(
                'relative flex flex-col items-center p-1 rounded-lg min-h-[52px] text-xs transition-colors hover:bg-slate-50',
                !isCurrentMonth && 'opacity-30',
                isSelected && 'bg-primary-50 ring-1 ring-primary-200',
                isToday && 'font-bold'
              )}
            >
              <span className={cn(
                'w-6 h-6 flex items-center justify-center rounded-full',
                isToday && 'bg-primary-600 text-white',
              )}>
                {format(d, 'd')}
              </span>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                {dayEvents.slice(0, 3).map((ev, j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ev.color || '#0e8fe7' }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const { childIds, children, isLoading: pcLoading } = usePartnershipChildren()
  const qc = useQueryClient()

  const { data: events = [], isLoading: evLoading } = useQuery({
    queryKey: ['calendar-events', childIds, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!childIds.length) return []
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*, children(full_name)')
        .in('child_id', childIds)
        .gte('start_date', startOfMonth(currentMonth).toISOString())
        .lte('start_date', endOfMonth(currentMonth).toISOString())
        .order('start_date')
      if (error) throw error
      return data || []
    },
    enabled: !pcLoading && childIds.length > 0,
  })

  const deleteEvent = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries(['calendar-events']); toast.success('Evento excluído') },
    onError: (e) => toast.error(e.message),
  })

  const selectedEvents = selectedDate
    ? events.filter(ev => { try { return isSameDay(parseISO(ev.start_date), selectedDate) } catch { return false } })
    : []

  return (
    <PartnershipGuard>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-slate-900">Calendário</h1>
          <Button onClick={() => { setEditEvent(null); setShowForm(true) }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Evento
          </Button>
        </div>

        {(pcLoading || evLoading) ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(new Date())}>
                      Hoje
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarGrid
                  currentMonth={currentMonth}
                  events={events}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </CardContent>
            </Card>

            {/* Day panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate
                    ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                    : 'Selecione um dia'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Clique em um dia para ver os eventos.</p>
                ) : selectedEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">Nenhum evento neste dia.</p>
                    <Button size="sm" variant="outline" onClick={() => { setEditEvent(null); setShowForm(true) }} className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Adicionar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ev.color || '#0e8fe7' }} />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-slate-900 truncate">{ev.title}</p>
                              <CategoryBadge category={ev.category} type="event" />
                              {!ev.all_day && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(ev.start_date, 'HH:mm')}
                                  {ev.end_date && ` – ${formatDate(ev.end_date, 'HH:mm')}`}
                                </div>
                              )}
                              {ev.location && (
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{ev.location}</span>
                                </div>
                              )}
                              {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon-sm" onClick={() => { setEditEvent(ev); setShowForm(true) }}>
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
                                  <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteEvent.mutate(ev.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showForm && (
        <EventForm
          open={showForm}
          event={editEvent}
          childrenList={children}
          defaultDate={selectedDate}
          onClose={() => setShowForm(false)}
          onSaved={() => { qc.invalidateQueries(['calendar-events']); setShowForm(false) }}
        />
      )}
    </PartnershipGuard>
  )
}
