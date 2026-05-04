import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

export default function SendPage() {
  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-6">
        <h1 className="text-lg font-bold tracking-widest text-stone-600">届ける</h1>
      </header>

      <main className="px-6 py-8 space-y-6">
        <p className="text-sm text-stone-500 leading-relaxed">
          本のページを撮影して、<br />誰かに届けたいフレーズを切り抜きましょう
        </p>

        <div className="space-y-3">
          <Link
            href="/send/ocr"
            className="block w-full p-6 bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📷</div>
            <div className="font-semibold text-stone-700 text-sm">カメラで撮影する</div>
            <div className="text-xs text-stone-400 mt-1">本のページを写真に撮って文字を読み取ります</div>
          </Link>

          <Link
            href="/send/edit"
            className="block w-full p-6 bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-semibold text-stone-700 text-sm">テキストで入力する</div>
            <div className="text-xs text-stone-400 mt-1">フレーズを直接入力します</div>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
