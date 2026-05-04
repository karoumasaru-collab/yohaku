import { createClient } from './supabase/server'
import { Phrase } from './types'

export async function matchPhrase(
  receiverId: string,
  preferredTags: string[]
): Promise<Phrase | null> {
  const supabase = await createClient()

  const useRandom = Math.random() < 0.3

  if (useRandom) {
    const { data } = await supabase
      .from('phrases')
      .select('*, book:books(*)')
      .eq('status', 'active')
      .neq('sender_id', receiverId)
      .not('id', 'in', `(
        select phrase_id from deliveries where receiver_id = '${receiverId}'
      )`)
      .order('delivered_count', { ascending: true })
      .limit(10)

    if (!data || data.length === 0) return null
    return data[Math.floor(Math.random() * data.length)] as Phrase
  }

  if (preferredTags.length > 0) {
    const { data: tagMatched } = await supabase
      .from('phrases')
      .select('*, book:books(*)')
      .eq('status', 'active')
      .neq('sender_id', receiverId)
      .contains('tags', preferredTags.slice(0, 1))
      .order('delivered_count', { ascending: true })
      .limit(20)

    if (tagMatched && tagMatched.length > 0) {
      const undelivered = tagMatched.filter(async (p) => {
        const { data } = await supabase
          .from('deliveries')
          .select('id')
          .eq('phrase_id', p.id)
          .eq('receiver_id', receiverId)
          .single()
        return !data
      })

      if (undelivered.length > 0) {
        return undelivered[Math.floor(Math.random() * Math.min(undelivered.length, 5))] as Phrase
      }
    }
  }

  // フォールバック: ランダム
  const { data: fallback } = await supabase
    .from('phrases')
    .select('*, book:books(*)')
    .eq('status', 'active')
    .neq('sender_id', receiverId)
    .order('delivered_count', { ascending: true })
    .limit(10)

  if (!fallback || fallback.length === 0) return null
  return fallback[Math.floor(Math.random() * fallback.length)] as Phrase
}
