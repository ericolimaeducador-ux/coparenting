import { useState, useEffect } from 'react'
import { Plus, X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import { compressImageToThumbnail, createStorageReference, validateUploadFile } from '@/lib/uploads'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SecureImage } from '@/components/shared/SecureFile'
import { toast } from 'sonner'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const empty = {
  full_name: '', birth_date: '', photo_url: '',
  blood_type: '', allergies: [], medications: [],
  sus_number: '', health_insurance: '', health_insurance_number: '',
  school_name: '', school_grade: '', school_email: '',
  school_address: '', school_whatsapp: '', school_phone: '',
  height_cm: '', weight_kg: '',
  medical_history: '', emotional_notes: '', behavioral_notes: '',
  spiritual_notes: '', social_activities: '', cultural_activities: '',
  activities: [],
}

function TagInput({ label, values, onChange }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) { onChange([...values, v]); setInput('') }
  }
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={`Adicionar ${label.toLowerCase()}...`} />
        <Button type="button" variant="outline" size="icon" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map(v => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs px-2.5 py-1">
              {v}
              <button type="button" onClick={() => onChange(values.filter(x => x !== v))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChildForm({ open, onClose, onSaved, child }) {
  const { userId, userDisplayName } = useAuth()
  const { partnership, children } = usePartnershipChildren()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (child) {
      setForm({ ...empty, ...child, birth_date: child.birth_date || '', height_cm: child.height_cm || '', weight_kg: child.weight_kg || '' })
    } else {
      setForm(empty)
    }
  }, [child])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const invalid = validateUploadFile(file, 'image')
    if (invalid) { toast.error(invalid); return }
    setUploading(true)
    try {
      const thumbnail = await compressImageToThumbnail(file)
      const path = `children/${userId}/${Date.now()}.webp`
      const { error } = await supabase.storage.from('uploads').upload(path, thumbnail, {
        contentType: 'image/webp',
        upsert: true,
      })
      if (error) throw error
      setForm(f => ({ ...f, photo_url: createStorageReference(path) }))
      toast.success('Foto otimizada e enviada!')
    } catch (err) {
      toast.error('Erro ao enviar foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error('Nome é obrigatório'); return }
    if (!form.birth_date) { toast.error('Data de nascimento é obrigatória'); return }
    if (!child?.id && children.length >= 2) {
      toast.error('No beta cortesia, cada parceria pode cadastrar ate 2 filhos.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        parent_1_id: partnership?.parent_1_id || userId,
        parent_2_id: partnership?.parent_2_id || null,
      }
      if (child?.id) {
        const { error } = await supabase.from('children').update(payload).eq('id', child.id)
        if (error) throw error
        toast.success('Criança atualizada!')
      } else {
        const { error } = await supabase.from('children').insert(payload)
        if (error) throw error
        toast.success('Criança cadastrada!')
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{child ? 'Editar' : 'Cadastrar'} criança</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="health">Saúde</TabsTrigger>
              <TabsTrigger value="school">Escola</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-2">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                  {form.photo_url
                    ? <SecureImage src={form.photo_url} className="w-full h-full object-cover" alt="" />
                    : <span className="text-2xl font-bold text-slate-400">{form.full_name?.[0] || '?'}</span>
                  }
                </div>
                <div>
                  <Label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} asChild>
                      <span><Upload className="h-3.5 w-3.5" />{uploading ? 'Enviando...' : 'Enviar foto'}</span>
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input id="full_name" value={form.full_name} onChange={set('full_name')} required placeholder="Nome completo da criança" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birth_date">Data de nascimento *</Label>
                  <Input id="birth_date" type="date" value={form.birth_date} onChange={set('birth_date')} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo sanguíneo</Label>
                  <Select value={form.blood_type} onValueChange={setDirect('blood_type')}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <TagInput label="Alergias" values={form.allergies} onChange={setDirect('allergies')} />
              <TagInput label="Medicamentos em uso" values={form.medications} onChange={setDirect('medications')} />
            </TabsContent>

            <TabsContent value="health" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Altura (cm)</Label>
                  <Input type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="Ex: 120" />
                </div>
                <div className="space-y-1.5">
                  <Label>Peso (kg)</Label>
                  <Input type="number" step="0.1" value={form.weight_kg} onChange={set('weight_kg')} placeholder="Ex: 25.5" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cartão SUS</Label>
                  <Input value={form.sus_number} onChange={set('sus_number')} placeholder="Número do cartão SUS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Convênio</Label>
                  <Input value={form.health_insurance} onChange={set('health_insurance')} placeholder="Nome do convênio" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nº cartão do convênio</Label>
                  <Input value={form.health_insurance_number} onChange={set('health_insurance_number')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Histórico médico</Label>
                <Textarea value={form.medical_history} onChange={set('medical_history')} rows={4} placeholder="Cirurgias, internações, condições crônicas..." />
              </div>
            </TabsContent>

            <TabsContent value="school" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nome da escola</Label>
                  <Input value={form.school_name} onChange={set('school_name')} placeholder="Nome da instituição" />
                </div>
                <div className="space-y-1.5">
                  <Label>Série/Ano</Label>
                  <Input value={form.school_grade} onChange={set('school_grade')} placeholder="Ex: 3º ano EF" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail da escola</Label>
                  <Input type="email" value={form.school_email} onChange={set('school_email')} />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp da escola</Label>
                  <Input value={form.school_whatsapp} onChange={set('school_whatsapp')} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone da escola</Label>
                  <Input value={form.school_phone} onChange={set('school_phone')} placeholder="(11) 3333-3333" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Endereço da escola</Label>
                  <Input value={form.school_address} onChange={set('school_address')} />
                </div>
              </div>
              <TagInput label="Atividades extracurriculares" values={form.activities} onChange={setDirect('activities')} />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 pt-2">
              {[
                { key: 'emotional_notes', label: 'Notas emocionais', ph: 'Como a criança está emocionalmente...' },
                { key: 'behavioral_notes', label: 'Notas comportamentais', ph: 'Comportamentos a observar...' },
                { key: 'spiritual_notes', label: 'Notas espirituais', ph: 'Práticas, valores...' },
                { key: 'social_activities', label: 'Atividades sociais', ph: 'Amigos, grupos...' },
                { key: 'cultural_activities', label: 'Atividades culturais', ph: 'Música, arte, teatro...' },
              ].map(({ key, label, ph }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea value={form[key]} onChange={set(key)} rows={2} placeholder={ph} />
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
