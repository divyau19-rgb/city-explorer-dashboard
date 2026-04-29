import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dataDir = path.join(process.cwd(), 'data')
    fs.mkdirSync(dataDir, { recursive: true })

    db = new Database(path.join(dataDir, 'city_explorer.db'))
    db.pragma('journal_mode = WAL')

    db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        type       TEXT    NOT NULL,
        notes      TEXT,
        city       TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }

  return db
}
