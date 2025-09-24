import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, submissionId } = await request.json()

    if (!fileName || !fileType || !submissionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/heic',
      'image/webp',
      'text/plain'
    ]

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Generate unique file path
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${uuidv4()}-${fileName}`
    const filePath = `${submissionId}/${uniqueFileName}`

    // Create signed upload URL
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath)

    if (error) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: filePath,
      token: data.token
    })
  } catch (error) {
    console.error('Error in upload sign route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
