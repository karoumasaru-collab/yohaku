export type Role = 'sender' | 'receiver' | 'both'
export type PhraseStatus = 'active' | 'paused' | 'deleted'
export type DeliveryStatus = 'pending' | 'delivered' | 'read'

export interface User {
  id: string
  created_at: string
  email: string | null
  display_name: string | null
  birthday: string | null
  timezone: string
  push_token: string | null
  push_enabled: boolean
  notify_hour: number
  role: Role
}

export interface Book {
  id: string
  isbn: string | null
  title: string
  author: string | null
  publisher: string | null
  published_at: string | null
  cover_url: string | null
  description: string | null
  amazon_url: string | null
  is_whitelisted: boolean
  created_at: string
}

export interface Phrase {
  id: string
  created_at: string
  sender_id: string
  book_id: string
  text: string
  page_number: number | null
  tags: string[]
  ai_tags: string[] | null
  image_url: string | null
  status: PhraseStatus
  delivered_count: number
  hit_count: number
  rarity: string
  book?: Book
}

export interface Delivery {
  id: string
  created_at: string
  delivered_at: string | null
  phrase_id: string
  receiver_id: string
  sender_id: string
  mood_tag: string | null
  is_hit: boolean
  is_passed: boolean
  notified_sender: boolean
  status: DeliveryStatus
  phrase?: Phrase
}

export interface UserStats {
  user_id: string
  updated_at: string
  total_sent: number
  total_books_sent: number
  total_hit: number
  current_streak: number
  longest_streak: number
  last_sent_month: string | null
  total_received: number
  total_hit_received: number
  top_tags: Record<string, number> | null
  birthday_delivered: boolean
  anniversary_notified: boolean
}

export const MOOD_TAGS = [
  { value: '静かにいたい', emoji: '😶' },
  { value: '何かを始めたい', emoji: '🔥' },
  { value: '考えたいことがある', emoji: '💭' },
  { value: 'なんとなく、任せる', emoji: '🌀' },
] as const

export const PHRASE_TAGS = [
  '孤独', '愛', '時間', '死生観', '旅',
  '仕事', '哲学', 'ユーモア', '科学', '自然',
  '挑戦', '家族', '言語', '身体',
] as const

export type MoodTag = typeof MOOD_TAGS[number]['value']
export type PhraseTag = typeof PHRASE_TAGS[number]
