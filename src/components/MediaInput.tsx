'use client'
// src/components/MediaInput.tsx
import { useState } from 'react'
import { Link as LinkIcon, Upload } from 'lucide-react'
import MediaUploader from './MediaUploader'

interface MediaInputProps {
  value: string
  onChange: (url: string) => void
  type?: 'image' | 'video' | 'auto'
  placeholder?: string
  label?: string
}

export default function MediaInput({ value, onChange, type = 'auto', placeholder, label }: MediaInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>(value ? 'url' : 'upload')

  return (
    <div>
      {label && <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">{label}</label>}

      <div className="flex gap-1 mb-3 bg-black/[0.04] p-1 rounded-xl w-fit">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            mode === 'upload' ? 'bg-white text-[#1A1A24] shadow-sm' : 'text-[#9090A8]'
          }`}>
          <Upload className="w-3.5 h-3.5" /> Téléverser
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            mode === 'url' ? 'bg-white text-[#1A1A24] shadow-sm' : 'text-[#9090A8]'
          }`}>
          <LinkIcon className="w-3.5 h-3.5" /> Lien URL
        </button>
      </div>

      {mode === 'upload' ? (
        <MediaUploader type={type} currentUrl={value} onUploaded={onChange} />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://...'}
          className="filter-select w-full text-sm py-3"
        />
      )}
    </div>
  )
}
