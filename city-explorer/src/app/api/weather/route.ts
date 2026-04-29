import { NextRequest } from 'next/server'

const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear Sky',              icon: '☀️' },
  1:  { label: 'Mainly Clear',           icon: '🌤️' },
  2:  { label: 'Partly Cloudy',          icon: '⛅' },
  3:  { label: 'Overcast',               icon: '☁️' },
  45: { label: 'Foggy',                  icon: '🌫️' },
  48: { label: 'Rime Fog',               icon: '🌫️' },
  51: { label: 'Light Drizzle',          icon: '🌦️' },
  53: { label: 'Moderate Drizzle',       icon: '🌦️' },
  55: { label: 'Dense Drizzle',          icon: '🌦️' },
  61: { label: 'Slight Rain',            icon: '🌧️' },
  63: { label: 'Moderate Rain',          icon: '🌧️' },
  65: { label: 'Heavy Rain',             icon: '🌧️' },
  71: { label: 'Slight Snow',            icon: '🌨️' },
  73: { label: 'Moderate Snow',          icon: '🌨️' },
  75: { label: 'Heavy Snow',             icon: '❄️' },
  77: { label: 'Snow Grains',            icon: '🌨️' },
  80: { label: 'Slight Showers',         icon: '🌦️' },
  81: { label: 'Moderate Showers',       icon: '🌧️' },
  82: { label: 'Violent Showers',        icon: '⛈️' },
  85: { label: 'Slight Snow Showers',    icon: '🌨️' },
  86: { label: 'Heavy Snow Showers',     icon: '🌨️' },
  95: { label: 'Thunderstorm',           icon: '⛈️' },
  96: { label: 'Thunderstorm w/ Hail',   icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail',   icon: '⛈️' },
}

function wmo(code: number) {
  return WMO[code] ?? { label: 'Unknown', icon: '❓' }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat') ?? '40.7128'
  const lon = searchParams.get('lon') ?? '-74.006'

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,apparent_temperature')
  url.searchParams.set('hourly', 'temperature_2m,weathercode')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '2')

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)

    const data = await res.json()
    const { current, hourly } = data

    const currentTimeStr: string = current.time
    const startIdx = hourly.time.findIndex((t: string) => t === currentTimeStr)
    const idx = startIdx >= 0 ? startIdx : 0

    const forecast = Array.from({ length: 12 }, (_, i) => {
      const j = idx + i
      if (j >= hourly.time.length) return null
      const w = wmo(hourly.weathercode[j])
      return {
        time: hourly.time[j],
        temperature: Math.round(hourly.temperature_2m[j]),
        condition: w.label,
        icon: w.icon,
      }
    }).filter(Boolean)

    const w = wmo(current.weathercode)

    return Response.json({
      temperature: Math.round(current.temperature_2m),
      feelsLike:   Math.round(current.apparent_temperature),
      condition:   w.label,
      icon:        w.icon,
      windSpeed:   current.windspeed_10m,
      humidity:    current.relativehumidity_2m,
      unit:        data.current_units.temperature_2m,
      forecast,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Weather fetch failed', message }, { status: 502 })
  }
}
