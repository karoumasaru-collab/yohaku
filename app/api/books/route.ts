import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchBookByIsbn, searchBooksByQuery } from '@/lib/books'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const isbn = searchParams.get('isbn')
  const q = searchParams.get('q')

  // 書名・著者名検索
  if (q) {
    const books = await searchBooksByQuery(q)
    return NextResponse.json({ books })
  }

  if (!isbn) return NextResponse.json({ error: 'isbn or q required' }, { status: 400 })

  // DB既存チェック
  const { data: existing } = await supabase
    .from('books')
    .select()
    .eq('isbn', isbn)
    .single()

  if (existing) return NextResponse.json({ book: existing })

  // Google Books APIで取得
  const bookData = await fetchBookByIsbn(isbn)
  if (!bookData) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

  const { data: book, error } = await supabase
    .from('books')
    .insert(bookData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ book })
}
