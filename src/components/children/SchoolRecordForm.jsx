import { useState } from 'react'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SecureFileLink } from '@/components/shared/SecureFile'
import { toast } from 'sonner'

const TYPES = [
  { value: 'grade', label: 'Nota' },
  { value: 'absence', label: 'Falta' },
  { value: 'meeting', label: 'Reuniao' },
  { value: 'incident', label: 'Ocorrencia' },
  { value: 'trip', label: 'Passeio' },
  { value: 'achievement', label: 'Conquista' },
]

const empty = {
  type: 'grade',
  title: '',
  date: new Date().toISOString().split('T')[0],
  subject: '',
  grade: '',
  notes: '',
  attachment_url: '',
}

export default function SchoolRecordForm({ open, onClose, onSaved, childId }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Informe o titulo'); return }
    if (!form.date) { toast.error('Informe a data'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('school_records').insert({
        child_id: childId,
        type: form.type,
        title: form.title.trim(),
        date: form.date,
        subject: form.subject || null,
        grade: form.grade ? parseFloat(form.grade) : null,
        notes: form.notes || null,
        attachment_url: form.attachment_url || null,
      })
      if (error) throw error
      toast.success('Registro escolar salvo.')
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
        <DialogHeader><DialogTitle>Novo registro escolar</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={setDirect('type')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" value={form.date} onChange={set('date')} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Titulo *</Label>
            <Input value={form.title} onChange={set('title')} placeholder="Ex: Boletim, reuniao, ocorrencia" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Materia</Label>
              <Input value={form.subject} onChange={set('subject')} />
            </div>
            <div className="space-y-1.5">
              <Label>Nota</Label>
              <Input type="number" step="0.1" value={form.grade} onChange={set('grade')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observacoes</Label>
            <Textarea value={form.notes} onChange={set('notes')} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Anexo</Label>
            {form.attachment_url && <SecureFileLink href={form.attachment_url} className="block text-xs text-primary-600 hover:underline">Ver anexo enviado</SecureFileLink>}
            <div className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Upload de anexos fica desativado no beta cortesia.</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
