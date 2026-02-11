# Ambience AI - AI-Powered Ambient Music Platform

A production-ready, full-stack web application for generating real-time, context-aware ambient music for commercial venues. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Landing Page** — Beautiful marketing page with feature highlights and CTAs
- **Authentication** — Login/Register with JWT tokens, password validation, RBAC roles
- **Dashboard** — Overview with stats, active venues, playback controls, genre distribution
- **Venue Management** — CRUD operations, music configuration, genre/tempo/energy controls
- **Playback Controls** — Start/stop music per venue, volume control, now-playing display
- **Analytics** — Charts for weekly playback, genre distribution, hourly activity, venue performance
- **Scheduling** — Day-part scheduling with day/time/genre/tempo/energy configuration
- **Environment Monitoring** — Real-time sensor data (temperature, humidity, crowd density, light)
- **Settings** — Profile, organization, billing plans, security (2FA), notifications

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **Icons:** Lucide React
- **Charts:** Recharts
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **State:** React Context + useReducer

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Demo Credentials

- **Email:** admin@ambienceai.com
- **Password:** Admin@123

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── api/auth/        # Auth API routes (login, register)
│   ├── dashboard/       # Dashboard pages
│   │   ├── analytics/   # Analytics with charts
│   │   ├── environment/ # Environment sensor data
│   │   ├── schedules/   # Day-part scheduling
│   │   ├── settings/    # Account settings
│   │   └── venues/      # Venue management
│   ├── globals.css      # Global styles & theme
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── layout/          # Sidebar, Header
│   ├── ui/              # Button, Card, Input, Badge, Slider, Select
│   └── providers.tsx    # App context provider
├── lib/
│   ├── auth.ts          # JWT & password utilities
│   ├── mock-data.ts     # Demo data for all entities
│   ├── store.ts         # Global state management
│   └── utils.ts         # Utility functions
└── types/
    └── index.ts         # TypeScript type definitions
```

## API Endpoints

| Method | Endpoint          | Description       | Auth |
|--------|-------------------|-------------------|------|
| POST   | /api/auth/login   | User login        | No   |
| POST   | /api/auth/register| User registration | No   |

## Architecture (per PRD)

The platform is designed as a microservices architecture with 10 core services. This MVP implements the web dashboard frontend with mock data, ready to connect to backend services:

- **api-gateway** (Kong) — Routing, auth, rate limiting
- **auth-service** (Node.js) — User authentication, JWT
- **venue-service** (Node.js) — Venue CRUD, config
- **music-generation** (Python) — AI music generation
- **streaming-service** (Go) — Audio streaming HLS
- **analytics-service** (Node.js) — Metrics, dashboards
- **environment-service** (Node.js) — Sensor data processing
- **scheduler-service** (Node.js) — Scheduling, cron jobs
- **integration-service** (Node.js) — POS/CRM integrations
- **notification-service** (Node.js) — Email, SMS, push
