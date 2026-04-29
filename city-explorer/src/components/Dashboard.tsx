'use client'

import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import CitySearch, { type CityResult } from './CitySearch'
import LiveClock from './LiveClock'
import WeatherWidget from './WeatherWidget'
import AirQualityWidget from './AirQualityWidget'
import EventsWidget from './EventsWidget'
import FavoritesManager from './FavoritesManager'

const DEFAULT_CITY: CityResult = {
  id: 0,
  name: 'New York',
  country: 'United States',
  admin1: 'New York',
  lat: 40.7128,
  lon: -74.006,
}

export default function Dashboard() {
  const [city,     setCity]     = useState<CityResult>(DEFAULT_CITY)
  const [darkMode, setDarkMode] = useState(false)

  function handleSelect(c: CityResult) {
    setCity(c)
    document.documentElement.classList.toggle('dark', darkMode)
  }

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-2xl">🌆</span>
              <span className="text-lg font-bold hidden sm:block">City Explorer</span>
            </div>

            <CitySearch currentCity={city} onSelect={handleSelect} />

            <div className="flex items-center gap-4 shrink-0">
              <LiveClock />
              <button
                onClick={toggleDark}
                title="Toggle dark mode"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing live data for{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {city.name}{city.country ? `, ${city.country}` : ''}
            </span>
          </p>

          {/* Top widgets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <WeatherWidget    lat={city.lat} lon={city.lon} />
            <AirQualityWidget lat={city.lat} lon={city.lon} />
            <EventsWidget     lat={city.lat} lon={city.lon} />
          </div>

          {/* Favorites full-width */}
          <FavoritesManager cityName={city.name} />
        </main>

        <footer className="text-center text-xs text-gray-400 py-6">
          Weather & Air Quality data from{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Open-Meteo</a>
          {' '}· Events from Ticketmaster (demo mode)
        </footer>
      </div>
    </div>
  )
}
