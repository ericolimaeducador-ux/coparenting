import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createStorageReference, safeFileExtension, validateUploadFile } from '@/lib/uploads'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SecureFileLink } from '@/components/shared/SecureFile'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const empty = {
  vaccine_catalog_id: '',
  vaccine_name: '',
  dose_label: '',
  applied_date: new Date().toISOString().split('T')[0],
  applied_location: '',
  lot_number: '',
  attachment_url: '',
  notes: '',
}

export default function VaccinationForm({ open, onClose, onSaved, childId, vaccine, catalog = [] }) {
  const { userId } = useAuth()
  const [form, setForm] = useState(empty)
  const [manual, setManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (vaccine) {
      setForm(f => ({
        ...empty,
        vaccine_catalog_id: vaccine.id || '',
        vaccine_name: vaccine.vaccine_name || '',
        dose_label: vaccine.dose_label || '',
      }))
      setManual(false)
    } else {
      setForm(empty)
    }
  }, [vaccine])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleCatalogSelect = (id) => {
    const v = catalog.find(c => c.id === id)
    if (v) {
      setForm(f => ({
        ...f,
        vaccine_catalog_id: v.id,
        vaccine_name: v.vaccine_name,
        dose_label: v.dose_label,
      }))
    }
  }

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const invalid = validateUploadFile(file, 'document')
    if (invalid) { toast.error(invalid); return }
    setUploading(true)
    try {
      const ext = safeFileExtension(file)
      const path = `vaccinations/${userId}/${childId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
      if (error) throw error
      setForm(f => ({ ...f, attachment_url: createStorageReference(path) }))
      toast.success('Anexo enviado.')
    } catch (err) {
      toast.error('Erro ao enviar anexo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vaccine_name.trim()) { toast.error('Nome da vacina é obrigatório'); return }
    if (!form.dose_label.trim()) { toast.error('Dose é obrigatória'); return }
    if (!form.applied_date) { toast.error('Data de aplicação é obrigatória'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('child_vaccinations').insert({
        child_id: childId,
        vaccine_catalog_id: form.vaccine_catalog_id || null,
        vaccine_name: form.vaccine_name,
        dose_label: form.dose_label,
        applied_date: form.applied_date,
        applied_location: form.applied_location || null,
        lot_number: form.lot_number || null,
        attachment_url: form.attachment_url || null,
        notes: form.notes || null,
      })
      if (error) throw error
      toast.success('Vacina registrada!')
      onSaved?.()
    } catch (err) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Vacina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={manual} onCheckedChange={setManual} id="manual" />
            <Label htmlFor="manual">Cadastro manual</Label>
          </div>

          {!manual ? (
            <div className="space-y-1.5">
              <Label>Vacina do calendário</Label>
              <Select value={form.vaccine_catalog_id} onValueChange={handleCatalogSelect}>
                <SelectTrigger><SelectValue placeholder="Selecionar vacina" /></SelectTrigger>
                <SelectContent>
                  {catalog.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.vaccine_name} — {v.dose_label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Nome da vacina *</Label>
                <Input value={form.vaccine_name} onChange={set('vaccine_name')} placeholder="Ex: Influenza" required />
              </div>
              <div className="space-y-1.5">
                <Label>Dose *</Label>
                <Input value={form.dose_label} onChange={set('dose_label')} placeholder="Ex: 1ª dose" required />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Data de aplicação *</Label>
            <Input type="date" value={form.applied_date} onChange={set('applied_date')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Local de aplicação</Label>
              <Input value={form.applied_location} onChange={set('applied_location')} placeholder="Ex: UBS Central" />
            </div>
            <div className="space-y-1.5">
              <Label>Número do lote</Label>
              <Input value={form.lot_number} onChange={set('lot_number')} placeholder="Ex: ABC123" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Reações, observações..." />
          </div>

          <div className="space-y-1.5">
            <Label>Anexo da vacina</Label>
            {form.attachment_url && (
              <SecureFileLink href={form.attachment_url} className="block text-xs text-primary-600 hover:underline">
                Ver anexo enviado
              </SecureFileLink>
            )}
            <Label className="cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAttachmentUpload} />
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} asChild>
                <span><Upload className="h-3.5 w-3.5" />{uploading ? 'Enviando...' : 'Enviar anexo'}</span>
              </Button>
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Registrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
