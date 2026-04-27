import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function usePartnershipChildren() {
  const { userId } = useAuth()

  const { data: partnership, isLoading: partnershipLoading } = useQuery({
    queryKey: ['partnership', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .or(`parent_1_id.eq.${userId},parent_2_id.eq.${userId}`)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 30000,
  })

  const parentIds = partnership
    ? [partnership.parent_1_id, partnership.parent_2_id].filter(Boolean)
    : []

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children', partnership?.id],
    queryFn: async () => {
      if (!partnership) return []
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .or(`parent_1_id.eq.${parentIds[0]},parent_2_id.eq.${parentIds[0]},parent_1_id.eq.${parentIds[1]},parent_2_id.eq.${parentIds[1]}`)
        .order('full_name')
      if (error) throw error
      // Deduplicate
      const seen = new Set()
      return (data || []).filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
    },
    enabled: !!partnership && parentIds.length > 0,
    staleTime: 30000,
  })

  const childIds = children.map(c => c.id)
  const isLoading = partnershipLoading || childrenLoading

  return { partnership, children, childIds, parentIds, isLoading }
}
