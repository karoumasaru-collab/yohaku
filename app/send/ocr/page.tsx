import OCRCapture from '@/components/OCRCapture'
import Link from 'next/link'

export default function OcrPage() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="text-stone-400 hover:text-stone-600">←</Link>
        <h1 className="text-base font-bold text-stone-700">ページを撮影する</h1>
      </header>

      <main className="px-6 py-4">
        <OCRCapture />
      </main>
    </div>
  )
}
