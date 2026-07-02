'use client'
// src/components/NewsletterWidget.tsx
import { useState } from 'react'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'

interface NewsletterWidgetProps {
  variant?: 'footer' | 'banner' | 'inline'
}

export default function NewsletterWidget({ variant = 'inline' }: NewsletterWidgetProps) {
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nom }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${variant === 'footer' ? 'text-white/80' : 'text-emerald-700'}`}>
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-medium">
          Vérifiez votre email pour confirmer votre inscription !
        </p>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={subscribe} className="space-y-2">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
          placeholder="Votre email..."
          className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
        <button type="submit" disabled={status === 'loading'}
          className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-brand-rouge text-white hover:bg-brand-rouge/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {status === 'loading' ? 'Inscription...' : <><Mail className="w-4 h-4" /> S'abonner</>}
        </button>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </form>
    )
  }

  if (variant === 'banner') {
    return (
      <section className="py-16 bg-[#1A1A24] relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-brand-rouge via-brand-or to-brand-bleu" />
        <div className="section max-w-3xl text-center">
          <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-3">Newsletter</div>
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Restez connecté à la culture haïtienne
          </h2>
          <p className="text-white/60 mb-8">
            Nouvelles entrées, événements culturels, contributions de la communauté — directement dans votre boîte mail.
          </p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input value={nom} onChange={e => setNom(e.target.value)}
              placeholder="Votre prénom (optionnel)"
              className="flex-1 px-4 py-3.5 text-sm rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              placeholder="Votre email *"
              className="flex-1 px-4 py-3.5 text-sm rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
            <button type="submit" disabled={status === 'loading'}
              className="btn-primary px-6 py-3.5 flex-shrink-0 disabled:opacity-50">
              {status === 'loading'
                ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                : <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
          {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          <p className="text-xs text-white/30 mt-4">Pas de spam. Désinscription en un clic.</p>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={subscribe} className="flex gap-2">
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
        placeholder="Votre email..."
        className="flex-1 px-4 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-rouge" />
      <button type="submit" disabled={status === 'loading'}
        className="btn-primary text-sm px-4 py-2.5 disabled:opacity-50">
        {status === 'loading' ? '...' : "S'abonner"}
      </button>
    </form>
  )
}
