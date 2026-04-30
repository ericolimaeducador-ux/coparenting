import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const OCCASIONS = [
  { value: 'birthday', label: 'Aniversário' },
  { value: 'christmas', label: 'Natal' },
  { value: 'easter', label: 'Páscoa' },
  { value: 'childrens_day', label: 'Dia das Crianças' },
  { value: 'other', label: 'Outro' },
]

const empty = { title: '', child_id: '', occasion: 'birthday', price_estimate: '', link: '', description: '', image_url: '' }

export default function GiftForm({ open, onClose, onSaved, gift, childrenList = [], suggestedBy }) {
  const { userId } = useAuth()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (gift) setForm({ ...empty, ...gift, price_estimate: gift.price_estimate?.toString() || '' })
    else setForm(empty)
  }, [gift])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `gifts/${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: publicUrl }))
      toast.success('Imagem enviada!')
    } catch (err) {
      toast.error('Erro: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.child_id) { toast.error('Selecione a crianca'); return }
    if (!form.title.trim()) { toast.error('Nome é obrigatório'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        price_estimate: form.price_estimate ? parseFloat(form.price_estimate) : null,
        child_id: form.child_id,
        suggested_by: suggestedBy,
        status: gift?.status || 'suggested',
      }
      if (gift?.id) {
        const { error } = await supabase.from('gift_suggestions').update(payload).eq('id', gift.id)
        if (error) throw error
        toast.success('Atualizado!')
      } else {
        const { error } = await supabase.from('gift_suggestions').insert(payload)
        if (error) throw error
        toast.success('Sugestão adicionada!')
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{gift ? 'Editar' : 'Sugerir'} Presente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do presente *</Label>
            <Input value={form.title} onChange={set('title')} placeholder="Ex: Lego Star Wars" required />
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
              <Label>Ocasião</Label>
              <Select value={form.occasion} onValueChange={setDirect('occasion')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Preço estimado (R$)</Label>
              <Input type="number" min="0" step="0.01" value={form.price_estimate} onChange={set('price_estimate')} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label>Link de compra</Label>
              <Input type="url" value={form.link} onChange={set('link')} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={set('description')} rows={2} placeholder="Detalhes, cor preferida, tamanho..." />
          </div>

          <div className="space-y-1.5">
            <Label>Imagem</Label>
            {form.image_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-50 mb-2">
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <Label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} asChild>
                <span><Upload className="h-3.5 w-3.5" />{uploading ? 'Enviando...' : 'Enviar imagem'}</span>
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
