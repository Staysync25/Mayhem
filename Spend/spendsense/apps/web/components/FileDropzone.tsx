'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface FileDropzoneProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

export function FileDropzone({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['pdf', 'csv', 'xlsx', 'xls', 'docx', 'png', 'jpg', 'jpeg', 'heic', 'webp', 'txt']
}: FileDropzoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...newFiles])
    onFilesChange([...files, ...newFiles])

    // Simulate upload progress
    for (const file of acceptedFiles) {
      const fileId = newFiles.find(f => f.name === file.name)?.id
      if (!fileId) continue

      // TODO: Implement actual upload to Supabase Storage
      // For now, simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ))
      }

      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'completed' as const } : f
      ))
    }
  }, [files, onFilesChange])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[`.${type}`] = []
      return acc
    }, {} as Record<string, string[]>),
    onDropRejected: (rejectedFiles) => {
      console.error('Files rejected:', rejectedFiles)
    }
  })

  const removeFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId)
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`file-dropzone ${isDragActive ? 'active' : ''} ${
          fileRejections.length > 0 ? 'error' : ''
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted: {acceptedTypes.join(', ')} • Max {formatFileSize(maxSize)} per file
          </p>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Some files were rejected</span>
          </div>
          <ul className="mt-2 text-sm text-destructive/80">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                {file.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div 
                        className="bg-accent h-1 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {file.status === 'completed' && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Uploaded</span>
                  </div>
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-destructive mt-1">{file.error}</p>
                )}
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
