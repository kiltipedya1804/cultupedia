'use client'
// src/components/MediaUploader.tsx
import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon, Video as VideoIcon, Music } from 'lucide-react'

interface MediaUploaderProps {
  onUploaded: (url: string) => void
  type?: 'image' | 'video' | 'auto'
  label?: string
  currentUrl?: string
  className?: string
}

export default function MediaUploader({ onUploaded, type = 'auto', label, currentUrl, className }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  async function uploadFile(file: File) {
    if (!cloudName || !preset) {
      setError('Cloudinary non configuré')
      return
    }

    const resourceType = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'video' : 'image'

    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', preset)
      formData.append('folder', 'cultupedia')

      const xhr = new XMLHttpRequest()

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Échec du téléversement'))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Erreur réseau')))
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`)
        xhr.send(formData)
      })

      onUploaded(result.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de téléversement')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const acceptTypes = type === 'image' ? 'image/*' : type === 'video' ? 'video/*,audio/*' : 'image/*,video/*,audio/*'

  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-brand-rouge bg-brand-rouge/[0.04]' : 'border-black/[0.12] hover:border-black/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          className="hidden"
          capture={undefined}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-brand-rouge animate-spin" />
            <p className="text-sm text-[#5A5A6E]">Téléversement... {progress}%</p>
            <div className="w-full max-w-[200px] h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-brand-rouge transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : currentUrl ? (
          <div className="flex flex-col items-center gap-2">
            {type === 'image' ? (
              <img src={currentUrl} alt="" className="max-h-32 rounded-xl object-cover" />
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                {type === 'video' ? <VideoIcon className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                <span className="text-sm">Fichier téléversé</span>
              </div>
            )}
            <p className="text-xs text-[#9090A8]">Cliquez ou glissez pour remplacer</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-full bg-brand-rouge/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-brand-rouge" />
            </div>
            <p className="text-sm font-medium text-[#1A1A24]">Téléverser depuis l'appareil</p>
            <p className="text-xs text-[#9090A8]">Glissez un fichier ici ou cliquez pour parcourir</p>
            <p className="text-xs text-[#9090A8]">Téléphone, PC, tablette — photos, vidéos, audio</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
