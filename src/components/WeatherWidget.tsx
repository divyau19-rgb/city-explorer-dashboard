'use client'

import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import WidgetCard from './WidgetCard'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

const TEN_MINUTES = 10 * 60 * 1000

interface HourlyPoint {
  time: string
  temperature: number
  condition: string
  icon: string
}

interface WeatherData {
  temperature: number
  feelsLike:   number
  condition:   string
  icon:        string
  windSpeed:   number
  humidity:    number
  unit:        string
  forecast:    HourlyPoint[]
  updatedAt:   string
}

interface Props { lat: number; lon: number }

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`Weather unavailable (${res.status})`)
  return res.json()
}

export default function WeatherWidget({ lat, lon }: Props) {
  const { data, loading, error, lastUpdated, refresh } = useAutoRefresh(
    () => fetchWeather(lat, lon),
    TEN_MINUTES,
    `${lat},${lon}`,
  )

  const chartData = data?.forecast?.map(h => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    temp: h.temperature,
  })) ?? []

  return (
    <WidgetCard
      title="Weather"
      icon="🌤️"
      onRefresh={refresh}
      lastUpdated={lastUpdated}
      loading={loading}
      error={error}
    >
      {data && (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-light">{data.temperature}{data.unit}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                  Feels {data.feelsLike}{data.unit}
                </span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                {data.icon} {data.condition}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
              <div>💨 {data.windSpeed} km/h</div>
              <div>💧 {data.humidity}%</div>
            </div>
          </div>

          {chartData.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                12-Hour Forecast
              </p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    interval={2}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    formatter={(v) => [`${v}°`, 'Temp']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
