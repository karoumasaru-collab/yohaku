'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TagPicker from '@/components/TagPicker'

export default function TagPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [suggested, setSuggested] = useState<string[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)

  useEffect(() => {
    const savedText = sessionStorage.getItem('phrase_text')
    if (!savedText) {
      router.push('/send')
      return
    }
    setText(savedText)

    // AIタグ提案
    setSuggestLoading(true)
    fetch('/api/tags/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: savedText }),
    })
      .then(r => r.json())
      .then(data => {
        setSuggested(data.tags || [])
        setSuggestLoading(false)
      })
      .catch(() => setSuggestLoading(false))
  }, [router])

  function handleNext() {
    if (tags.length === 0) return
    sessionStorage.setItem('phrase_tags', JSON.stringify(tags))
    router.push('/send/confirm')
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send/edit" className="text-stone-400 hover:text-stone-600">←</Link>
        <h1 className="text-base font-bold text-stone-700">タグを選ぶ</h1>
      </header>

      <main className="px-6 py-4 space-y-6">
        <div className="p-4 bg-stone-50 rounded-2xl">
          <p className="text-xs text-stone-400 mb-1">フレーズ</p>
          <p className="text-sm text-stone-600 leading-relaxed">&ldquo;{text}&rdquo;</p>
        </div>

        {suggestLoading && (
          <p className="text-xs text-stone-400">AIがタグを提案しています...</p>
        )}

        <TagPicker selected={tags} suggested={suggested} onChange={setTags} />

        <button
          onClick={handleNext}
          disabled={tags.length === 0}
          className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-40"
        >
          確認する →
        </button>
      </main>
    </div>
  )
}
