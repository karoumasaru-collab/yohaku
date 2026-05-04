'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OcrBlock {
  text: string
  confidence: number
  bounding_box: object
}

export default function OCRCapture() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || '文字の読み取りに失敗しました')
        setLoading(false)
        return
      }

      const data = await res.json()
      const blocks: OcrBlock[] = data.blocks || []
      const fullText = blocks.map(b => b.text).join('')

      sessionStorage.setItem('ocr_text', fullText)
      sessionStorage.setItem('ocr_image', data.imageDataUrl || '')
      router.push('/send/ocr/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : '文字の読み取りに失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center cursor-pointer hover:border-stone-400 transition-colors"
      >
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm text-stone-500">タップして写真を選ぶ</p>
        <p className="text-xs text-stone-300 mt-1">または撮影する</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {loading && (
        <div className="text-center space-y-2">
          <div className="text-sm text-stone-400">読み取っています...</div>
          <div className="text-xs text-stone-300">少しお待ちください</div>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  )
}
