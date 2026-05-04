'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import { Delivery } from '@/lib/types'

type TabType = 'hit' | 'all'

export default function ShelfPage() {
  const [tab, setTab] = useState<TabType>('hit')
  const [selectedTag, setSelectedTag] = useState('')
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [allTags, setAllTags] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ type: tab })
    if (selectedTag) params.set('tag', selectedTag)
    const res = await fetch(`/api/shelf?${params}`)
    const data = await res.json()
    setDeliveries(data.deliveries || [])
    setAllTags(data.allTags || {})
    setLoading(false)
  }, [tab, selectedTag])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sortedTags = Object.entries(allTags).sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">ことばの棚</h1>
      </header>

      {/* タブ */}
      <div className="px-6 flex gap-2 mb-4">
        <button
          onClick={() => { setTab('hit'); setSelectedTag('') }}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            tab === 'hit'
              ? 'bg-stone-700 text-stone-50'
              : 'border border-stone-200 text-stone-500 hover:bg-stone-50'
          }`}
        >
          ✨ 刺さった
        </button>
        <button
          onClick={() => { setTab('all'); setSelectedTag('') }}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            tab === 'all'
              ? 'bg-stone-700 text-stone-50'
              : 'border border-stone-200 text-stone-500 hover:bg-stone-50'
          }`}
        >
          📖 届いた言葉
        </button>
      </div>

      {/* タグフィルター */}
      {sortedTags.length > 0 && (
        <div className="px-6 mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedTag === ''
                  ? 'bg-stone-600 text-stone-50'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              すべて
            </button>
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedTag === tag
                    ? 'bg-stone-600 text-stone-50'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {tag} {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* リスト */}
      <main className="px-6">
        {loading ? (
          <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-stone-400 text-sm">
              {tab === 'hit' ? 'まだ刺さった言葉がありません' : 'まだ届いた言葉がありません'}
            </p>
            <p className="text-xs text-stone-300">毎日の言葉と向き合ってみましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map(delivery => {
              const phrase = delivery.phrase
              const book = phrase?.book
              return (
                <div
                  key={delivery.id}
                  className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex gap-3">
                    {book?.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        width={40}
                        height={54}
                        className="rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-stone-100 rounded shrink-0 flex items-center justify-center text-stone-300 text-xs">
                        📖
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm text-stone-700 leading-relaxed">
                        &ldquo;{phrase?.text}&rdquo;
                      </p>
                      <p className="text-xs text-stone-400">
                        ── {book?.title}
                        {book?.author && ` / ${book.author}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {phrase?.tags?.map(tag => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                                selectedTag === tag
                                  ? 'bg-stone-600 text-stone-50'
                                  : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {delivery.is_hit && <span className="text-xs text-amber-400">✨</span>}
                          <span className="text-xs text-stone-300">
                            {new Date(delivery.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
