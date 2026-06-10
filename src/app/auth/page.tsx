'use client'
// src/app/auth/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Music, Film, BookOpen, Utensils, Palette, Theater, Users, User, Mic, Globe } from 'lucide-react'

const ROLE_OPTIONS = [
  { id: 'artiste_musicien', label: 'Artiste / Musicien / Danseur', icon: Music },
  { id: 'cineaste_acteur',  label: 'Cinéaste / Acteur',            icon: Film },
  { id: 'ecrivain_auteur',  label: 'Écrivain / Auteur',            icon: BookOpen },
  { id: 'responsable_culturel', label: 'Responsable culturel / Institution', icon: Globe },
  { id: 'gastronome_chef',  label: 'Gastronome / Chef',            icon: Utensils },
  { id: 'journaliste',      label: 'Journaliste / Média',          icon: Mic },
  { id: 'contributeur',     label: 'Contributeur général',         icon: Users },
  { id: 'fan',              label: 'Fan / Passionné de culture haïtienne', icon: User },
]

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<'email' | 'role' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleLabel, setRoleLabel] = useState('')
  const [code, setCode] = useState('')

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'signup' && !roleLabel) {
      toast.error('Veuillez choisir votre rôle')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: mode }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }
      setStep('otp')
      toast.success('Code OTP envoyé à votre email')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, code, purpose: mode,
          full_name: fullName || undefined,
          role_label: roleLabel || undefined,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }
      toast.success('Connexion réussie!')
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-rouge focus:border-transparent text-sm outline-none transition"

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f3] to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="flex-1 bg-brand-bleu" />
              <div className="flex-1 bg-brand-rouge" />
            </div>
            <span className="font-display font-bold text-2xl text-[#1A1A24]">
              Cultu<span className="text-brand-rouge">pedia</span>
            </span>
          </Link>
          <p className="text-[#5A5A6E] text-sm">
            {mode === 'login' ? 'Bon retour sur Cultupedia' : 'Rejoignez la communauté culturelle haïtienne'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-8">

          {/* Toggle */}
          <div className="flex gap-1 mb-8 bg-black/[0.04] p-1 rounded-xl">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setStep('email'); setRoleLabel('') }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition ${
                  mode === m ? 'bg-white text-[#1A1A24] shadow-sm' : 'text-[#9090A8] hover:text-[#1A1A24]'
                }`}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Étape email */}
          {step === 'email' && (
            <div className="space-y-5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Nom complet</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Votre nom" className={inputClass} />
                  </div>

                  {/* Choix du rôle */}
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-3 block">
                      Je suis... *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_OPTIONS.map(r => (
                        <button key={r.id} type="button" onClick={() => setRoleLabel(r.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2 ${
                            roleLabel === r.id
                              ? 'border-brand-rouge bg-brand-rouge/[0.04]'
                              : 'border-black/[0.08] hover:border-black/20'
                          }`}>
                          <r.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${roleLabel === r.id ? 'text-brand-rouge' : 'text-[#9090A8]'}`} />
                          <span className={`text-xs font-medium leading-tight ${roleLabel === r.id ? 'text-brand-rouge' : 'text-[#1A1A24]'}`}>
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={e => { if (mode === 'signup' && !roleLabel) { e.preventDefault(); toast.error('Choisissez votre rôle'); return; } handleRequestOTP(e) }}>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="vous@email.com" required className={inputClass} />
                </div>
                <button type="submit" disabled={loading || !email || (mode === 'signup' && !roleLabel)}
                  className="w-full btn-primary justify-center py-3 disabled:opacity-40">
                  {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</> : 'Recevoir le code'}
                </button>
              </form>
            </div>
          )}

          {/* Étape OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  Code envoyé à <strong>{email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</strong>
                </p>
                {roleLabel && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Rôle : {ROLE_OPTIONS.find(r => r.id === roleLabel)?.label}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">
                  Code à 6 chiffres
                </label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} required
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl text-center text-3xl tracking-[0.5em] focus:ring-2 focus:ring-brand-rouge focus:border-transparent outline-none font-mono" />
              </div>

              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full btn-primary justify-center py-3 disabled:opacity-40">
                {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Vérification...</> : 'Vérifier le code'}
              </button>

              <button type="button" onClick={() => setStep('email')}
                className="w-full text-[#9090A8] hover:text-[#1A1A24] text-sm font-medium py-2 transition">
                ← Retour
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#9090A8] mt-6">
          En vous inscrivant, vous acceptez de contribuer respectueusement à Cultupedia.
        </p>
      </div>
    </div>
  )
}
