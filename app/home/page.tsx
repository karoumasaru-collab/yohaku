'use client'

import { useState, useEffect, useCallback } from 'react'
import BottomNav from '@/components/BottomNav'
import PhraseCard from '@/components/PhraseCard'
import { Delivery, MoodTag } from '@/lib/types'

export default function HomePage() {
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [hasMood, setHasMood] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchDelivery = useCallback(async () => {
    const res = await fetch('/api/delivery/today')
    const data = await res.json()
    if (data.delivery) {
      setDelivery(data.delivery)
      setHasMood(!!data.delivery.mood_tag)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDelivery()
  }, [fetchDelivery])

  async function handleCreate() {
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/delivery/create', { method: 'POST' })
    const data = await res.json()
    if (data.delivery) {
      setDelivery(data.delivery)
      setHasMood(true) // 手動受け取りは気分選択をスキップ
    } else {
      setCreateError(data.error || 'エラーが発生しました')
    }
    setCreating(false)
  }

  async function handleMoodSelect(mood: MoodTag) {
    const res = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood_tag: mood,
        delivery_id: delivery?.id || null,
      }),
    })
    const data = await res.json()
    if (data.delivery) {
      setDelivery(data.delivery)
    }
    setHasMood(true)

    if (delivery?.id) {
      await fetch(`/api/delivery/${delivery.id}/read`, { method: 'POST' })
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">余白</h1>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="text-xs text-stone-400 border border-stone-200 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            {creating ? '...' : '今すぐ受け取る'}
          </button>
          {createError && <p className="text-xs text-red-400">{createError}</p>}
        </div>
      </header>

      <main className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-stone-300 text-sm">読み込み中...</div>
          </div>
        ) : (
          <PhraseCard
            key={delivery?.id ?? 'empty'}
            delivery={delivery}
            hasMood={hasMood}
            onMoodSelect={handleMoodSelect}
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
