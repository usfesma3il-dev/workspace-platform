'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { FileRecord, Profile } from '@/types'
import {
  FolderOpen,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  File,
} from 'lucide-react'
import { formatFileSize, formatDate, getFileIcon, isImageFile, isPDFFile } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'

interface FilesClientProps {
  files: (FileRecord & { uploader?: Profile })[]
  currentUser: Profile
}

export default function FilesClient({ files: initialFiles, currentUser }: FilesClientProps) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const storagePath = `${currentUser.id}/${Date.now()}_${file.name}`

        try {
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(storagePath, file, { upsert: false })

          if (uploadError) throw uploadError

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('files')
            .getPublicUrl(storagePath)

          // Save to database
          const { data: fileRecord, error: dbError } = await supabase
            .from('files')
            .insert({
              name: file.name,
              size: file.size,
              type: file.type,
              url: urlData.publicUrl,
              storage_path: storagePath,
              uploaded_by: currentUser.id,
            })
            .select(`*, uploader:profiles(*)`)
            .single()

          if (dbError) throw dbError

          setFiles((prev) => [fileRecord as FileRecord & { uploader?: Profile }, ...prev])
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        } catch (err) {
          setError(`Failed to upload ${file.name}`)
          console.error(err)
        }
      }

      setUploading(false)
      setUploadProgress(0)
    },
    [currentUser.id, supabase]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const handleDelete = async (file: FileRecord) => {
    if (!confirm(`Delete "${file.name}"?`)) return

    // Delete from storage
    await supabase.storage.from('files').remove([file.storage_path])

    // Delete from database
    await supabase.from('files').delete().eq('id', file.id)

    setFiles((prev) => prev.filter((f) => f.id !== file.id))
  }

  const handleDownload = (file: FileRecord) => {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    a.click()
  }

  const images = files.filter((f) => isImageFile(f.type))
  const documents = files.filter((f) => !isImageFile(f.type))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Files</h1>
            <p className="text-xs text-muted-foreground">{files.length} files stored</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-border hover:border-purple-500/50 hover:bg-white/3'
          }`}
        >
          <input {...getInputProps()} id="file-upload-input" />
          {uploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto animate-pulse">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <div className="max-w-xs mx-auto bg-muted rounded-full h-2">
                <div
                  className="gradient-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-purple-400">Drop files here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag & drop files here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or <span className="text-purple-400">browse files</span> · Max 50MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Images section */}
        {images.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              Images ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((file) => (
                <div
                  key={file.id}
                  className="group relative glass-card overflow-hidden rounded-xl aspect-square cursor-pointer hover:border-white/20 transition-all"
                  onClick={() => setPreviewFile(file)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(file) }}
                      className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(file) }}
                      className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {file.uploaded_by === currentUser.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                        className="w-8 h-8 rounded-lg bg-red-500/30 flex items-center justify-center text-red-300 hover:bg-red-500/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documents section */}
        {documents.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Documents ({documents.length})
            </h2>
            <div className="space-y-2">
              {documents.map((file) => (
                <div
                  key={file.id}
                  className="glass-card p-4 flex items-center gap-4 hover:border-white/15 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatDate(file.created_at)}</span>
                      {file.uploader && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <div className="flex items-center gap-1">
                            <Avatar profile={file.uploader} size="xs" />
                            <span className="text-xs text-muted-foreground">
                              {file.uploader.full_name || file.uploader.username}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPDFFile(file.type) && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {file.uploaded_by === currentUser.id && (
                      <button
                        onClick={() => handleDelete(file)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {files.length === 0 && !uploading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-brand-subtle flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No files yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload files by dragging them above or clicking to browse.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">{previewFile.name}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/20 min-h-64">
              {isImageFile(previewFile.type) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : isPDFFile(previewFile.type) ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh]"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <p className="text-muted-foreground text-sm">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
