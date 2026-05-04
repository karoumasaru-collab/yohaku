'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Book } from '@/lib/types'

function isIsbn(s: string) {
  const digits = s.replace(/[-\s]/g, '')
  return /^\d{10}$/.test(digits) || /^\d{13}$/.test(digits)
}

export default function EditPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [book, setBook] = useState<Book | null>(null)
  const [results, setResults] = useState<Partial<Book>[]>([])
  const [loading, setLoading] = useState(false)
  const [bookError, setBookError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('ocr_text')
    if (saved) setText(saved)
  }, [])

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setBookError('')
    setResults([])
    setBook(null)

    if (isIsbn(q)) {
      const res = await fetch(`/api/books?isbn=${q.replace(/[-\s]/g, '')}`)
      if (!res.ok) {
        setBookError('書籍が見つかりませんでした')
      } else {
        const data = await res.json()
        setBook(data.book)
      }
    } else {
      const res = await fetch(`/api/books?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!data.books?.length) {
        setBookError('書籍が見つかりませんでした')
      } else {
        setResults(data.books)
      }
    }
    setLoading(false)
  }

  async function handleSelectResult(b: Partial<Book>) {
    setLoading(true)
    setResults([])
    // DBに保存
    const res = await fetch(`/api/books?isbn=${encodeURIComponent(b.isbn || '')}`)
    if (res.ok) {
      const data = await res.json()
      if (data.book) { setBook(data.book); setLoading(false); return }
    }
    // ISBNなしの場合は直接セット
    setBook(b as Book)
    setLoading(false)
  }

  function handleNext() {
    if (!text.trim() || !book) return
    sessionStorage.setItem('phrase_text', text)
    sessionStorage.setItem('phrase_book', JSON.stringify(book))
    router.push('/send/tag')
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="text-stone-400 hover:text-stone-600">←</Link>
        <h1 className="text-base font-bold text-stone-700">フレーズを確認する</h1>
      </header>

      <main className="px-6 py-4 space-y-6">
        <div>
          <label className="block text-xs text-stone-400 mb-2">フレーズ（最大200字）</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={200}
            rows={5}
            className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-stone-400 bg-white resize-none"
            placeholder="届けたい言葉を入力してください"
          />
          <p className="text-right text-xs text-stone-300 mt-1">{text.length}/200</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-stone-400">本を検索（書名・著者名・ISBN）</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 bg-white"
              placeholder="例：嫌われる勇気、岸見一郎、9784..."
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-3 bg-stone-700 text-stone-50 rounded-xl text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              検索
            </button>
          </div>
          {bookError && <p className="text-red-400 text-xs">{bookError}</p>}
        </div>

        {/* 検索結果リスト */}
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400">該当する本を選んでください</p>
            {results.map((b, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(b)}
                className="w-full flex gap-3 p-3 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors text-left"
              >
                {b.cover_url ? (
                  <Image src={b.cover_url} alt={b.title || ''} width={36} height={48} className="rounded object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-12 bg-stone-200 rounded shrink-0 flex items-center justify-center text-stone-400 text-xs">📖</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 font-medium leading-snug">{b.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{b.author}</p>
                  {b.publisher && <p className="text-xs text-stone-300">{b.publisher}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 選択済みの本 */}
        {book && (
          <div className="flex gap-3 p-4 bg-stone-50 rounded-2xl">
            {book.cover_url && (
              <Image src={book.cover_url} alt={book.title} width={48} height={64} className="rounded object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-700 text-sm">{book.title}</p>
              <p className="text-xs text-stone-400 mt-1">{book.author}</p>
            </div>
            <button onClick={() => { setBook(null); setQuery('') }} className="text-xs text-stone-300 hover:text-stone-500 self-start">✕</button>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!text.trim() || !book}
          className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-40"
        >
          タグを選ぶ →
        </button>
      </main>
    </div>
  )
}
