'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, MapPin, ChevronDown } from 'lucide-react'

interface Favorite {
  id:         number
  name:       string
  type:       string
  notes:      string | null
  city:       string | null
  created_at: string
}

interface Props { cityName: string }

const PLACE_TYPES = ['Park', 'Restaurant', 'Museum', 'Cafe', 'Library', 'Theater', 'Market', 'Other']

const TYPE_ICONS: Record<string, string> = {
  Park: '🌳', Restaurant: '🍽️', Museum: '🏛️', Cafe: '☕',
  Library: '📚', Theater: '🎭', Market: '🛒', Other: '📍',
}

const EMPTY_FORM = { name: '', type: 'Park', notes: '' }

export default function FavoritesManager({ cityName }: Props) {
  const [favorites,  setFavorites]  = useState<Favorite[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadFavorites() }, [])

  async function loadFavorites() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/favorites')
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      setFavorites(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading favorites')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, city: cityName }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Save failed')
      }
      const saved: Favorite = await res.json()
      setFavorites(prev => [saved, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Favourite Places</h2>
          {favorites.length > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {favorites.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors"
        >
          <Plus size={14} />
          Add Place
          <ChevronDown size={12} className={`transition-transform ${showForm ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Add a favourite in <span className="text-blue-500">{cityName}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Place name *"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PLACE_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <MapPin size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No saved places yet.</p>
          <p className="text-xs mt-1">Add your favourite parks, restaurants, and more!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl mt-0.5 shrink-0">{TYPE_ICONS[fav.type] ?? '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{fav.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fav.type}{fav.city ? ` · ${fav.city}` : ''}
                </p>
                {fav.notes && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{fav.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(fav.id)}
                title="Remove"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
