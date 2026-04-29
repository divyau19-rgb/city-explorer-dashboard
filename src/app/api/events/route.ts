import { NextRequest } from 'next/server'

const DEMO_EVENTS = [
  { id: 1,  name: 'City Jazz Festival',     date: '2026-05-02', time: '19:00', venue: 'Central Park Amphitheater', category: 'Music',      description: 'Annual jazz festival with local and international artists.' },
  { id: 2,  name: 'Modern Art Exhibition',  date: '2026-05-03', time: '10:00', venue: 'City Art Museum',           category: 'Art',        description: 'Contemporary works from emerging local artists.' },
  { id: 3,  name: 'Food & Wine Fair',       date: '2026-05-04', time: '12:00', venue: 'Convention Center',        category: 'Food',       description: 'Sample cuisines from over 50 local restaurants.' },
  { id: 4,  name: 'Marathon City Run',      date: '2026-05-05', time: '07:00', venue: 'City Square',              category: 'Sports',     description: 'Annual 5K and 10K run through the city centre.' },
  { id: 5,  name: 'Tech Meetup: AI & Future', date: '2026-05-06', time: '18:30', venue: 'Innovation Hub',         category: 'Technology', description: 'Monthly meetup exploring the latest in AI.' },
  { id: 6,  name: 'Farmers Market',         date: '2026-05-07', time: '08:00', venue: 'Town Square',              category: 'Market',     description: 'Fresh local produce, artisan crafts, and homemade goods.' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const apiKey = process.env.TICKETMASTER_API_KEY

  if (apiKey && lat && lon) {
    try {
      const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
      url.searchParams.set('apikey', apiKey)
      url.searchParams.set('latlong', `${lat},${lon}`)
      url.searchParams.set('radius', '25')
      url.searchParams.set('unit', 'miles')
      url.searchParams.set('size', '8')
      url.searchParams.set('sort', 'date,asc')

      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) throw new Error(`Ticketmaster ${res.status}`)

      const data = await res.json()
      const events = ((data._embedded?.events as Record<string, unknown>[]) ?? []).map((e: Record<string, unknown>) => {
        const dates = e.dates as Record<string, unknown>
        const start = dates?.start as Record<string, unknown>
        const embedded = e._embedded as Record<string, unknown>
        const venues = embedded?.venues as Record<string, unknown>[]
        const classifications = e.classifications as Record<string, unknown>[]
        const images = e.images as Record<string, unknown>[]
        return {
          id:       e.id,
          name:     e.name,
          date:     start?.localDate,
          time:     (start?.localTime as string)?.slice(0, 5),
          venue:    venues?.[0]?.name,
          category: (classifications?.[0]?.segment as Record<string, unknown>)?.name,
          url:      e.url,
          image:    images?.[0]?.url,
        }
      })

      return Response.json({ events, source: 'ticketmaster' })
    } catch (err) {
      console.error('Ticketmaster error:', err)
    }
  }

  return Response.json({
    events: DEMO_EVENTS,
    source: 'demo',
    notice: 'Add TICKETMASTER_API_KEY to .env.local for real events',
  })
}
