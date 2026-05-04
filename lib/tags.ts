import Anthropic from '@anthropic-ai/sdk'
import { PHRASE_TAGS } from './types'

const client = new Anthropic()

export async function suggestTags(text: string): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `以下のフレーズに最も合うタグを14テーマから最大3つ選んでください。
フレーズ：${text}
タグ一覧：${PHRASE_TAGS.join(',')}
JSONで返してください: {"tags": ["タグ1", "タグ2"]}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return []

  try {
    const parsed = JSON.parse(content.text)
    return Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : []
  } catch {
    return []
  }
}
