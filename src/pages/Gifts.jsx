import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Check, ExternalLink, Edit, Trash2, Gift } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, Spinner } from '@/components/ui/misc'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { SecureImage } from '@/components/shared/SecureFile'
import { formatCurrency } from '@/lib/utils'
import GiftForm from '@/components/gifts/GiftForm'
import { toast } from 'sonner'

const OCCASIONS = {
  birthday: { label: 'Aniversário', color: 'warm' },
  christmas: { label: 'Natal', color: 'destructive' },
  easter: { label: 'Páscoa', color: 'sage' },
  childrens_day: { label: 'Dia das Crianças', color: 'default' },
  other: { label: 'Outro', color: 'outline' },
}

const COLUMNS = [
  { status: 'suggested', label: 'Sugerido', color: 'bg-yellow-50 border-yellow-200' },
  { status: 'approved', label: 'Aprovado', color: 'bg-green-50 border-green-200' },
  { status: 'purchased', label: 'Comprado', color: 'bg-blue-50 border-blue-200' },
]

function GiftCard({ gift, onEdit, onDelete, onApprove, onMarkPurchased }) {
  const occasion = OCCASIONS[gift.occasion] || OCCASIONS.other
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 hover:shadow-sm transition-shadow">
      {gift.image_url && (
        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-50">
          <SecureImage src={gift.image_url} alt={gift.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm text-slate-900 leading-tight">{gift.title}</h3>
          <Badge variant={occasion.color} className="shrink-0 text-xs">{occasion.label}</Badge>
        </div>
        {gift.description && <p className="text-xs text-muted-foreground">{gift.description}</p>}
        {gift.price_estimate && (
          <p className="text-sm font-semibold text-slate-700">{formatCurrency(gift.price_estimate)}</p>
        )}
        {gift.children?.full_name && (
          <p className="text-xs text-muted-foreground">Para: <span className="font-medium">{gift.children.full_name}</span></p>
        )}
        {gift.suggested_by && (
          <p className="text-xs text-muted-foreground">Por: <span className="font-medium">{gift.suggested_by}</span></p>
        )}
      </div>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-50 flex-wrap">
        {gift.status === 'suggested' && (
          <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-200 hover:bg-green-50" onClick={() => onApprove(gift)}>
            <Check className="h-3.5 w-3.5" /> Aprovar
          </Button>
        )}
        {gift.status === 'approved' && (
          <Button size="sm" variant="outline" className="gap-1 text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => onMarkPurchased(gift)}>
            <Check className="h-3.5 w-3.5" /> Comprado
          </Button>
        )}
        {gift.link && (
          <a href={gift.link} target="_blank" rel="noopener noreferrer">
            <Button size="icon-sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
          </a>
        )}
        <Button size="icon-sm" variant="ghost" onClick={() => onEdit(gift)}><Edit className="h-3.5 w-3.5" /></Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir sugestão?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(gift.id)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default function Gifts() {
  const { userDisplayName } = useAuth()
  const { childIds, children, isLoading: pcLoading } = usePartnershipChildren()
  const [showForm, setShowForm] = useState(false)
  const [editGift, setEditGift] = useState(null)
  const qc = useQueryClient()

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ['gifts', childIds],
    queryFn: async () => {
      if (!childIds.length) return []
      const { data, error } = await supabase
        .from('gift_suggestions')
        .select('*, children(full_name)')
        .in('child_id', childIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !pcLoading && childIds.length > 0,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('gift_suggestions').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries(['gifts']),
    onError: (e) => toast.error(e.message),
  })

  const deleteGift = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('gift_suggestions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries(['gifts']); toast.success('Excluído!') },
    onError: (e) => toast.error(e.message),
  })

  return (
    <PartnershipGuard>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-slate-900">Presentes</h1>
          <Button onClick={() => { setEditGift(null); setShowForm(true) }} className="gap-2">
            <Plus className="h-4 w-4" /> Sugerir Presente
          </Button>
        </div>

        {(pcLoading || isLoading) ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(({ status, label, color }) => {
              const col = gifts.filter(g => g.status === status)
              return (
                <div key={status}>
                  <div className={`rounded-t-xl border-b-0 border p-3 flex items-center justify-between ${color}`}>
                    <h2 className="font-medium text-sm">{label}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">{col.length}</span>
                  </div>
                  <div className={`rounded-b-xl border border-t-0 p-3 space-y-3 min-h-[200px] ${color}`}>
                    {col.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">Nenhum item aqui.</p>
                    ) : (
                      col.map(gift => (
                        <GiftCard
                          key={gift.id}
                          gift={gift}
                          onEdit={setEditGift}
                          onDelete={(id) => deleteGift.mutate(id)}
                          onApprove={(g) => updateStatus.mutate({ id: g.id, status: 'approved' })}
                          onMarkPurchased={(g) => updateStatus.mutate({ id: g.id, status: 'purchased' })}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <GiftForm
          open={showForm}
          gift={editGift}
          childrenList={children}
          suggestedBy={userDisplayName}
          onClose={() => setShowForm(false)}
          onSaved={() => { qc.invalidateQueries(['gifts']); setShowForm(false) }}
        />
      )}
    </PartnershipGuard>
  )
}
