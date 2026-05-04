'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function OcrReviewPage() {
  const router = useRouter()
  const [image, setImage] = useState<string>('')
  const [rotation, setRotation] = useState(0)
  const [text, setText] = useState('')
  const [reOcring, setReOcring] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const savedImage = sessionStorage.getItem('ocr_image')
    const savedText = sessionStorage.getItem('ocr_text')
    if (!savedText && !savedImage) {
      router.push('/send/ocr')
      return
    }
    setImage(savedImage || '')
    setText(savedText || '')
  }, [router])

  function handleNext() {
    sessionStorage.setItem('ocr_text', text)
    router.push('/send/edit')
  }

  function handleUseSelection() {
    const ta = textareaRef.current
    if (!ta) return
    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim()
    if (selected) setText(selected)
  }

  // canvasで画像を回転してbase64を返す
  const rotateImageAndGetBase64 = useCallback((src: string, deg: number): Promise<string> => {
    return new Promise(resolve => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const rad = (deg * Math.PI) / 180
        const sin = Math.abs(Math.sin(rad))
        const cos = Math.abs(Math.cos(rad))
        canvas.width = img.width * cos + img.height * sin
        canvas.height = img.width * sin + img.height * cos
        const ctx = canvas.getContext('2d')!
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(rad)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = src
    })
  }, [])

  async function handleRotate(delta: number) {
    const newRotation = (rotation + delta + 360) % 360
    setRotation(newRotation)
  }

  // 回転後に再OCR
  async function handleReOcr() {
    if (!image) return
    setReOcring(true)
    const rotated = await rotateImageAndGetBase64(image, rotation)
    const base64 = rotated.split(',')[1]

    const res = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64 }),
    })
    const data = await res.json()
    const blocks = data.blocks || []
    setText(blocks.map((b: { text: string }) => b.text).join(''))
    // 回転済み画像をsessionStorageに保存
    sessionStorage.setItem('ocr_image', rotated)
    setImage(rotated)
    setRotation(0)
    setReOcring(false)
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send/ocr" className="text-stone-400 hover:text-stone-600">←</Link>
        <h1 className="text-base font-bold text-stone-700">読み取り確認</h1>
      </header>

      <main className="px-6 py-2 space-y-5">
        {/* 撮影画像 */}
        {image && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-400">撮影した画像</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotate(-90)}
                  className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-base"
                  title="左に回転"
                >
                  ↺
                </button>
                <button
                  onClick={() => handleRotate(90)}
                  className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-base"
                  title="右に回転"
                >
                  ↻
                </button>
                {rotation !== 0 && (
                  <button
                    onClick={handleReOcr}
                    disabled={reOcring}
                    className="text-xs text-stone-50 bg-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-800 disabled:opacity-50"
                  >
                    {reOcring ? '読み取り中...' : 'この向きで再読み取り'}
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 flex items-center justify-center h-52">
              <Image
                src={image}
                alt="撮影画像"
                width={600}
                height={400}
                className="max-h-full object-contain transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
                unoptimized
              />
            </div>
            {rotation !== 0 && (
              <p className="text-xs text-stone-400 text-center">
                {rotation}° 回転中 → 「この向きで再読み取り」を押してください
              </p>
            )}
          </div>
        )}

        {/* 読み取り結果 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">読み取ったテキスト</p>
            <button
              onClick={handleUseSelection}
              className="text-xs text-stone-500 border border-stone-200 px-2 py-1 rounded-lg hover:bg-stone-50"
            >
              選択部分だけ使う
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            maxLength={200}
            className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-stone-400 bg-white resize-none leading-relaxed"
            placeholder="読み取ったテキストが表示されます"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-stone-300">届けたい一文を選んで編集してください</p>
            <p className="text-xs text-stone-300">{text.length}/200</p>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!text.trim()}
          className="w-full py-3 bg-stone-700 text-stone-50 rounded-full text-sm tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-40"
        >
          この内容で進む →
        </button>
      </main>
    </div>
  )
}
