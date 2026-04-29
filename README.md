# City Explorer Dashboard

A full-stack dashboard showing live city information — weather, air quality, events, and a personal favourites manager — built with **Next.js 16**, **React 19**, **SQLite**, and free public APIs.

## Features

| Widget | Data source | Refresh |
|---|---|---|
| 🌤️ Weather | Open-Meteo (free, no key) | Every 10 min |
| 🌬️ Air Quality | Open-Meteo AQ (free, no key) | Every 15 min |
| 🎭 City Events | Ticketmaster (optional key) or demo data | Every hour |
| ⭐ Favourites | Local SQLite database | On interaction |
| 🕐 Live Clock | Browser | Every second |

**Bonus features:** city search, dark mode, hourly temperature chart.

## Tech Stack

- **Frontend:** Next.js 16 App Router + React 19 Server & Client Components
- **Styling:** Tailwind CSS v4
- **Backend:** Next.js Route Handlers (no separate server needed)
- **Database:** SQLite via `better-sqlite3`
- **Charts:** Recharts
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js 18+

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: real city events

Copy `.env.local.example` to `.env.local` and add a free Ticketmaster API key:

```bash
cp .env.local.example .env.local
```

Get a free key at [developer.ticketmaster.com](https://developer.ticketmaster.com/) — no credit card required.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Dashboard entry point
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Tailwind v4 + dark mode config
│   └── api/
│       ├── weather/route.ts      # GET /api/weather
│       ├── air-quality/route.ts  # GET /api/air-quality
│       ├── events/route.ts       # GET /api/events
│       ├── geocoding/route.ts    # GET /api/geocoding
│       └── favorites/
│           ├── route.ts          # GET + POST /api/favorites
│           └── [id]/route.ts     # DELETE /api/favorites/:id
├── components/
│   ├── Dashboard.tsx             # City state + layout shell
│   ├── WeatherWidget.tsx
│   ├── AirQualityWidget.tsx
│   ├── EventsWidget.tsx
│   ├── FavoritesManager.tsx
│   ├── LiveClock.tsx
│   ├── CitySearch.tsx
│   └── WidgetCard.tsx
├── hooks/
│   └── useAutoRefresh.ts         # Generic polling hook
└── lib/
    └── db.ts                     # SQLite singleton
data/                             # SQLite database (git-ignored)
```

## Database Schema

```sql
CREATE TABLE favorites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  type       TEXT    NOT NULL,
  notes      TEXT,
  city       TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/weather?lat=&lon=` | Current weather + 12h forecast |
| GET | `/api/air-quality?lat=&lon=` | US AQI + pollutant breakdown |
| GET | `/api/events?lat=&lon=` | Upcoming city events |
| GET | `/api/geocoding?q=` | City search autocomplete |
| GET | `/api/favorites` | List saved places |
| POST | `/api/favorites` | Add a favourite place |
| DELETE | `/api/favorites/:id` | Remove a favourite place |
