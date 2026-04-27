import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea, Label } from '@/components/ui/misc'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'school', label: 'Escola' },
  { value: 'health', label: 'Saúde' },
  { value: 'clothing', label: 'Vestuário' },
  { value: 'activities', label: 'Atividades' },
  { value: 'other', label: 'Outro' },
]

const empty = {
  type: 'expense', amount: '', category: 'other', description: '',
  date: new Date().toISOString().split('T')[0], receipt_url: '', paid_by: '', child_id: '',
}

export default function ExpenseForm({ open, onClose, onSaved, expense, childrenList = [], parents = [] }) {
  const { userId } = useAuth()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (expense) setForm({ ...empty, ...expense, amount: expense.amount?.toString() || '' })
    else setForm(empty)
  }, [expense])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setDirect = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `receipts/${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      setForm(f => ({ ...f, receipt_url: publicUrl }))
      toast.success('Comprovante enviado!')
    } catch (err) {
      toast.error('Erro: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(form.amount)) { toast.error('Valor inválido'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        child_id: form.child_id || null,
      }
      if (expense?.id) {
        const { error } = await supabase.from('expenses').update(payload).eq('id', expense.id)
        if (error) throw error
        toast.success('Atualizado!')
      } else {
        const { error } = await supabase.from('expenses').insert(payload)
        if (error) throw error
        toast.success('Registrado!')
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
          <DialogTitle>{expense ? 'Editar' : 'Nova'} movimentação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={form.type} onValueChange={setDirect('type')}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="expense">Despesa</TabsTrigger>
              <TabsTrigger value="income">Receita</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1.5">
            <Label>Valor (R$) *</Label>
            <Input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0,00" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Criança</Label>
              <Select value={form.child_id} onValueChange={setDirect('child_id')}>
                <SelectTrigger><SelectValue placeholder="Todos os filhos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os filhos</SelectItem>
                  {childrenList.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={setDirect('category')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div className="space-y-1.5">
              <Label>Pago por</Label>
              <Select value={form.paid_by} onValueChange={setDirect('paid_by')}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {parents.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={form.description} onChange={set('description')} placeholder="Descrição opcional" />
          </div>

          <div className="space-y-1.5">
            <Label>Comprovante</Label>
            {form.receipt_url && (
              <a href={form.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline block mb-1">
                Ver comprovante atual
              </a>
            )}
            <Label className="cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} />
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} asChild>
                <span><Upload className="h-3.5 w-3.5" />{uploading ? 'Enviando...' : 'Enviar comprovante'}</span>
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
