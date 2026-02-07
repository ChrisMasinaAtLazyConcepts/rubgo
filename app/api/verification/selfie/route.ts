// app/api/verification/selfie/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// In production, use cloud storage (S3, Cloudinary, etc.)
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'selfies')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const selfieFile = formData.get('selfie') as File
    const userId = formData.get('userId') as string
    const bookingId = formData.get('bookingId') as string

    if (!selfieFile) {
      return NextResponse.json(
        { error: 'No selfie file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = uuidv4()
    const timestamp = Date.now()
    const filename = `${timestamp}_${fileId}.jpg`
    const filepath = join(UPLOAD_DIR, filename)

    // Convert file to buffer
    const bytes = await selfieFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file (in production, upload to cloud storage)
    await writeFile(filepath, buffer)

    // Return file info
    return NextResponse.json({
      id: fileId,
      filename,
      filepath: `/uploads/selfies/${filename}`,
      userId,
      bookingId,
      uploadedAt: new Date().toISOString(),
      size: selfieFile.size,
      type: selfieFile.type
    })
  } catch (error) {
    console.error('Selfie upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload selfie' },
      { status: 500 }
    )
  }
}