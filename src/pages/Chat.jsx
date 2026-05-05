import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePartnershipChildren } from '@/hooks/usePartnershipChildren'
import PartnershipGuard from '@/components/shared/PartnershipGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Spinner } from '@/components/ui/misc'
import { formatRelative } from '@/lib/utils'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function DateDivider({ date }) {
  let label
  try {
    const d = parseISO(date)
    if (isToday(d)) label = 'Hoje'
    else if (isYesterday(d)) label = 'Ontem'
    else label = format(d, "d 'de' MMMM", { locale: ptBR })
  } catch { label = date }
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

export default function Chat() {
  const { userId, userDisplayName } = useAuth()
  const { partnership, parentIds, isLoading: pcLoading } = usePartnershipChildren()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const qc = useQueryClient()

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', partnership?.id],
    queryFn: async () => {
      if (!partnership?.id) return []
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('partnership_id', partnership.id)
        .order('created_at', { ascending: true })
        .limit(200)
      if (error) throw error
      await supabase.rpc('mark_partnership_messages_read', {
        p_partnership_id: partnership.id,
      })
      return data || []
    },
    enabled: !!partnership?.id && parentIds.length > 0,
    refetchInterval: 3000,
  })

  // Realtime subscription
  useEffect(() => {
    if (!partnership?.id) return
    const sub = supabase
      .channel(`chat-${partnership.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `partnership_id=eq.${partnership.id}`,
      }, () => {
        qc.invalidateQueries(['chat-messages'])
      })
      .subscribe()
    return () => sub.unsubscribe()
  }, [partnership?.id, qc])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setSending(true)
    try {
      const { error } = await supabase.from('chat_messages').insert({
        partnership_id: partnership.id,
        sender_id: userId,
        sender_name: userDisplayName,
        content: text.trim(),
        read: false,
      })
      if (error) throw error
      setText('')
      qc.invalidateQueries(['chat-messages'])
    } catch (err) {
      toast.error('Erro ao enviar: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = msg.created_at?.split('T')[0] || ''
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <PartnershipGuard>
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-slate-900">Chat com {partnership?.parent_1_id === userId ? (partnership?.parent_2_name || 'Parceiro(a)') : (partnership?.parent_1_name || 'Parceiro(a)')}</h1>
            <p className="text-xs text-muted-foreground">Mensagens privadas e seguras</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin">
          {isLoading || pcLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm">Nenhuma mensagem ainda.</p>
              <p className="text-muted-foreground text-xs mt-1">Inicie a conversa!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <DateDivider date={date} />
                {msgs.map((msg) => {
                  const isMe = msg.sender_id === userId
                  return (
                    <div key={msg.id} className={cn('flex items-end gap-2 mb-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      {!isMe && (
                        <Avatar name={msg.sender_name} size="xs" className="mb-1 shrink-0" />
                      )}
                      <div className={cn('max-w-[70%] group', isMe ? 'items-end' : 'items-start')}>
                        {!isMe && (
                          <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</p>
                        )}
                        <div className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
                        )}>
                          {msg.content}
                        </div>
                        <p className={cn('text-[10px] text-muted-foreground mt-1', isMe ? 'text-right mr-1' : 'ml-1')}>
                          {formatRelative(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1"
              disabled={sending}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </PartnershipGuard>
  )
}
