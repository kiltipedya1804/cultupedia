'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [code, setCode] = useState('')

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: mode,
        }),
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
          email,
          code,
          purpose: mode,
          full_name: fullName || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success('Connexion réussie!')
      setTimeout(() => router.push('/'), 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 font-playfair mb-2">Cultupedia</h1>
            <p className="text-slate-600">
              {mode === 'login' ? 'Connexion' : 'Inscription'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setMode('login')
                setStep('email')
              }}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setStep('email')
              }}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Envoi...' : 'Recevoir le code'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  Un code a été envoyé à <strong>{email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code OTP (6 chiffres)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-slate-600 hover:text-slate-900 font-medium py-2 px-4 rounded-lg transition"
              >
                Retour
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
