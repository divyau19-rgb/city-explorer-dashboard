'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, X } from 'lucide-react'

export interface CityResult {
  id: number
  name: string
  country: string
  admin1: string
  lat: number
  lon: number
}

interface Props {
  currentCity: CityResult
  onSelect: (city: CityResult) => void
}

export default function CitySearch({ currentCity, onSelect }: Props) {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState<CityResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open,      setOpen]      = useState(false)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim()) { setResults([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(val)}`)
        const data: CityResult[] = await res.json()
        setResults(Array.isArray(data) ? data : [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function handleSelect(city: CityResult) {
    onSelect(city)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const placeholder = [currentCity.name, currentCity.country].filter(Boolean).join(', ')

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 focus-within:ring-2 focus-within:ring-blue-500 transition">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Search city"
          className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
        {searching && (
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }} aria-label="Clear">
            <X size={12} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {results.map(city => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium leading-tight">{city.name}</p>
                <p className="text-xs text-gray-400">{[city.admin1, city.country].filter(Boolean).join(', ')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
