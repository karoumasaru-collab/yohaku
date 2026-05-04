import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromImage } from '@/lib/ocr'
import sharp from 'sharp'
import { exec } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function toJpegBuffer(buffer: Buffer, filename: string): Promise<Buffer> {
  const isHeic = /\.(heic|heif)$/i.test(filename)

  if (isHeic) {
    const tmpIn = join(tmpdir(), `ocr_in_${Date.now()}.heic`)
    const tmpOut = join(tmpdir(), `ocr_out_${Date.now()}.jpg`)
    await writeFile(tmpIn, buffer)
    try {
      await execAsync(`sips -s format jpeg "${tmpIn}" --out "${tmpOut}"`)
      const result = await readFile(tmpOut)
      return result
    } finally {
      await unlink(tmpIn).catch(() => {})
      await unlink(tmpOut).catch(() => {})
    }
  }

  return sharp(buffer)
    .rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'image required' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let jpegBuffer: Buffer
  try {
    jpegBuffer = await toJpegBuffer(buffer, file.name)
  } catch (err) {
    return NextResponse.json({ error: `変換失敗: ${String(err)}` }, { status: 500 })
  }

  // 長辺1600pxにリサイズ（sipsで変換した場合も）
  jpegBuffer = await sharp(jpegBuffer)
    .rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const base64 = jpegBuffer.toString('base64')
  const imageDataUrl = `data:image/jpeg;base64,${base64}`

  try {
    const blocks = await extractTextFromImage(base64)
    return NextResponse.json({ blocks, imageDataUrl })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
