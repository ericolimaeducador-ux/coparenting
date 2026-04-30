import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'custody', label: 'Custódia' },
  { value: 'medical', label: 'Médico' },
  { value: 'vaccine', label: 'Vacina' },
  { value: 'school', label: 'Escola' },
  { value: 'activity', label: 'Atividade' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'birthday', label: 'Aniversário' },
  { value: 'holiday', label: 'Feriado' },
  { value: 'vacation', label: 'Férias' },
  { value: 'other', label: 'Outro' },
]

const COLORS = ['#0e8fe7', '#52a85a', '#e87d0e', '#9b59b6', '#e74c3c', '#16a085', '#f39c12', '#2c3e50']

const empty = (date) => ({
  title: '', child_id: '', category: 'other', color: '#0e8fe7',
  all_day: false, start_date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '',
  end_date: '', location: '', description: '', recurring: false, recurring_pattern: '',
})

export default function EventForm({ open, onClose, onSaved, event, childrenList = [], defaultDate }) {
  const [form, setForm] = useState(empty(defaultDate))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({
        ...empty(defaultDate),
        ...event,
        start_date: event.start_date ? format(new Date(event.start_date), "yyyy-MM-dd'T'HH:mm") : '',
        end_date: event.end_date ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm") : '',
      })
    } else {
      setForm(empty(defaultDate))
    }
  }, [event, defaultDate])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.child_id) { toast.error('Selecione a crianca'); return }
    if (!form.title.trim()) { toast.error('Título é obrigatório'); return }
    if (!form.start_date) { toast.error('Data de início é obrigatória'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        child_id: form.child_id,
      }
      if (event?.id) {
        const { error } = await supabase.from('calendar_events').update(payload).eq('id', event.id)
        if (error) throw error
        toast.success('Evento atualizado!')
      } else {
        const { error } = await supabase.from('calendar_events').insert(payload)
        if (error) throw error
        toast.success('Evento criado!')
      }
      onSaved?.()
    } catch (err) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar' : 'Novo'} Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={form.title} onChange={set('title')} placeholder="Título do evento" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Criança</Label>
              <Select value={form.child_id} onValueChange={setDirect('child_id')}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {childrenList.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={setDirect('category')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setDirect('color')(c)}
                />
              ))}
            </div>
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-3">
            <Switch checked={form.all_day} onCheckedChange={setDirect('all_day')} id="all_day" />
            <Label htmlFor="all_day">Dia inteiro</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Início *</Label>
              <Input type={form.all_day ? 'date' : 'datetime-local'} value={form.start_date} onChange={set('start_date')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Término</Label>
              <Input type={form.all_day ? 'date' : 'datetime-local'} value={form.end_date} onChange={set('end_date')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Local</Label>
            <Input value={form.location} onChange={set('location')} placeholder="Endereço ou nome do local" />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={set('description')} rows={2} placeholder="Detalhes adicionais..." />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.recurring} onCheckedChange={setDirect('recurring')} id="recurring" />
            <Label htmlFor="recurring">Evento recorrente</Label>
          </div>

          {form.recurring && (
            <div className="space-y-1.5">
              <Label>Padrão</Label>
              <Select value={form.recurring_pattern} onValueChange={setDirect('recurring_pattern')}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quinzenal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
