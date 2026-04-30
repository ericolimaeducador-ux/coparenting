import { useState } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const { userId } = useAuth()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `school/${userId}/${childId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      setForm(f => ({ ...f, attachment_url: publicUrl }))
      toast.success('Anexo enviado.')
    } catch (err) {
      toast.error('Erro ao enviar anexo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

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
            {form.attachment_url && <a href={form.attachment_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-600 hover:underline">Ver anexo enviado</a>}
            <Label className="cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} asChild>
                <span><Upload className="h-3.5 w-3.5" />{uploading ? 'Enviando...' : 'Enviar anexo'}</span>
              </Button>
            </Label>
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
