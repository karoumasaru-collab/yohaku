interface OcrBlock {
  text: string
  confidence: number
  bounding_box: object
}

export async function extractTextFromImage(imageBase64: string): Promise<OcrBlock[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: 'この画像に写っているテキストをすべて読み取って、そのまま出力してください。余計な説明や前置きは不要です。テキストだけを出力してください。',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''

  return [{ text, confidence: 1.0, bounding_box: {} }]
}
