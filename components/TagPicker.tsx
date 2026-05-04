'use client'

import { PHRASE_TAGS, PhraseTag } from '@/lib/types'

interface Props {
  selected: string[]
  suggested: string[]
  onChange: (tags: string[]) => void
}

export default function TagPicker({ selected, suggested, onChange }: Props) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else if (selected.length < 3) {
      onChange([...selected, tag])
    }
  }

  function adoptSuggested() {
    const merged = [...new Set([...selected, ...suggested])].slice(0, 3)
    onChange(merged)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-stone-400 mb-3">このフレーズが届いてほしい人の気分を選んでください（最大3つ）</p>
        <div className="flex flex-wrap gap-2">
          {PHRASE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selected.includes(tag)
                  ? 'bg-stone-700 text-stone-50 border-stone-700'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {suggested.length > 0 && (
        <div className="p-4 bg-stone-50 rounded-2xl space-y-2">
          <p className="text-xs text-stone-400">
            AIは &ldquo;{suggested.join('&rdquo; と &ldquo;')}&rdquo; を提案しています
          </p>
          <button
            onClick={adoptSuggested}
            className="text-xs text-stone-600 underline hover:no-underline"
          >
            採用する
          </button>
        </div>
      )}

      <p className="text-xs text-stone-400">選択中: {selected.length}/3</p>
    </div>
  )
}
