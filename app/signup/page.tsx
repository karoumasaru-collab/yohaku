'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-widest text-stone-700">余白</h1>
          <p className="text-sm text-stone-400">アカウントを作成する</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 bg-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 bg-white"
              placeholder="6文字以上"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'はじめる'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400">
          アカウントをお持ちの方は{' '}
          <Link href="/signin" className="text-stone-600 underline">ログイン</Link>
        </p>
      </div>
    </main>
  )
}
