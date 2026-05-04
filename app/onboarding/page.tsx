'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const roles = [
  { value: 'sender', label: '届ける人', desc: '本のフレーズを送り届けます' },
  { value: 'receiver', label: '受け取る人', desc: '毎日一つの言葉を受け取ります' },
  { value: 'both', label: '両方', desc: '届けながら、受け取ります' },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'sender' | 'receiver' | 'both'>('both')
  const [notifyHour, setNotifyHour] = useState(7)
  const [loading, setLoading] = useState(false)

  async function handleComplete() {
    setLoading(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, notify_hour: notifyHour }),
    })
    router.push('/home')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-sm w-full space-y-8">
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-stone-700">あなたはどちらですか？</h2>
              <p className="text-sm text-stone-400">あとで変更できます</p>
            </div>
            <div className="space-y-3">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full p-4 rounded-2xl border text-left transition-colors ${
                    role === r.value
                      ? 'border-stone-700 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-stone-700 text-sm">{r.label}</div>
                  <div className="text-xs text-stone-400 mt-1">{r.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors"
            >
              次へ
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-stone-700">何時に届けますか？</h2>
              <p className="text-sm text-stone-400">毎日この時間に言葉が届きます</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setNotifyHour(h => Math.max(0, h - 1))}
                  className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  −
                </button>
                <span className="text-4xl font-bold text-stone-700 w-20 text-center">
                  {String(notifyHour).padStart(2, '0')}時
                </span>
                <button
                  onClick={() => setNotifyHour(h => Math.min(23, h + 1))}
                  className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  ＋
                </button>
              </div>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'はじめる'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
