// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-brand-rouge/20 border-t-brand-rouge rounded-full animate-spin" />
        <p className="text-sm text-[#9090A8]">Chargement...</p>
      </div>
    </div>
  )
}
