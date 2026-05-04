import { Book } from './types'

function parseVolume(item: { volumeInfo: Record<string, unknown> }, isbn?: string): Partial<Book> {
  const v = item.volumeInfo as {
    title?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    imageLinks?: { thumbnail?: string }
    description?: string
    industryIdentifiers?: { type: string; identifier: string }[]
  }
  const detectedIsbn =
    v.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
    v.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier ||
    isbn ||
    null

  return {
    isbn: detectedIsbn,
    title: v.title || '',
    author: v.authors?.join(', ') || null,
    publisher: v.publisher || null,
    published_at: v.publishedDate || null,
    cover_url: v.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
    description: v.description || null,
    is_whitelisted: true,
  }
}

export async function fetchBookByIsbn(isbn: string): Promise<Partial<Book> | null> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${key ? `&key=${key}` : ''}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (!data.items?.length) return null
  return parseVolume(data.items[0], isbn)
}

export async function searchBooksByQuery(query: string): Promise<Partial<Book>[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const q = encodeURIComponent(query)
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8&langRestrict=ja${key ? `&key=${key}` : ''}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (!data.items?.length) return []
  return data.items.map((item: { volumeInfo: Record<string, unknown> }) => parseVolume(item))
}
