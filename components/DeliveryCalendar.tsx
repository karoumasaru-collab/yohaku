'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Delivery } from '@/lib/types'

interface DayData {
  received: number
  hit: number
  passed: number
}

export default function DeliveryCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [days, setDays] = useState<Record<number, DayData>>({})
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayDeliveries, setDayDeliveries] = useState<Delivery[]>([])
  const [dayLoading, setDayLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelectedDay(null)
    fetch(`/api/stats/calendar?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(data => {
        setDays(data.days || {})
        setLoading(false)
      })
  }, [year, month])

  async function handleDayClick(day: number) {
    if (selectedDay === day) {
      setSelectedDay(null)
      setDayDeliveries([])
      return
    }
    setSelectedDay(day)
    setDayLoading(true)
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const res = await fetch(`/api/delivery/date?date=${date}`)
    const data = await res.json()
    setDayDeliveries(data.deliveries || [])
    setDayLoading(false)
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  function getDayStyle(day: number) {
    const d = days[day]
    const isToday = year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate()
    const isSelected = selectedDay === day
    if (isSelected) return 'bg-stone-700 text-white'
    if (!d) return isToday ? 'ring-1 ring-stone-300 text-stone-500' : 'text-stone-300'
    if (d.hit > 0) return 'bg-amber-100 text-amber-700 font-semibold'
    if (d.received > 0) return 'bg-stone-100 text-stone-600'
    return 'text-stone-300'
  }

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-lg">
          ‹
        </button>
        <h3 className="text-sm font-bold text-stone-700">{year}年{month}月</h3>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth() + 1}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-lg disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* 曜日 */}
      <div className="grid grid-cols-7 text-center">
        {weekdays.map(w => (
          <div key={w} className={`text-xs pb-2 ${w === '日' ? 'text-red-300' : w === '土' ? 'text-blue-300' : 'text-stone-300'}`}>
            {w}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      {loading ? (
        <div className="text-center py-6 text-stone-300 text-xs">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const d = days[day]
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-colors ${getDayStyle(day)}`}
              >
                <span>{day}</span>
                {d?.hit > 0 && <span className="text-[8px] leading-none">✨</span>}
                {d && !d.hit && d.received > 0 && <span className="text-[8px] leading-none opacity-40">●</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* 凡例 */}
      <div className="flex gap-4 text-xs text-stone-400 pt-1 border-t border-stone-50">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block" />刺さった</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-stone-100 inline-block" />受け取った</span>
      </div>

      {/* 選択日のフレーズ */}
      {selectedDay && (
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <p className="text-xs font-semibold text-stone-500">{month}月{selectedDay}日の言葉</p>

          {dayLoading ? (
            <p className="text-xs text-stone-300 text-center py-4">読み込み中...</p>
          ) : dayDeliveries.length === 0 ? (
            <p className="text-xs text-stone-300 text-center py-4">この日は届いていません</p>
          ) : (
            <div className="space-y-3">
              {dayDeliveries.map(delivery => {
                const phrase = delivery.phrase
                const book = phrase?.book
                return (
                  <div key={delivery.id} className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                    {book?.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        width={32}
                        height={44}
                        className="rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-11 bg-stone-200 rounded shrink-0 flex items-center justify-center text-stone-400 text-xs">
                        📖
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs text-stone-700 leading-relaxed">
                        &ldquo;{phrase?.text}&rdquo;
                      </p>
                      <p className="text-xs text-stone-400 truncate">
                        {book?.title}{book?.author && ` / ${book.author}`}
                      </p>
                      <div className="flex items-center gap-2">
                        {delivery.is_hit && <span className="text-xs text-amber-400">✨ 刺さった</span>}
                        {delivery.is_passed && <span className="text-xs text-stone-300">今日じゃなかった</span>}
                        <div className="flex gap-1 ml-auto">
                          {phrase?.tags?.map(tag => (
                            <span key={tag} className="text-xs text-stone-300 bg-stone-100 px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
