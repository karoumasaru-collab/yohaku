import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSenderNotificationText, sendPushNotification } from '@/lib/notifications'

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
    .update({ status: 'read', delivered_at: new Date().toISOString() })
    .eq('id', id)
    .eq('receiver_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 送り手への通知（システム投稿はsender_idがnullなのでスキップ）
  if (delivery && !delivery.notified_sender && delivery.sender_id) {
    const { data: sender } = await supabase
      .from('users')
      .select('push_token, push_enabled')
      .eq('id', delivery.sender_id)
      .single()

    if (sender?.push_enabled && sender.push_token) {
      const hour = new Date().getHours()
      const body = getSenderNotificationText(hour)
      await sendPushNotification(sender.push_token, '余白', body)

      await supabase
        .from('deliveries')
        .update({ notified_sender: true })
        .eq('id', id)
    }
  }

  return NextResponse.json({ success: true })
}
