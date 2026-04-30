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
  { value: 'appointment', label: 'Consulta' },
  { value: 'exam', label: 'Exame' },
  { value: 'measurement', label: 'Medicao' },
  { value: 'incident', label: 'Ocorrencia' },
  { value: 'vaccine', label: 'Vacina' },
]

const empty = {
  type: 'appointment',
  title: '',
  date: new Date().toISOString().split('T')[0],
  doctor_name: '',
  location: '',
  notes: '',
  attachment_url: '',
  height_cm: '',
  weight_kg: '',
  next_appointment: '',
}

export default function HealthRecordForm({ open, onClose, onSaved, childId }) {
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
      const path = `health/${userId}/${childId}/${Date.now()}.${ext}`
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
      const { error } = await supabase.from('health_records').insert({
        child_id: childId,
        type: form.type,
        title: form.title.trim(),
        date: form.date,
        doctor_name: form.doctor_name || null,
        location: form.location || null,
        notes: form.notes || null,
        attachment_url: form.attachment_url || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        next_appointment: form.next_appointment || null,
      })
      if (error) throw error
      toast.success('Registro de saude salvo.')
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
        <DialogHeader><DialogTitle>Novo registro de saude</DialogTitle></DialogHeader>
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
            <Input value={form.title} onChange={set('title')} placeholder="Ex: Consulta pediatrica, exame de sangue" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Medico</Label>
              <Input value={form.doctor_name} onChange={set('doctor_name')} />
            </div>
            <div className="space-y-1.5">
              <Label>Local</Label>
              <Input value={form.location} onChange={set('location')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Altura (cm)</Label>
              <Input type="number" value={form.height_cm} onChange={set('height_cm')} />
            </div>
            <div className="space-y-1.5">
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={form.weight_kg} onChange={set('weight_kg')} />
            </div>
            <div className="space-y-1.5">
              <Label>Proxima consulta</Label>
              <Input type="date" value={form.next_appointment} onChange={set('next_appointment')} />
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
