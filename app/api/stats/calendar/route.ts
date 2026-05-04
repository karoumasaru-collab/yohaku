import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))

  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()

  const { data, error } = await supabase
    .from('deliveries')
    .select('created_at, is_hit, is_passed, status')
    .eq('receiver_id', user.id)
    .gte('created_at', start)
    .lt('created_at', end)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 日付ごとに集計
  const dayMap: Record<number, { received: number; hit: number; passed: number }> = {}
  for (const d of data || []) {
    const day = new Date(d.created_at).getDate()
    if (!dayMap[day]) dayMap[day] = { received: 0, hit: 0, passed: 0 }
    dayMap[day].received++
    if (d.is_hit) dayMap[day].hit++
    if (d.is_passed) dayMap[day].passed++
  }

  return NextResponse.json({ days: dayMap, year, month })
}
