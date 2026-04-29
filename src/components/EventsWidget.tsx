'use client'

import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import WidgetCard from './WidgetCard'
import { ExternalLink } from 'lucide-react'

const ONE_HOUR = 60 * 60 * 1000

interface Event {
  id:          string | number
  name:        string
  date?:       string
  time?:       string
  venue?:      string
  category?:   string
  description?: string
  url?:        string
}

interface EventsResponse {
  events: Event[]
  source: 'ticketmaster' | 'demo'
  notice?: string
}

interface Props { lat: number; lon: number }

const CATEGORY_COLORS: Record<string, string> = {
  Music:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Sports:     'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  Art:        'bg-pink-100   text-pink-700   dark:bg-pink-900/30   dark:text-pink-300',
  Food:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Technology: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  Market:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

async function fetchEvents(lat: number, lon: number): Promise<EventsResponse> {
  const res = await fetch(`/api/events?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`Events unavailable (${res.status})`)
  return res.json()
}

export default function EventsWidget({ lat, lon }: Props) {
  const { data, loading, error, lastUpdated, refresh } = useAutoRefresh(
    () => fetchEvents(lat, lon),
    ONE_HOUR,
    `${lat},${lon}`,
  )

  return (
    <WidgetCard
      title="City Events"
      icon="🎭"
      onRefresh={refresh}
      lastUpdated={lastUpdated}
      loading={loading}
      error={error}
    >
      {data && (
        <div className="space-y-3">
          {data.source === 'demo' && (
            <p className="text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
              📋 Demo events — add <code className="font-mono">TICKETMASTER_API_KEY</code> to .env.local for live data
            </p>
          )}

          {data.events.slice(0, 6).map(event => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-medium text-sm truncate">{event.name}</p>
                  {event.category && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[event.category] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {event.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {[event.date, event.time, event.venue].filter(Boolean).join(' · ')}
                </p>
              </div>
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors mt-0.5"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
