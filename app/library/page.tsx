'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import { Phrase } from '@/lib/types'

export default function LibraryPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => {
        setPhrases(data.phrases || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">届けた言葉</h1>
      </header>

      <main className="px-6 py-2">
        {loading ? (
          <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
        ) : phrases.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-stone-400 text-sm">まだ届けた言葉がありません</p>
            <p className="text-xs text-stone-300">フレーズを投稿して届けましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {phrases.map(phrase => (
              <div
                key={phrase.id}
                className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm"
              >
                <p className="text-sm text-stone-700 leading-relaxed mb-3">
                  &ldquo;{phrase.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {phrase.book?.cover_url && (
                    <Image
                      src={phrase.book.cover_url}
                      alt={phrase.book.title}
                      width={32}
                      height={42}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 truncate">{phrase.book?.title}</p>
                  </div>
                  <div className="text-xs text-stone-300 shrink-0">
                    届: {phrase.delivered_count} / ✨: {phrase.hit_count}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {phrase.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-stone-50 text-stone-400 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
