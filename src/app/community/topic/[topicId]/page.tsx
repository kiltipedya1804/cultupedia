'use client'
// src/app/community/topic/[topicId]/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MessageCircle, ThumbsUp, ThumbsDown, ArrowLeft, Send, Pin, Lock } from 'lucide-react'

interface Topic {
  id: string; titre: string; contenu: string
  author_name: string; category_nom: string; category_id: string
  category_emoji: string; pinned: boolean; locked: boolean
  views: number; created_at: string; reply_count: number
}

interface Reply {
  id: string; contenu: string; author_name: string
  created_at: string; vote_score: number
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `il y a ${mins}min`
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

export default function TopicPage() {
  const params = useParams<{ topicId: string }>()
  const router = useRouter()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.user) setUser(d.user) })
    fetch(`/api/community/topics/${params.topicId}`)
      .then(r => r.json())
      .then(d => { setTopic(d.topic); setReplies(d.replies ?? []) })
      .finally(() => setLoading(false))
  }, [params.topicId])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/community/topics/${params.topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: reply }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReplies(prev => [...prev, data.reply])
      setReply('')
    } catch { alert('Erreur — êtes-vous connecté ?') }
    finally { setSending(false) }
  }

  if (loading) return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20"><div className="section max-w-3xl"><div className="skeleton h-96 rounded-2xl" /></div></main>
    </>
  )

  if (!topic) return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-[#1A1A24] mb-4">Sujet introuvable</h1>
          <Link href="/community" className="btn-primary">Retour au forum</Link>
        </div>
      </main>
    </>
  )

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-3xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-6">
            <Link href="/community" className="hover:text-brand-rouge transition-colors">Forum</Link>
            <span>/</span>
            <Link href={`/community/${topic.category_id}`} className="hover:text-brand-rouge transition-colors">
              {topic.category_emoji} {topic.category_nom}
            </Link>
            <span>/</span>
            <span className="text-[#1A1A24] font-medium truncate max-w-[180px]">{topic.titre}</span>
          </nav>

          {/* Topic principal */}
          <div className="card p-8 mb-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {topic.pinned && (
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-rouge bg-brand-rouge/10 px-2.5 py-1 rounded-full">
                  <Pin className="w-3 h-3" /> Épinglé
                </span>
              )}
              {topic.locked && (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#9090A8] bg-black/[0.06] px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> Fermé
                </span>
              )}
              <span className="text-xs text-[#9090A8] bg-black/[0.04] px-2.5 py-1 rounded-full">
                {topic.category_emoji} {topic.category_nom}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl text-[#1A1A24] mb-4">{topic.titre}</h1>

            <div className="flex items-center gap-3 mb-6 text-sm text-[#9090A8]">
              <div className="w-8 h-8 rounded-full bg-brand-rouge/10 flex items-center justify-center font-bold text-brand-rouge text-sm">
                {(topic.author_name ?? 'A').charAt(0).toUpperCase()}
              </div>
              <span><strong className="text-[#1A1A24]">{topic.author_name ?? 'Anonyme'}</strong></span>
              <span>·</span>
              <span>{timeAgo(topic.created_at)}</span>
              <span>·</span>
              <span>{topic.views} vues</span>
            </div>

            <div className="text-[#3A3A50] leading-relaxed text-[15px] whitespace-pre-line border-t border-black/[0.06] pt-6">
              {topic.contenu}
            </div>
          </div>

          {/* Replies */}
          <div className="mb-6">
            <h2 className="font-display font-bold text-lg text-[#1A1A24] mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-rouge" />
              {replies.length} réponse{replies.length !== 1 ? 's' : ''}
            </h2>

            {replies.length === 0 && !topic.locked && (
              <div className="text-center py-10 border-2 border-dashed border-black/[0.08] rounded-2xl mb-6">
                <p className="text-[#9090A8] text-sm">Aucune réponse — soyez le premier à répondre !</p>
              </div>
            )}

            <div className="space-y-4">
              {replies.map((r, i) => (
                <div key={r.id} className="card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bleu/10 flex items-center justify-center font-bold text-brand-bleu text-sm">
                      {(r.author_name ?? 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#1A1A24]">{r.author_name ?? 'Anonyme'}</span>
                      <span className="text-xs text-[#9090A8] ml-2">{timeAgo(r.created_at)}</span>
                    </div>
                    <span className="text-xs text-[#9090A8] ml-auto">#{i + 1}</span>
                  </div>
                  <p className="text-[#3A3A50] leading-relaxed text-sm whitespace-pre-line">{r.contenu}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply form */}
          {!topic.locked && (
            user ? (
              <form onSubmit={sendReply} className="card p-6">
                <h3 className="font-semibold text-[#1A1A24] mb-4">Votre réponse</h3>
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  rows={5} placeholder="Partagez votre avis..."
                  className="filter-select w-full text-sm py-3 resize-none mb-4" required />
                <div className="flex justify-end">
                  <button type="submit" disabled={sending || !reply.trim()}
                    className="btn-primary disabled:opacity-40">
                    {sending
                      ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                      : <><Send className="w-4 h-4" /> Répondre</>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="card p-6 text-center bg-brand-rouge/[0.03] border-brand-rouge/10">
                <p className="text-[#5A5A6E] mb-4">Connectez-vous pour participer à la discussion.</p>
                <Link href="/auth" className="btn-primary">Se connecter</Link>
              </div>
            )
          )}

          {topic.locked && (
            <div className="card p-5 text-center bg-black/[0.02]">
              <Lock className="w-5 h-5 text-[#9090A8] mx-auto mb-2" />
              <p className="text-sm text-[#9090A8]">Ce sujet est fermé — les nouvelles réponses ne sont plus acceptées.</p>
            </div>
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
