import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { matchPhrase } from '@/lib/matching'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mood_tag, delivery_id } = await request.json()
  if (!mood_tag) return NextResponse.json({ error: 'mood_tag required' }, { status: 400 })

  // 気分タグに対応する優先タグを設定
  const moodToTags: Record<string, string[]> = {
    '静かにいたい': ['孤独', '哲学', '時間'],
    '何かを始めたい': ['挑戦', '仕事', '哲学'],
    '考えたいことがある': ['哲学', '時間', '死生観'],
    'なんとなく、任せる': [],
  }
  const preferredTags = moodToTags[mood_tag] || []

  if (delivery_id) {
    // 既存の配信を気分タグで更新
    await supabase
      .from('deliveries')
      .update({ mood_tag })
      .eq('id', delivery_id)
      .eq('receiver_id', user.id)

    return NextResponse.json({ success: true })
  }

  // 新しいフレーズをマッチングして配信作成
  const phrase = await matchPhrase(user.id, preferredTags)
  if (!phrase) return NextResponse.json({ error: 'No phrase available' }, { status: 404 })

  const { data: delivery, error } = await supabase
    .from('deliveries')
    .insert({
      phrase_id: phrase.id,
      receiver_id: user.id,
      sender_id: phrase.sender_id,
      mood_tag,
      status: 'delivered',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ delivery })
}
