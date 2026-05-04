import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // アクティブなフレーズを取得（自分投稿除く・システム投稿NULLは含む）
  const { data: phrases } = await supabase
    .from('phrases')
    .select('*, book:books(*)')
    .eq('status', 'active')
    .or(`sender_id.neq.${user.id},sender_id.is.null`)
    .order('delivered_count', { ascending: true })
    .limit(20)

  if (!phrases || phrases.length === 0) {
    return NextResponse.json({ error: 'No phrases available' }, { status: 404 })
  }

  // まだ届いていないものを優先
  const { data: delivered } = await supabase
    .from('deliveries')
    .select('phrase_id')
    .eq('receiver_id', user.id)

  const deliveredIds = new Set((delivered || []).map((d: { phrase_id: string }) => d.phrase_id))
  const undelivered = phrases.filter(p => !deliveredIds.has(p.id))
  const pool = undelivered.length > 0 ? undelivered : phrases

  const phrase = pool[Math.floor(Math.random() * Math.min(pool.length, 5))]

  const { data: delivery, error } = await supabase
    .from('deliveries')
    .insert({
      phrase_id: phrase.id,
      receiver_id: user.id,
      sender_id: phrase.sender_id,
      status: 'delivered',
    })
    .select(`*, phrase:phrases(*, book:books(*))`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ delivery })
}
