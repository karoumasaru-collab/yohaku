import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, book_id, page_number, tags, ai_tags, image_url } = await request.json()

  if (!text || !book_id || !tags) {
    return NextResponse.json({ error: 'text, book_id, tags required' }, { status: 400 })
  }

  if (text.length > 200) {
    return NextResponse.json({ error: 'フレーズは200字以内にしてください' }, { status: 400 })
  }

  if (tags.length === 0 || tags.length > 3) {
    return NextResponse.json({ error: 'タグは1〜3個選んでください' }, { status: 400 })
  }

  // 著作権対応: is_whitelisted の本のみ受け付ける
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('is_whitelisted')
    .eq('id', book_id)
    .single()

  if (bookError || !book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  if (!book.is_whitelisted) {
    return NextResponse.json(
      { error: 'この本はPhase 1では登録できません。青空文庫の作品をお使いください。' },
      { status: 403 }
    )
  }

  const { data: phrase, error } = await supabase
    .from('phrases')
    .insert({
      sender_id: user.id,
      book_id,
      text,
      page_number: page_number || null,
      tags,
      ai_tags: ai_tags || null,
      image_url: image_url || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ phrase }, { status: 201 })
}
