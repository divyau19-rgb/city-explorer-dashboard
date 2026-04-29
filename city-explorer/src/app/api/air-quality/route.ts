import { NextRequest } from 'next/server'

function aqiCategory(aqi: number): { label: string; color: string } {
  if (aqi <= 50)  return { label: 'Good',                            color: 'green'  }
  if (aqi <= 100) return { label: 'Moderate',                        color: 'yellow' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups',  color: 'orange' }
  if (aqi <= 200) return { label: 'Unhealthy',                       color: 'red'    }
  if (aqi <= 300) return { label: 'Very Unhealthy',                  color: 'purple' }
  return                  { label: 'Hazardous',                      color: 'maroon' }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat') ?? '40.7128'
  const lon = searchParams.get('lon') ?? '-74.006'

  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone')
  url.searchParams.set('timezone', 'auto')

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`Open-Meteo AQ ${res.status}`)

    const data = await res.json()
    const c = data.current
    const aqi: number = c.us_aqi ?? 0
    const { label, color } = aqiCategory(aqi)

    return Response.json({
      aqi,
      category: label,
      color,
      pollutants: {
        pm25:  c.pm2_5            != null ? Number(c.pm2_5.toFixed(1))            : null,
        pm10:  c.pm10             != null ? Number(c.pm10.toFixed(1))             : null,
        no2:   c.nitrogen_dioxide != null ? Number(c.nitrogen_dioxide.toFixed(1)) : null,
        ozone: c.ozone            != null ? Number(c.ozone.toFixed(1))            : null,
        co:    c.carbon_monoxide  != null ? Number(c.carbon_monoxide.toFixed(1))  : null,
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Air quality fetch failed', message }, { status: 502 })
  }
}
