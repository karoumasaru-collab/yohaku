'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [notifyHour, setNotifyHour] = useState(7)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [role, setRole] = useState('both')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notify_hour: notifyHour, push_enabled: pushEnabled, role }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">設定</h1>
      </header>

      <main className="px-6 py-2 space-y-6">
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs text-stone-500 mb-2">通知時間</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNotifyHour(h => Math.max(0, h - 1))}
                className="w-9 h-9 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                −
              </button>
              <span className="text-2xl font-bold text-stone-700">
                {String(notifyHour).padStart(2, '0')}:00
              </span>
              <button
                onClick={() => setNotifyHour(h => Math.min(23, h + 1))}
                className="w-9 h-9 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                ＋
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Push通知</span>
            <button
              onClick={() => setPushEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${
                pushEnabled ? 'bg-stone-700' : 'bg-stone-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  pushEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs text-stone-500 mb-2">役割</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-700 bg-white"
            >
              <option value="both">届ける＆受け取る</option>
              <option value="sender">届けるだけ</option>
              <option value="receiver">受け取るだけ</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors"
        >
          {saved ? '保存しました ✓' : '保存する'}
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-3 border border-stone-200 text-stone-500 rounded-full text-sm hover:bg-stone-50 transition-colors"
        >
          ログアウト
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
