'use client'

import { MOOD_TAGS, MoodTag } from '@/lib/types'

interface Props {
  onSelect: (mood: MoodTag) => void
}

export default function MoodSelector({ onSelect }: Props) {
  return (
    <div className="fixed inset-0 bg-stone-900/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-3xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-stone-700">今日はどんな言葉が必要ですか？</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MOOD_TAGS.map(mood => (
            <button
              key={mood.value}
              onClick={() => onSelect(mood.value)}
              className="p-4 rounded-2xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-colors text-left space-y-1"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <p className="text-xs text-stone-600 leading-snug">{mood.value}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
