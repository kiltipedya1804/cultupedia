// src/app/leaderboard/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Trophy, Medal, Award } from 'lucide-react'
import { getLeaderboard } from '@/lib/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LEVEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  novice:  { bg: 'bg-gray-100',    text: 'text-gray-600',   label: 'Novice' },
  actif:   { bg: 'bg-blue-100',    text: 'text-blue-700',   label: 'Actif' },
  avancé:  { bg: 'bg-purple-100',  text: 'text-purple-700', label: 'Avancé' },
  expert:  { bg: 'bg-amber-100',   text: 'text-amber-700',  label: 'Expert' },
  légende: { bg: 'bg-rose-100',    text: 'text-rose-700',   label: 'Légende' },
}

export default async function LeaderboardPage() {
  const leaders = await getLeaderboard(50)

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-4xl">

          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-3">Communauté</div>
            <h1 className="font-display font-bold text-4xl text-[#1A1A24] mb-4">Classement des contributeurs</h1>
            <p className="text-[#5A5A6E] max-w-lg mx-auto">
              Les membres qui font vivre Cultupedia en partageant leur connaissance de la culture haïtienne.
            </p>
          </div>

          {leaders.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-[#9090A8] mx-auto mb-4 opacity-40" />
              <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Personne sur le podium pour l'instant</h3>
              <p className="text-[#9090A8] mb-6">Soyez le premier à contribuer !</p>
              <Link href="/contribute" className="btn-primary">Contribuer →</Link>
            </div>
          ) : (
            <>
              {/* Top 3 podium */}
              {leaders.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-10 items-end">
                  {/* 2e place */}
                  <div className="card p-6 text-center">
                    <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 mx-auto mb-3">
                      {(leaders[1].full_name ?? leaders[1].email).charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-sm text-[#1A1A24] truncate">{leaders[1].full_name ?? 'Anonyme'}</div>
                    <div className="text-2xl font-bold text-[#1A1A24] mt-1">{leaders[1].points}</div>
                    <div className="text-xs text-[#9090A8]">points</div>
                  </div>

                  {/* 1ère place */}
                  <div className="card p-6 text-center border-2 border-amber-300 -mt-4">
                    <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600 mx-auto mb-3">
                      {(leaders[0].full_name ?? leaders[0].email).charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-sm text-[#1A1A24] truncate">{leaders[0].full_name ?? 'Anonyme'}</div>
                    <div className="text-3xl font-bold text-amber-600 mt-1">{leaders[0].points}</div>
                    <div className="text-xs text-[#9090A8]">points</div>
                  </div>

                  {/* 3e place */}
                  <div className="card p-6 text-center">
                    <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 mx-auto mb-3">
                      {(leaders[2].full_name ?? leaders[2].email).charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-sm text-[#1A1A24] truncate">{leaders[2].full_name ?? 'Anonyme'}</div>
                    <div className="text-2xl font-bold text-[#1A1A24] mt-1">{leaders[2].points}</div>
                    <div className="text-xs text-[#9090A8]">points</div>
                  </div>
                </div>
              )}

              {/* Liste complète */}
              <div className="card divide-y divide-black/[0.04]">
                {leaders.map((leader, i) => {
                  const lvl = LEVEL_COLORS[leader.level] ?? LEVEL_COLORS.novice
                  return (
                    <div key={leader.id} className="flex items-center gap-4 p-4 hover:bg-black/[0.02] transition-colors">
                      <div className="w-8 text-center font-bold text-[#9090A8] flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-rouge/10 flex items-center justify-center font-bold text-brand-rouge flex-shrink-0">
                        {(leader.full_name ?? leader.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#1A1A24] truncate">{leader.full_name ?? 'Anonyme'}</div>
                        <div className="text-xs text-[#9090A8]">
                          {leader.contributions_count} contribution{leader.contributions_count > 1 ? 's' : ''}
                          {leader.approved_count > 0 && ` · ${leader.approved_count} approuvée${leader.approved_count > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${lvl.bg} ${lvl.text}`}>
                        {lvl.label}
                      </span>
                      <div className="text-right flex-shrink-0 w-16">
                        <div className="font-bold text-[#1A1A24]">{leader.points}</div>
                        <div className="text-[10px] text-[#9090A8]">points</div>
                      </div>
                      {leader.badges.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                          {leader.badges.slice(0, 3).map(b => (
                            <span key={b.id} title={b.nom} className="text-base">{b.emoji}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div className="text-center mt-12 pt-8 border-t border-black/[0.06]">
            <p className="text-[#5A5A6E] mb-4">Gagnez des points en contribuant à Cultupedia</p>
            <Link href="/contribute" className="btn-primary px-8 py-3.5 rounded-2xl">
              Commencer à contribuer →
            </Link>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
