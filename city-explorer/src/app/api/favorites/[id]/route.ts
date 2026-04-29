import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numId = Number(id)

  if (!Number.isInteger(numId) || numId <= 0) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const db = getDb()
    const result = db.prepare('DELETE FROM favorites WHERE id = ?').run(numId)

    if (result.changes === 0) {
      return Response.json({ error: 'Favorite not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: 'Failed to delete favorite', message }, { status: 500 })
  }
}
