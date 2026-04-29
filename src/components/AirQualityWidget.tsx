'use client'

import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import WidgetCard from './WidgetCard'

const FIFTEEN_MINUTES = 15 * 60 * 1000

interface AQData {
  aqi:       number
  category:  string
  color:     string
  pollutants: {
    pm25:  number | null
    pm10:  number | null
    no2:   number | null
    ozone: number | null
    co:    number | null
  }
}

interface Props { lat: number; lon: number }

const COLOR_CLASSES: Record<string, string> = {
  green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  maroon: 'bg-red-200    text-red-900    dark:bg-red-900/40    dark:text-red-200',
}

const POLLUTANTS = [
  { key: 'pm25'  as const, label: 'PM₂.₅', unit: 'μg/m³' },
  { key: 'pm10'  as const, label: 'PM₁₀',  unit: 'μg/m³' },
  { key: 'no2'   as const, label: 'NO₂',   unit: 'μg/m³' },
  { key: 'ozone' as const, label: 'Ozone', unit: 'μg/m³' },
]

async function fetchAQ(lat: number, lon: number): Promise<AQData> {
  const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`Air quality unavailable (${res.status})`)
  return res.json()
}

export default function AirQualityWidget({ lat, lon }: Props) {
  const { data, loading, error, lastUpdated, refresh } = useAutoRefresh(
    () => fetchAQ(lat, lon),
    FIFTEEN_MINUTES,
    `${lat},${lon}`,
  )

  const colorCls = data ? (COLOR_CLASSES[data.color] ?? COLOR_CLASSES.green) : ''

  return (
    <WidgetCard
      title="Air Quality"
      icon="🌬️"
      onRefresh={refresh}
      lastUpdated={lastUpdated}
      loading={loading}
      error={error}
    >
      {data && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl font-bold shrink-0 ${colorCls}`}>
              <span className="text-2xl leading-none">{data.aqi}</span>
              <span className="text-xs mt-0.5">AQI</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{data.category}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">US Air Quality Index</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {POLLUTANTS.map(({ key, label, unit }) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-sm">
                  {data.pollutants[key] ?? '—'}
                  <span className="text-xs text-gray-400 ml-1">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
