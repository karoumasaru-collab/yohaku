import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'hit'   // 'hit' | 'all'
  const tag = searchParams.get('tag') || ''

  let query = supabase
    .from('deliveries')
    .select('*, phrase:phrases(*, book:books(*))')
    .eq('receiver_id', user.id)
    .eq('status', 'read')
    .order('created_at', { ascending: false })

  if (type === 'hit') {
    query = query.eq('is_hit', true)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // タグフィルター（クライアント側でも可能だがAPIでやる）
  const filtered = tag
    ? (data || []).filter(d => d.phrase?.tags?.includes(tag))
    : (data || [])

  // 全タグ一覧を集計
  const allTags: Record<string, number> = {}
  for (const d of data || []) {
    for (const t of d.phrase?.tags || []) {
      allTags[t] = (allTags[t] || 0) + 1
    }
  }

  return NextResponse.json({ deliveries: filtered, allTags })
}
