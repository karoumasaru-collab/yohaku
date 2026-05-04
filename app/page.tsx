import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="max-w-sm w-full text-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-widest text-stone-700">余白</h1>
          <p className="text-stone-500 text-sm leading-relaxed tracking-wide">
            誰かの言葉が、<br />あなたの余白に届く
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full py-3 px-6 bg-stone-700 text-stone-50 rounded-full text-center text-sm tracking-widest hover:bg-stone-800 transition-colors"
          >
            はじめる
          </Link>
          <Link
            href="/signin"
            className="block w-full py-3 px-6 border border-stone-300 text-stone-600 rounded-full text-center text-sm tracking-widest hover:bg-stone-100 transition-colors"
          >
            ログイン
          </Link>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          本のフレーズを届け合う、<br />静かな交流のアプリ
        </p>
      </div>
    </main>
  )
}
