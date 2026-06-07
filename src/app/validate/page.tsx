'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Entry } from '@/types'

export default function ValidatePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/entries?limit=50')
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des entrées')
    } finally {
      setLoading(false)
    }
  }

  const currentEntry = entries[currentIndex]

  const handleValidate = async (approved: boolean) => {
    try {
      const res = await fetch(`/api/entries/${currentEntry.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (res.ok) {
        toast.success(approved ? 'Entrée validée ✓' : 'Entrée rejetée')
        setCurrentIndex(currentIndex + 1)
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-300 border-t-yellow-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!currentEntry || currentIndex >= entries.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Bravo! 🎉</h2>
          <p className="text-slate-600 mb-6">
            Vous avez validé {currentIndex} entrées. Merci pour votre contribution!
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0)
              fetchEntries()
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-900 font-playfair">Validation des entrées</h2>
            <span className="text-sm text-slate-600">
              {currentIndex + 1} / {entries.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / entries.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Entry Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentEntry.nom}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                    {currentEntry.discipline}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {currentEntry.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Lieu</p>
                <p className="text-slate-900">{currentEntry.ville}, {currentEntry.pays}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Année</p>
                <p className="text-slate-900">{currentEntry.annee || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-2">Description</p>
              <p className="text-slate-900 leading-relaxed">{currentEntry.description}</p>
            </div>
          </div>

          {/* Validation Criteria */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-slate-900 mb-4">Critères de validation</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-600" defaultChecked />
                <span className="ml-3 text-sm text-slate-700">Nom exacte et complet</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-600" />
                <span className="ml-3 text-sm text-slate-700">Discipline correcte</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-600" />
                <span className="ml-3 text-sm text-slate-700">Dates/années valides</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-600" />
                <span className="ml-3 text-sm text-slate-700">Localisation correcte</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-600" />
                <span className="ml-3 text-sm text-slate-700">Description appropriée</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => handleValidate(false)}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-lg transition"
            >
              ❌ Rejeter
            </button>
            <button
              onClick={() => handleValidate(true)}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition"
            >
              ✅ Approuver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
