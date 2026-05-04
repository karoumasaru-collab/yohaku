'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Delivery } from '@/lib/types'
import HitAnimation from './HitAnimation'
import MoodSelector from './MoodSelector'
import { MoodTag } from '@/lib/types'

interface Props {
  delivery: Delivery | null
  hasMood: boolean
  onMoodSelect: (mood: MoodTag) => void
}

export default function PhraseCard({ delivery, hasMood, onMoodSelect }: Props) {
  const [hitDone, setHitDone] = useState(false)
  const [passDone, setPassDone] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showBookLink, setShowBookLink] = useState(false)

  if (!hasMood) {
    return <MoodSelector onSelect={onMoodSelect} />
  }

  if (!delivery) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-stone-400 text-sm">今日の言葉はまだ届いていません</p>
        <p className="text-xs text-stone-300">明日を楽しみにしていてください</p>
      </div>
    )
  }

  if (passDone) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-stone-500 text-sm">明日の言葉を楽しみにしていてください</p>
      </div>
    )
  }

  const phrase = delivery.phrase
  const book = phrase?.book

  async function handleHit() {
    setShowAnimation(true)
    await fetch(`/api/delivery/${delivery!.id}/hit`, { method: 'POST' })
    setTimeout(() => {
      setShowAnimation(false)
      setHitDone(true)
      setShowBookLink(true)
    }, 1500)
  }

  async function handlePass() {
    await fetch(`/api/delivery/${delivery!.id}/pass`, { method: 'POST' })
    setPassDone(true)
  }

  return (
    <>
      {showAnimation && <HitAnimation />}
      <div className="max-w-sm w-full mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-6">
          {book?.cover_url && (
            <div className="flex justify-center">
              <Image
                src={book.cover_url}
                alt={book.title}
                width={60}
                height={80}
                className="rounded shadow-sm object-cover"
              />
            </div>
          )}

          <blockquote className="text-stone-700 text-base leading-relaxed tracking-wide text-center">
            &ldquo;{phrase?.text}&rdquo;
          </blockquote>

          <div className="text-center">
            <p className="text-xs text-stone-400">
              ── {book?.title}
              {book?.author && ` / ${book.author}`}
            </p>
          </div>

          {!hitDone && (
            <div className="flex gap-3">
              <button
                onClick={handleHit}
                className="flex-1 py-3 bg-stone-700 text-stone-50 rounded-full text-sm hover:bg-stone-800 transition-colors"
              >
                刺さった ✨
              </button>
              <button
                onClick={handlePass}
                className="flex-1 py-3 border border-stone-200 text-stone-500 rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                今日じゃなかった
              </button>
            </div>
          )}

          {hitDone && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-stone-500">刺さりましたね ✨</p>
              {showBookLink && book?.amazon_url && (
                <a
                  href={book.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-4 border border-stone-300 text-stone-600 rounded-full text-xs hover:bg-stone-50"
                >
                  この本を見る →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
