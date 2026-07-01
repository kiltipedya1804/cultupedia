// src/app/community/[categoryId]/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MessageCircle, Pin, Lock, Plus, ArrowLeft, Eye } from 'lucide-react'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/auth'

async function getCurrentUser() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    return await getUserById(id)
  } catch { return null }
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

export default async function ForumCategoryPage({ params }: { params: { categoryId: string } }) {
  const cats = await sql`SELECT * FROM forum_categories WHERE id = ${params.categoryId}`
  if (cats.length === 0) notFound()
  const cat = cats[0]

  const topics = await sql`
    SELECT ft.*, u.full_name AS author_name,
      COUNT(fr.id)::int AS reply_count,
      MAX(fr.created_at) AS last_reply_at
    FROM forum_topics ft
    LEFT JOIN users u ON u.id = ft.author_id
    LEFT JOIN forum_replies fr ON fr.topic_id = ft.id
    WHERE ft.category_id = ${params.categoryId}
    GROUP BY ft.id, u.full_name
    ORDER BY ft.pinned DESC, GREATEST(ft.updated_at, MAX(fr.created_at)) DESC
  `

  const user = await getCurrentUser()

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-4xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-6">
            <Link href="/community" className="hover:text-brand-rouge transition-colors">Forum</Link>
            <span>/</span>
            <span className="text-[#1A1A24] font-medium">{cat.nom}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-rouge/10 flex items-center justify-center text-3xl flex-shrink-0">
                {cat.emoji}
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-[#1A1A24]">{cat.nom}</h1>
                <p className="text-[#5A5A6E] text-sm mt-0.5">{cat.description}</p>
              </div>
            </div>
            {user && (
              <Link href={`/community/new?category=${params.categoryId}`} className="btn-primary flex-shrink-0">
                <Plus className="w-4 h-4" /> Nouveau sujet
              </Link>
            )}
          </div>

          {/* Topics list */}
          {topics.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-12 h-12 text-[#9090A8] mx-auto mb-4 opacity-40" />
              <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Aucune discussion</h3>
              <p className="text-[#9090A8] mb-6">Soyez le premier à lancer une discussion !</p>
              {user ? (
                <Link href={`/community/new?category=${params.categoryId}`} className="btn-primary">
                  Créer un sujet
                </Link>
              ) : (
                <Link href="/auth" className="btn-primary">Se connecter</Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic: any) => (
                <Link key={topic.id} href={`/community/topic/${topic.id}`}
                  className="card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-200 group block">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    topic.reply_count > 0 ? 'bg-brand-rouge/10' : 'bg-black/[0.04]'
                  }`}>
                    {topic.locked
                      ? <Lock className="w-4 h-4 text-[#9090A8]" />
                      : <MessageCircle className={`w-4 h-4 ${topic.reply_count > 0 ? 'text-brand-rouge' : 'text-[#9090A8]'}`} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {topic.pinned && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-brand-rouge bg-brand-rouge/10 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3" /> Épinglé
                        </span>
                      )}
                      <h3 className="font-semibold text-[#1A1A24] group-hover:text-brand-rouge transition-colors truncate">
                        {topic.titre}
                      </h3>
                    </div>
                    <p className="text-sm text-[#5A5A6E] line-clamp-1 mb-2">{topic.contenu}</p>
                    <div className="text-xs text-[#9090A8]">
                      Par <span className="font-medium">{topic.author_name ?? 'Anonyme'}</span>
                      {' · '}{timeAgo(topic.created_at)}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-[#9090A8] justify-end">
                      <MessageCircle className="w-3 h-3" /> {topic.reply_count}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#9090A8] justify-end">
                      <Eye className="w-3 h-3" /> {topic.views}
                    </div>
                    {topic.last_reply_at && (
                      <div className="text-xs text-[#9090A8]">{timeAgo(topic.last_reply_at)}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
