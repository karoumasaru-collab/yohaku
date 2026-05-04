'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import DeliveryCalendar from '@/components/DeliveryCalendar'
import { UserStats } from '@/lib/types'

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">記録</h1>
      </header>

      <main className="px-6 py-2 space-y-4">
        {loading ? (
          <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
        ) : !stats ? (
          <div className="text-center py-16 text-stone-400 text-sm">統計がありません</div>
        ) : (
          <>
            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-stone-600">届けた記録</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-700">{stats.total_books_sent}</p>
                  <p className="text-xs text-stone-400 mt-1">冊</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-700">{stats.total_sent}</p>
                  <p className="text-xs text-stone-400 mt-1">フレーズ</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-700">{stats.total_hit}</p>
                  <p className="text-xs text-stone-400 mt-1">✨刺さった</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-stone-600">受け取った記録</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-700">{stats.total_received}</p>
                  <p className="text-xs text-stone-400 mt-1">受け取った</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-700">{stats.total_hit_received}</p>
                  <p className="text-xs text-stone-400 mt-1">✨刺さった</p>
                </div>
              </div>

              {stats.top_tags && Object.keys(stats.top_tags).length > 0 && (
                <div className="pt-3 border-t border-stone-50">
                  <p className="text-xs text-stone-400 mb-3">よく届くテーマ</p>
                  <div className="space-y-2">
                    {Object.entries(stats.top_tags)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([tag, count]) => (
                        <div key={tag} className="flex items-center gap-2">
                          <span className="text-xs text-stone-600 w-12">{tag}</span>
                          <div className="flex-1 bg-stone-100 rounded-full h-2">
                            <div
                              className="bg-stone-400 rounded-full h-2"
                              style={{
                                width: `${Math.min(100, (count / Math.max(...Object.values(stats.top_tags!))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-stone-300">{count}回</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <DeliveryCalendar />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
