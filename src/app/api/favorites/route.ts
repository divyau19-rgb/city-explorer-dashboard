import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM favorites ORDER BY created_at DESC').all()
    return Response.json(rows)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Failed to fetch favorites', message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string; type?: string; notes?: string; city?: string }
    const name  = body.name?.trim()
    const type  = body.type?.trim()
    const notes = body.notes?.trim() || null
    const city  = body.city?.trim()  || null

    if (!name) return Response.json({ error: 'Name is required' }, { status: 400 })
    if (!type) return Response.json({ error: 'Type is required' }, { status: 400 })

    const db = getDb()
    const result = db
      .prepare('INSERT INTO favorites (name, type, notes, city) VALUES (?, ?, ?, ?)')
      .run(name, type, notes, city)

    const row = db.prepare('SELECT * FROM favorites WHERE id = ?').get(result.lastInsertRowid)
    return Response.json(row, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Failed to save favorite', message }, { status: 500 })
  }
}
