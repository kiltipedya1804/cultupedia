'use client'
// src/app/contact/page.tsx
import { useState } from 'react'
import { Mail, MessageSquare, Globe, Send, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  const [form, setForm]   = useState({ nom: '', email: '', sujet: '', message: '' })
  const [status, setStatus] = useState<'idle'|'sending'|'done'|'error'>('idle')

  function field(k: keyof typeof form) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value })),
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Simuler envoi — intégrez votre service email ici (Resend, SendGrid, etc.)
    await new Promise(r => setTimeout(r, 1200))
    setStatus('done')
  }

  const inputClass = "filter-select w-full text-sm py-3"

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-5xl">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-3">Contact</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-4">Nous contacter</h1>
            <p className="text-[#5A5A6E] max-w-lg mx-auto">
              Une question, une suggestion, une entrée à signaler ou à contribuer ?
              Écrivez-nous.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Infos contact */}
            <div className="space-y-5">
              {[
                { icon: Mail,          title: 'Email',    val: 'contact@cultupedia.ht' },
                { icon: Globe,         title: 'Site',     val: 'cultupedia.ht' },
                { icon: MessageSquare, title: 'Réseaux',  val: '@cultupedia' },
              ].map((c, i) => (
                <div key={i} className="card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-rouge/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-4 h-4 text-brand-rouge" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-0.5">{c.title}</div>
                    <div className="text-sm font-medium text-[#1A1A24]">{c.val}</div>
                  </div>
                </div>
              ))}

              <div className="card p-5 bg-brand-rouge/[0.04] border-brand-rouge/10">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-2">Contribuer à Cultupedia</h3>
                <p className="text-xs text-[#5A5A6E] leading-relaxed">
                  Vous connaissez un artiste, un groupe ou une institution non répertoriés ?
                  Signalez-le via ce formulaire — notre équipe éditoriale l'examinera.
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              {status === 'done' ? (
                <div className="card p-12 text-center">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Message envoyé !</h3>
                  <p className="text-[#5A5A6E]">Nous vous répondrons dans les meilleurs délais.</p>
                  <button onClick={() => { setStatus('idle'); setForm({ nom:'',email:'',sujet:'',message:'' }) }}
                          className="btn-ghost mt-6 text-sm">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={send} className="card p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Nom *</label>
                      <input {...field('nom')} required placeholder="Votre nom" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Email *</label>
                      <input {...field('email')} required type="email" placeholder="votre@email.com" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Sujet</label>
                    <select {...field('sujet')} className={inputClass}>
                      <option value="">Choisir un sujet...</option>
                      <option value="question">Question générale</option>
                      <option value="contribuer">Contribuer une entrée</option>
                      <option value="signaler">Signaler une erreur</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1.5 block">Message *</label>
                    <textarea {...field('message')} required rows={6}
                              placeholder="Votre message..."
                              className="filter-select w-full text-sm resize-none py-3" />
                  </div>
                  <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center py-3.5">
                    {status === 'sending'
                      ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                      : <><Send className="w-4 h-4" /> Envoyer le message</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
