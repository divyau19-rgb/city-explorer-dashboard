import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) return Response.json({ error: 'Query required' }, { status: 400 })

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', q)
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`Geocoding ${res.status}`)

    const data = await res.json()

    const results = (data.results ?? []).map((r: Record<string, unknown>) => ({
      id:      r.id,
      name:    r.name,
      country: r.country,
      admin1:  r.admin1,
      lat:     r.latitude,
      lon:     r.longitude,
    }))

    return Response.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Geocoding failed', message }, { status: 502 })
  }
}
