'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Book } from '@/lib/types'

export default function ConfirmPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [book, setBook] = useState<Book | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedText = sessionStorage.getItem('phrase_text')
    const savedBook = sessionStorage.getItem('phrase_book')
    const savedTags = sessionStorage.getItem('phrase_tags')

    if (!savedText || !savedBook || !savedTags) {
      router.push('/send')
      return
    }

    setText(savedText)
    setBook(JSON.parse(savedBook))
    setTags(JSON.parse(savedTags))
  }, [router])

  async function handleSubmit() {
    if (!book) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/phrases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        book_id: book.id,
        tags,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '投稿に失敗しました')
      setLoading(false)
      return
    }

    sessionStorage.removeItem('phrase_text')
    sessionStorage.removeItem('phrase_book')
    sessionStorage.removeItem('phrase_tags')
    sessionStorage.removeItem('ocr_text')

    router.push('/library')
  }

  if (!text || !book) return null

  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send/tag" className="text-stone-400 hover:text-stone-600">←</Link>
        <h1 className="text-base font-bold text-stone-700">投稿を確認する</h1>
      </header>

      <main className="px-6 py-4 space-y-6">
        <div className="bg-white border border-stone-100 rounded-3xl p-6 space-y-4 shadow-sm">
          <blockquote className="text-stone-700 text-sm leading-relaxed">
            &ldquo;{text}&rdquo;
          </blockquote>

          {book && (
            <div className="flex gap-3 pt-3 border-t border-stone-50">
              {book.cover_url && (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  width={36}
                  height={48}
                  className="rounded object-cover"
                />
              )}
              <div>
                <p className="text-xs font-semibold text-stone-600">{book.title}</p>
                <p className="text-xs text-stone-400">{book.author}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed text-center">
          このフレーズは誰かの余白に届けられます
        </p>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? '届けています...' : '届ける ✉️'}
        </button>
      </main>
    </div>
  )
}
