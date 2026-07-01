// src/app/community/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { sql } from '@/lib/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MessageCircle, Pin, Lock, Plus, ChevronRight, TrendingUp } from 'lucide-react'
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

async function getForumData() {
  const categories = await sql`
    SELECT fc.*,
      COUNT(ft.id)::int AS topic_count,
      MAX(ft.updated_at) AS last_activity
    FROM forum_categories fc
    LEFT JOIN forum_topics ft ON ft.category_id = fc.id
    GROUP BY fc.id
    ORDER BY fc.ordre
  `

  const recentTopics = await sql`
    SELECT ft.*, u.full_name AS author_name,
      fc.nom AS category_nom, fc.emoji AS category_emoji,
      COUNT(fr.id)::int AS reply_count
    FROM forum_topics ft
    LEFT JOIN users u ON u.id = ft.author_id
    LEFT JOIN forum_categories fc ON fc.id = ft.category_id
    LEFT JOIN forum_replies fr ON fr.topic_id = ft.id
    GROUP BY ft.id, u.full_name, fc.nom, fc.emoji
    ORDER BY ft.updated_at DESC
    LIMIT 5
  `

  return { categories, recentTopics }
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

export default async function CommunityPage() {
  const { categories, recentTopics } = await getForumData()
  const user = await getCurrentUser()

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-5xl">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Forum</div>
              <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-3">Communauté</h1>
              <p className="text-[#5A5A6E] max-w-lg">
                Discutez, partagez et échangez sur la culture haïtienne avec la communauté Cultupedia.
              </p>
            </div>
            {user ? (
              <Link href="/community/new" className="btn-primary flex-shrink-0">
                <Plus className="w-4 h-4" /> Nouveau sujet
              </Link>
            ) : (
              <Link href="/auth" className="btn-secondary flex-shrink-0">
                Connexion pour participer
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Catégories */}
            <div className="lg:col-span-2 space-y-3">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/community/${cat.id}`}
                  className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 group block">
                  <div className="w-12 h-12 rounded-2xl bg-brand-rouge/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[#1A1A24] group-hover:text-brand-rouge transition-colors">
                      {cat.nom}
                    </div>
                    <div className="text-sm text-[#9090A8] mt-0.5 truncate">{cat.description}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-[#1A1A24] text-lg">{cat.topic_count}</div>
                    <div className="text-xs text-[#9090A8]">sujets</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#9090A8] group-hover:text-brand-rouge transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Activité récente */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-rouge" /> Activité récente
                </h3>
                {recentTopics.length === 0 ? (
                  <p className="text-sm text-[#9090A8]">Aucune discussion pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {recentTopics.map((topic: any) => (
                      <Link key={topic.id} href={`/community/topic/${topic.id}`}
                        className="block hover:bg-black/[0.02] -mx-2 px-2 py-2 rounded-xl transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{topic.category_emoji}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#1A1A24] truncate line-clamp-1">
                              {topic.pinned && <Pin className="w-3 h-3 inline mr-1 text-brand-rouge" />}
                              {topic.titre}
                            </div>
                            <div className="text-xs text-[#9090A8] mt-0.5">
                              {topic.author_name ?? 'Anonyme'} · {timeAgo(topic.updated_at)} · {topic.reply_count} réponses
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA rejoindre */}
              {!user && (
                <div className="card p-5 bg-brand-rouge/[0.04] border-brand-rouge/10">
                  <MessageCircle className="w-8 h-8 text-brand-rouge mb-3" />
                  <h3 className="font-semibold text-[#1A1A24] mb-2">Rejoignez la discussion</h3>
                  <p className="text-sm text-[#5A5A6E] mb-4">
                    Créez un compte pour poster, répondre et gagner des points.
                  </p>
                  <Link href="/auth" className="btn-primary text-sm w-full justify-center py-2.5">
                    S'inscrire gratuitement
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-4">Statistiques</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5A5A6E]">Catégories</span>
                    <span className="font-semibold text-[#1A1A24]">{categories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5A5A6E]">Discussions récentes</span>
                    <span className="font-semibold text-[#1A1A24]">{recentTopics.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
