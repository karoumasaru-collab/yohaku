import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // YYYY-MM-DD
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  const { data, error } = await supabase
    .from('deliveries')
    .select('*, phrase:phrases(*, book:books(*))')
    .eq('receiver_id', user.id)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deliveries: data || [] })
}
