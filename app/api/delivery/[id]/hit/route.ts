import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHitNotificationText, sendPushNotification } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: delivery, error } = await supabase
    .from('deliveries')
    .update({ is_hit: true, status: 'read', delivered_at: new Date().toISOString() })
    .eq('id', id)
    .eq('receiver_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (delivery) {
    // フレーズのレアリティ判定
    const { data: phrase } = await supabase
      .from('phrases')
      .select('hit_count, created_at')
      .eq('id', delivery.phrase_id)
      .single()

    let rarity = 'normal'
    if (phrase) {
      if (phrase.hit_count === 1) rarity = 'super_rare'
      else if (phrase.hit_count === 3) rarity = 'rare'
      else {
        const createdAt = new Date(phrase.created_at)
        const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff >= 30) rarity = 'milestone_30days'
      }
    }

    // 送り手への「刺さった」通知（システム投稿はスキップ）
    if (delivery.sender_id) {
      const { data: sender } = await supabase
        .from('users')
        .select('push_token, push_enabled')
        .eq('id', delivery.sender_id)
        .single()

      if (sender?.push_enabled && sender.push_token) {
        const body = getHitNotificationText(rarity)
        await sendPushNotification(sender.push_token, '余白 ✨', body)
      }
    }
  }

  return NextResponse.json({ success: true })
}
