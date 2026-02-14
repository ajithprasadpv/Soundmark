# Soundmark — AI-Powered Ambient Music Platform

**Version:** 1.0.0 | **Stack:** Next.js 16 · TypeScript 5.9 · TailwindCSS v4 · AWS S3
**Platform:** Web Dashboard + REST API + Android TV Companion App
**Purpose:** Context-aware ambient music management for commercial venues (restaurants, cafes, hotels, retail, spas, gyms, offices, bars)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [Demo Credentials](#3-demo-credentials)
4. [Environment Variables](#4-environment-variables)
5. [Directory Structure](#5-directory-structure)
6. [Architecture](#6-architecture)
7. [Data Models (LLD)](#7-data-models-lld)
8. [API Reference (LLD)](#8-api-reference-lld)
9. [Global State Management](#9-global-state-management)
10. [Audio Systems (LLD)](#10-audio-systems-lld)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Music Library & S3 Organization](#12-music-library--s3-organization)
13. [External Integrations](#13-external-integrations)
14. [Analytics & Tracking](#14-analytics--tracking)
15. [Scheduling Engine](#15-scheduling-engine)
16. [Device Management (Android TV)](#16-device-management-android-tv)
17. [Subscription Tiers & Billing](#17-subscription-tiers--billing)
18. [Component Hierarchy](#18-component-hierarchy)
19. [Mock Data](#19-mock-data)
20. [Dependencies](#20-dependencies)
21. [Deployment](#21-deployment)
22. [Known Limitations & Roadmap](#22-known-limitations--roadmap)

---

## 1. Overview

Soundmark is a full-stack SaaS platform that delivers AI-curated ambient music to commercial venues. Venue managers control music via a web dashboard; music plays on Android TV boxes physically installed in venues. The platform integrates real weather data, mood selection, and time-based scheduling to continuously adapt the music atmosphere.

**Key capabilities:**
- Multi-venue management with per-venue genre/tempo/energy configuration
- Real-time remote control of Android TV boxes via a cloud polling protocol
- S3-backed multilingual music catalog (English, Hindi, Spanish, Arabic, African, Indian Regional/Instrumental)
- Copyright-free music via Jamendo and ccMixter APIs
- Procedural ambient music synthesis using Web Audio API (fallback)
- Client-side analytics with playback tracking
- Role-based access control across five user roles
- Time-based day-part scheduling

---

## 2. Quick Start

```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type-check only
npx tsc --noEmit
```

App runs at `http://localhost:3000` by default.

---

## 3. Demo Credentials

| Role         | Email                       | Password    |
|--------------|-----------------------------|-------------|
| Super Admin  | `superadmin@soundmark.app`  | `Admin@123` |
| Admin        | `admin@soundmark.app`       | `Admin@123` |

---

## 4. Environment Variables

Create `.env.local` in the project root:

```env
# JWT signing secret (change in production)
JWT_SECRET=soundmark-secret-key-change-in-production

# AWS S3 – music storage
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=soundmark-music

# Optional: CloudFront CDN domain for music streaming
# If set, stream URLs use CloudFront; otherwise presigned S3 URLs are used
CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net
```

---

## 5. Directory Structure

```
ambience-ai/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (auth)/                     # Route group – unauthenticated
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login form
│   │   │   └── register/
│   │   │       └── page.tsx            # Registration form
│   │   ├── admin/                      # Admin-only pages
│   │   │   ├── layout.tsx              # Admin shell layout
│   │   │   ├── page.tsx                # Admin dashboard (org overview)
│   │   │   ├── users/
│   │   │   │   └── page.tsx            # User management (create/suspend/role)
│   │   │   └── subscriptions/
│   │   │       └── page.tsx            # Subscription tracking by org
│   │   ├── dashboard/                  # Authenticated user area
│   │   │   ├── layout.tsx              # Dashboard shell (sidebar + header)
│   │   │   ├── page.tsx                # Home: stats, active venues, mood picker
│   │   │   ├── devices/
│   │   │   │   └── page.tsx            # Android TV device management
│   │   │   ├── venues/
│   │   │   │   └── page.tsx            # Venue CRUD + music configuration
│   │   │   ├── schedules/
│   │   │   │   └── page.tsx            # Day-part schedule rules
│   │   │   ├── music-library/
│   │   │   │   └── page.tsx            # S3 catalog browser + upload
│   │   │   ├── music-sources/
│   │   │   │   └── page.tsx            # Jamendo / ccMixter source config
│   │   │   ├── customer-mapping/
│   │   │   │   └── page.tsx            # Org → allowed genres/license mapping
│   │   │   ├── environment/
│   │   │   │   └── page.tsx            # Weather + environmental sensor data
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx            # Playback charts, trends, proof-of-play
│   │   │   ├── proof-of-play/
│   │   │   │   └── page.tsx            # Compliance reports (PDF export)
│   │   │   └── settings/
│   │   │       └── page.tsx            # Profile, billing, security, notifications
│   │   ├── api/                        # Next.js API routes (serverless)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # POST – user login
│   │   │   │   └── register/route.ts   # POST – user registration
│   │   │   ├── devices/
│   │   │   │   ├── route.ts            # GET/POST/PATCH/DELETE – device CRUD
│   │   │   │   └── poll/route.ts       # POST – Android TV polling endpoint
│   │   │   ├── music/
│   │   │   │   ├── library/route.ts    # GET/DELETE – S3 catalog
│   │   │   │   ├── upload/route.ts     # POST – presigned S3 upload URLs
│   │   │   │   ├── stream/
│   │   │   │   │   └── [key]/route.ts  # GET – stream redirect (S3/CloudFront)
│   │   │   │   ├── jamendo/route.ts    # GET – Jamendo API proxy
│   │   │   │   └── ccmixter/route.ts   # GET – ccMixter API proxy
│   │   │   └── weather/route.ts        # GET – OpenMeteo weather data
│   │   ├── globals.css                 # CSS custom properties, Tailwind base
│   │   ├── layout.tsx                  # Root HTML layout, ThemeProvider
│   │   └── page.tsx                    # Landing/marketing page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx              # Top bar: title, user menu
│   │   │   ├── sidebar.tsx             # Left nav: icon + label items
│   │   │   └── audio-player-bar.tsx    # Persistent now-playing bar at bottom
│   │   ├── ui/                         # Primitive UI components
│   │   │   ├── button.tsx              # Variants: default, outline, ghost, destructive
│   │   │   ├── card.tsx                # Card, CardHeader, CardContent, CardFooter
│   │   │   ├── input.tsx               # Styled text input
│   │   │   ├── select.tsx              # Dropdown select
│   │   │   ├── slider.tsx              # Range slider (volume, tempo, energy)
│   │   │   ├── badge.tsx               # Status/label badges
│   │   │   └── ...                     # Other utility components
│   │   ├── providers.tsx               # AppStateProvider + ThemeProvider wrapper
│   │   ├── theme-provider.tsx          # Dark/light theme toggle
│   │   └── sidebar-context.tsx         # Sidebar open/close state
│   ├── hooks/
│   │   └── useAudio.ts                 # Audio engine hook (connect to v2 engine)
│   ├── lib/
│   │   ├── auth.ts                     # JWT sign/verify, bcrypt hash/compare, validation
│   │   ├── s3.ts                       # AWS S3 client, presigned URLs, list/delete
│   │   ├── device-store.ts             # In-memory device registry (Map)
│   │   ├── audio-engine.ts             # Web Audio API synthesizer (15 genre presets)
│   │   ├── audio-engine-v2.ts          # HTML5 Audio multi-venue player
│   │   ├── jamendo.ts                  # Jamendo + ccMixter fetch, normalizer
│   │   ├── analytics-tracker.ts        # Client-side play event tracker (localStorage)
│   │   ├── store.ts                    # Global Context + Reducer state
│   │   ├── mock-data.ts                # Seeded demo data
│   │   └── utils.ts                    # cn() class merger + misc helpers
│   └── types/
│       └── index.ts                    # All TypeScript interfaces and enums
├── public/                             # Static assets
├── package.json
├── tsconfig.json                       # strict: true, path alias @/*
├── next.config.ts
└── postcss.config.mjs
```

---

## 6. Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Web Dashboard)                    │
│  Next.js 16 App Router · React 19 · TailwindCSS v4           │
│  Context + Reducer State · Web Audio API / HTML5 Audio        │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────────┐
│               Next.js API Routes (Serverless)                 │
│  /api/auth   /api/devices   /api/music   /api/weather         │
│  JWT Validation · AWS SDK · In-memory device store            │
└───────┬──────────────────┬───────────────────┬───────────────┘
        │                  │                   │
┌───────▼──────┐  ┌────────▼───────┐  ┌───────▼────────┐
│   AWS S3     │  │  Jamendo API   │  │  OpenMeteo API │
│  Music store │  │  ccMixter API  │  │  Weather data  │
│  Presigned   │  │  CC-licensed   │  │  (free, no key)│
│  URLs + CDN  │  │  tracks        │  └────────────────┘
└──────────────┘  └────────────────┘

        │ REST polling every 3s
┌───────▼──────────────────────────────────────────────────────┐
│              Android TV Boxes (per venue)                     │
│  Kotlin · ExoPlayer (Media3) · Foreground Service             │
│  Pairing · Command execution · Status reporting               │
└──────────────────────────────────────────────────────────────┘
```

### Request Flow – Dashboard to TV Box

```
User clicks "Play Jazz" on venue card
         │
         ▼
PATCH /api/devices
{ deviceId, action: "send_command", commandType: "set_genre",
  commandPayload: { genre: "jazz" } }
         │
         ▼
device-store.ts: set pendingCommand on DeviceRecord
         │
         ▼ (within 3s)
Android TV polls POST /api/devices/poll
{ action: "poll", deviceId, status: {...} }
         │
         ▼
Server returns { command: { type: "set_genre", payload: { genre: "jazz" } } }
         │
         ▼
TV app changes genre in ExoPlayer playlist, starts playback
         │
         ▼
TV acks: POST /api/devices/poll { action: "ack", deviceId, commandId }
         │
         ▼
device-store.ts: command.acknowledged = true
```

---

## 7. Data Models (LLD)

All types are defined in `src/types/index.ts`.

### User & Organization

```typescript
type UserRole = 'super_admin' | 'admin' | 'owner' | 'manager' | 'staff'
type UserStatus = 'active' | 'inactive' | 'suspended'
type PlanType = 'starter' | 'professional' | 'enterprise'
type SubscriptionStatus = 'trial' | 'active' | 'cancelled'

interface User {
  id: string                  // uuid
  email: string
  name: string
  role: UserRole
  status: UserStatus
  organizationId?: string     // null for super_admin
  createdAt: string           // ISO 8601
  updatedAt: string
}

interface Organization {
  id: string
  name: string
  ownerId: string             // User.id
  planType: PlanType
  subscriptionStatus: SubscriptionStatus
  createdAt: string
}
```

### Venue

```typescript
type VenueType = 'restaurant' | 'cafe' | 'hotel' | 'retail' | 'spa'
               | 'gym' | 'office' | 'bar' | 'lounge' | 'other'
type VenueStatus = 'active' | 'inactive' | 'setup'

interface Venue {
  id: string
  organizationId: string
  name: string
  venueType: VenueType
  address: string
  city: string
  state: string
  country: string
  latitude?: number           // For weather geo-lookup
  longitude?: number
  timezone: string            // e.g. "America/Los_Angeles"
  status: VenueStatus
  createdAt: string
  updatedAt: string
  configuration?: VenueConfiguration
}

interface VenueConfiguration {
  id: string
  venueId: string
  preferredGenres: string[]
  tempoRange: { min: number; max: number }   // BPM
  valenceRange: { min: number; max: number } // 0.0 – 1.0  (sad → happy)
  energyRange: { min: number; max: number }  // 0.0 – 1.0  (calm → intense)
  volumeLevel: number                        // 0 – 100
}
```

### Music Tracks

```typescript
type LicenseType = 'copyright-free' | 'copyrighted'

// Used in the S3 music library
interface MusicTrack {
  id: string
  title: string
  artist: string
  genre: string
  subGenre?: string
  licenseType: LicenseType
  bpm: number
  key: string                 // e.g. "C major"
  valence: number             // 0.0 – 1.0
  energy: number              // 0.0 – 1.0
  duration: number            // seconds
  fileUrl: string             // S3 key or external URL
  coverUrl?: string
  tags: string[]
  status: 'active' | 'inactive' | 'processing'
  allowedPlans: PlanType[]    // Controls plan-gated access
  playCount: number
  uploadedAt: string
  uploadedBy: string          // User.id
}

// Used by audio-engine-v2 (Jamendo/ccMixter/S3 unified)
interface MusicTrackResult {
  id: string
  title: string
  artist: string
  audioUrl: string
  genre: string
  language?: string
  source: 'jamendo' | 'ccmixter' | 's3'
  duration?: number
}

// Playback state per venue
interface PlaybackState {
  venueId: string
  isPlaying: boolean
  currentTrack?: Track        // Synthesized track metadata
  volume: number
  startedAt?: string
}

// Synthesized track descriptor (audio-engine v1)
interface Track {
  id: string
  title: string
  genre: string
  bpm: number
  key: string
  valence: number
  energy: number
  duration: number
  generatedAt: string
}
```

### Schedules

```typescript
interface Schedule {
  id: string
  venueId: string
  name: string
  dayOfWeek: number[]         // 0=Sun … 6=Sat (multiple days per schedule)
  startTime: string           // "HH:MM" 24-hour
  endTime: string             // "HH:MM" 24-hour
  genres: string[]
  tempoRange: { min: number; max: number }
  energyRange: { min: number; max: number }
  isActive: boolean
}
```

### Device Management

```typescript
interface DeviceRecord {
  id: string                  // "dev_" + uuid prefix
  name: string                // Human label (e.g. "Cafe Counter TV")
  pairingCode: string         // 6-digit numeric string
  venueId: string | null      // null until venue assigned
  organizationId: string
  paired: boolean             // true after TV enters pairing code
  online: boolean             // heartbeat within last 60s
  lastHeartbeat: number       // Date.now() milliseconds
  registeredAt: string        // ISO 8601
  pendingCommand: DeviceCommand | null
  status: DeviceStatus | null // Last reported status from TV
}

interface DeviceCommand {
  id: string
  type: 'play' | 'pause' | 'stop' | 'skip_next' | 'skip_prev'
      | 'set_volume' | 'set_genre' | 'set_playlist'
  payload: Record<string, unknown>
  issuedAt: number            // Date.now()
  acknowledged: boolean
}

interface DeviceStatus {
  isPlaying: boolean
  trackName: string | null
  artistName: string | null
  albumImage: string | null
  genre: string | null
  volume: number              // 0 – 100
  currentTime: number         // seconds
  duration: number            // seconds
  source: string | null       // "jamendo", "s3", etc.
  updatedAt: number           // Date.now()
}
```

### Music Sources & Customer Mapping

```typescript
type MusicSourceStatus = 'active' | 'disabled' | 'error'

interface MusicSource {
  id: string
  name: string                // e.g. "Jamendo Music"
  provider: string
  description: string
  apiEndpoint: string         // e.g. "/api/music/jamendo"
  iconUrl?: string
  status: MusicSourceStatus
  licenseType: LicenseType
  supportedGenres: string[]
  tracksAvailable: number
  tracksUsed: number
  lastSyncAt: string
  addedAt: string
  addedBy: string
}

// Controls which genres & licenses each org can access
interface CustomerMusicMapping {
  id: string
  organizationId: string
  organizationName: string
  planType: PlanType
  subscriptionStatus: SubscriptionStatus
  allowedLicenseTypes: LicenseType[]
  allowedGenres: string[]
  customTrackIds?: string[]   // Explicit track whitelist (Enterprise)
  maxConcurrentVenues: number
  createdAt: string
  updatedAt: string
}
```

### Analytics

```typescript
interface AnalyticsData {
  totalVenues: number
  activeVenues: number
  totalPlaybackHours: number
  avgSatisfactionScore: number
  tracksGenerated: number
  peakHour: string            // e.g. "7 PM"
  dailyPlayback: { date: string; hours: number }[]
  genreDistribution: { genre: string; percentage: number }[]
  venueActivity: { venue: string; hours: number; tracks: number }[]
  hourlyActivity: { hour: string; venues: number }[]
}

// Client-side computed analytics (from localStorage events)
interface ComputedAnalytics {
  totalPlaybackHours: number
  tracksPlayed: number
  genreDistribution: { genre: string; percentage: number }[]
  dailyPlayback: { date: string; hours: number }[]
  peakHour: string
  recentTracks: PlayEvent[]
}

interface PlayEvent {
  id: string
  trackTitle: string
  artist: string
  genre: string
  language?: string
  source: 's3' | 'venue'
  durationSec: number
  playedAt: string            // ISO 8601
}
```

### Environment & Weather

```typescript
interface EnvironmentData {
  venueId: string
  temperature: number         // °C
  humidity: number            // %
  noiseLevel: number          // dB
  crowdDensity: number        // %
  lightLevel: number          // lux
  co2Level: number            // ppm
  timestamp: string
}

interface WeatherData {
  temperature: number         // °C
  feelsLike: number
  humidity: number
  windSpeed: number           // km/h
  condition: string           // e.g. "Partly Cloudy"
  icon: string                // Emoji icon
  isDay: boolean
}
```

---

## 8. API Reference (LLD)

All endpoints are Next.js App Router route handlers under `src/app/api/`.

### Authentication

#### `POST /api/auth/login`

Authenticates a user. Currently validates against hardcoded demo users.

**Request body:**
```json
{ "email": "admin@soundmark.app", "password": "Admin@123" }
```

**Response 200:**
```json
{
  "data": {
    "user": { "id": "1", "email": "...", "name": "...", "role": "admin" },
    "accessToken": "<JWT 15min>",
    "refreshToken": "<JWT 30d>"
  }
}
```

**Response 401:**
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }
```

#### `POST /api/auth/register`

Creates a new user account.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecureP@ss1",
  "organization": "My Cafe"   // optional
}
```

**Password validation rules (enforced in `lib/auth.ts`):**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (`!@#$%^&*`)

**Response 201:** `{ "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }`

---

### Device Management

#### `GET /api/devices?orgId=<id>`

Returns all devices for an organization. Marks devices offline if `lastHeartbeat` is older than 60 seconds.

**Response 200:**
```json
{ "devices": [ DeviceRecord, ... ] }
```

#### `POST /api/devices`

Registers a new Android TV device.

**Request body:** `{ "name": "Lobby TV", "organizationId": "org_1" }`

**Logic:**
1. Generate UUID prefixed `dev_`
2. Generate random 6-digit pairing code (100000–999999)
3. Store in `deviceStore` Map (module-level singleton)

**Response 201:** `{ "device": DeviceRecord }`

#### `PATCH /api/devices`

Three operations controlled by the `action` field:

| action | Additional fields | Effect |
|--------|------------------|--------|
| `assign_venue` | `venueId` | Sets `device.venueId` |
| `unassign_venue` | — | Sets `device.venueId = null` |
| `send_command` | `commandType`, `commandPayload` | Creates `DeviceCommand`, sets `device.pendingCommand` |

#### `DELETE /api/devices?id=<deviceId>`

Removes device from in-memory store.

#### `POST /api/devices/poll`

The Android TV heartbeat/command endpoint. Three modes:

**Mode: pair**
```json
{ "action": "pair", "pairingCode": "483920" }
```
- Looks up device by pairing code
- Sets `paired = true`, `online = true`, `lastHeartbeat = Date.now()`
- Returns `{ success: true, deviceId, venueId, name }`

**Mode: poll**
```json
{
  "action": "poll",
  "deviceId": "dev_abc",
  "status": { "isPlaying": true, "trackName": "Jazz Sunset", "volume": 75, ... }
}
```
- Updates `device.status` and `device.lastHeartbeat`
- Returns pending command (if any) and clears it: `{ command: DeviceCommand | null, venueId }`

**Mode: ack**
```json
{ "action": "ack", "deviceId": "dev_abc", "commandId": "cmd_xyz" }
```
- Marks `command.acknowledged = true`
- Returns `{ success: true }`

---

### Music Library

#### `GET /api/music/library`

Query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `language` | string | Filter by language folder (e.g. `en`, `hi`) |
| `genre` | string | Filter by genre subfolder |
| `limit` | number | Max tracks per page (default: 100) |
| `cursor` | string | S3 pagination continuation token |
| `stats` | boolean | If `true`, return storage stats only |

**Normal response:**
```json
{
  "data": {
    "tracks": [
      {
        "key": "en/jazz/velvet-dusk.mp3",
        "url": "https://...",
        "language": "en",
        "genre": "jazz",
        "filename": "velvet-dusk.mp3",
        "size": 8421376,
        "lastModified": "2026-01-15T10:23:00Z"
      }
    ],
    "nextCursor": "token...",
    "count": 45,
    "languages": ["en", "hi", "es"],
    "genresByLanguage": { "en": ["jazz", "lounge"], "hi": ["bollywood"] }
  }
}
```

**Stats response** (`?stats=true`):
```json
{
  "data": {
    "languages": {
      "en": { "trackCount": 120, "totalSizeBytes": 524288000 },
      "hi": { "trackCount": 45, "totalSizeBytes": 189235200 }
    },
    "totalTracks": 165,
    "totalSizeBytes": 713523200
  }
}
```

#### `DELETE /api/music/library`

Requires `Authorization: Bearer <JWT>` with role `super_admin`.

**Request body:** `{ "key": "en/jazz/track.mp3" }`

**Response:** `{ "data": { "deleted": "en/jazz/track.mp3" } }`

---

#### `POST /api/music/upload`

Generates presigned S3 PUT URLs. Requires `super_admin` JWT.

**Single file:**
```json
{
  "language": "en",
  "genre": "jazz",
  "filename": "midnight-city.mp3",
  "contentType": "audio/mpeg"
}
```

**Bulk (up to 50 files):**
```json
{
  "files": [
    { "language": "hi", "genre": "bollywood", "filename": "track1.mp3", "contentType": "audio/mpeg" },
    { "language": "en", "genre": "ambient", "filename": "track2.ogg", "contentType": "audio/ogg" }
  ]
}
```

**Response:**
```json
{
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/soundmark-music/en/jazz/midnight-city.mp3?X-Amz-...",
    "key": "en/jazz/midnight-city.mp3",
    "language": "en",
    "genre": "jazz",
    "filename": "midnight-city.mp3"
  }
}
```

The client then PUTs the file directly to the presigned URL (no server intermediary).

---

#### `GET /api/music/stream/[key]`

`key` is the URL-encoded S3 path (e.g. `en%2Fjazz%2Ftrack.mp3`).

- If `CLOUDFRONT_DOMAIN` is set → redirects to `https://<domain>/<key>`
- Otherwise → generates a 1-hour presigned S3 GET URL and redirects (302)
- Passes `Range` header through to support audio seeking

---

#### `GET /api/music/jamendo`

Proxies to Jamendo API v3. Avoids CORS issues from browser.

| Param | Default | Description |
|-------|---------|-------------|
| `genre` | `ambient` | Music tag to search |
| `limit` | `10` | Results per page |
| `offset` | `0` | Pagination offset |
| `featured` | `0` | `1` = featured tracks only |

**Upstream URL:** `https://api.jamendo.com/v3.0/tracks/?client_id=2c9a11b9&format=json&limit=...`

Returns raw Jamendo track objects.

---

#### `GET /api/music/ccmixter`

Proxies to ccMixter query API. Normalizes response to unified format.

| Param | Default | Description |
|-------|---------|-------------|
| `genre` | `ambient` | Style tag |
| `limit` | `10` | Results per page |
| `offset` | `0` | Pagination offset |

**Returns normalized tracks:**
```json
{
  "results": [
    {
      "id": "ccm_abc123",
      "title": "Evening Groove",
      "artist": "DJ Lofi",
      "audioUrl": "https://ccmixter.org/content/djlofi/track.mp3",
      "genre": "ambient",
      "source": "ccmixter",
      "duration": 187
    }
  ]
}
```

---

### Weather

#### `GET /api/weather?lat=37.7749&lon=-122.4194`

Fetches current weather from OpenMeteo (free, no API key required).

**Upstream URL:** `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current_weather=true&hourly=relativehumidity_2m,apparent_temperature,windspeed_10m`

**Caching:** 10-minute cache via `next: { revalidate: 600 }` fetch option.

**WMO weather code mapping:** 39 condition codes mapped to human-readable strings + emoji icons.

**Response:**
```json
{
  "data": {
    "temperature": 18.5,
    "feelsLike": 17.2,
    "humidity": 72,
    "windSpeed": 14,
    "condition": "Partly Cloudy",
    "icon": "⛅",
    "isDay": true
  }
}
```

---

## 9. Global State Management

**File:** `src/lib/store.ts`

Uses React Context API with `useReducer`. No Redux or external state library.

### State Shape

```typescript
interface AppState {
  user: User | null
  venues: Venue[]
  playbackStates: Record<string, PlaybackState>   // keyed by venueId
  environmentData: Record<string, EnvironmentData> // keyed by venueId
  schedules: Schedule[]
  analytics: AnalyticsData | null
  musicLibrary: MusicTrack[]
  musicCategories: MusicCategory[]
  customerMappings: CustomerMusicMapping[]
  musicSources: MusicSource[]
  favorites: FavoriteTrack[]
  playlists: Playlist[]
  isAuthenticated: boolean
}
```

### Action Types

```typescript
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_VENUES'; payload: Venue[] }
  | { type: 'ADD_VENUE'; payload: Venue }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'DELETE_VENUE'; payload: string }
  | { type: 'SET_PLAYBACK'; payload: { venueId: string; state: PlaybackState } }
  | { type: 'SET_ENVIRONMENT'; payload: { venueId: string; data: EnvironmentData } }
  | { type: 'SET_SCHEDULES'; payload: Schedule[] }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  | { type: 'SET_MUSIC_LIBRARY'; payload: MusicTrack[] }
  | { type: 'ADD_MUSIC_TRACK'; payload: MusicTrack }
  | { type: 'SET_CUSTOMER_MAPPINGS'; payload: CustomerMusicMapping[] }
  | { type: 'SET_MUSIC_SOURCES'; payload: MusicSource[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteTrack }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  // ...30+ total action types
```

### Usage

```typescript
import { useAppState } from '@/components/providers'

function MyComponent() {
  const { state, dispatch } = useAppState()

  // Read
  const venues = state.venues

  // Write
  dispatch({ type: 'SET_PLAYBACK', payload: { venueId: '1', state: { isPlaying: true, volume: 75 } } })
}
```

Initial state is seeded from `mock-data.ts` on first load.

---

## 10. Audio Systems (LLD)

### System 1 – Web Audio API Synthesizer (`lib/audio-engine.ts`)

Procedurally generates ambient music using the browser's Web Audio API. No external audio files needed. Used as fallback / demo mode.

#### Genre Presets (15 built-in)

Each genre preset defines the following parameters:

```typescript
interface GenrePreset {
  baseFreqs: number[]        // Chord root frequencies in Hz
  chordPatterns: number[][]  // Overtone ratios (harmony layers)
  tempo: number              // BPM
  filterFreq: number         // Low-pass filter cutoff (Hz)
  reverbDecay: number        // Convolver reverb tail (seconds)
  padVolume: number          // Sustained chord layer gain (0–1)
  bassVolume: number         // Bass rhythm gain
  melodyVolume: number       // Melody layer gain
  melodyNotes: number[]      // Pentatonic/scale Hz values for melody
  swingFactor: number        // Timing offset for groove (0–0.5)
}
```

**Presets defined for:** jazz, lounge, ambient, electronic, deep house, chill, classical, acoustic, folk, meditation, nature, indie, soul, bossa nova, r&b

#### Audio Graph Per Venue

```
AudioContext
│
├── masterGain (per-venue gain node, 0.0–1.0)
│   │
│   ├── Pad Layer
│   │   ├── OscillatorNode (type: sine/triangle)
│   │   │   └── BiquadFilterNode (lowpass, cutoff: preset.filterFreq)
│   │   └── ConvolverNode (impulse response reverb)
│   │
│   ├── Bass Layer
│   │   ├── OscillatorNode (type: sawtooth)
│   │   │   └── BiquadFilterNode (lowpass, cutoff: 400Hz)
│   │   └── Rhythmic envelope (4 notes per bar, 16th-note grid)
│   │
│   └── Melody Layer
│       ├── OscillatorNode (type: sine)
│       │   ├── detune: ±5 cents (warmth)
│       │   └── Procedural phrase generator (8-note sequences)
│       └── Swing timing offset applied
│
└── destination (speakers)
```

#### Key Methods

```typescript
class SoundmarkAudioEngine {
  startVenue(venueId: string, genre: string, volume: number): Promise<void>
  stopVenue(venueId: string): void
  setVolume(venueId: string, volume: number): void
  setGenre(venueId: string, genre: string): void
  getVenueInfo(venueId: string): { genre, isPlaying, volume, currentTrack }
}
```

---

### System 2 – HTML5 Audio Multi-Venue Player (`lib/audio-engine-v2.ts`)

Streams real audio from Jamendo, ccMixter, or S3. Primary production mode.

#### Architecture

```typescript
interface VenuePlayer {
  playlist: MusicTrackResult[]
  currentIndex: number
  audioEl: HTMLAudioElement          // One per venue
  onUpdate: (info: NowPlayingInfo | null) => void
}

class SoundmarkAudioEngineV2 {
  private players: Map<string, VenuePlayer>   // venueId → player
  private listeners: Map<string, PlaybackListener>
}
```

#### Track Loading Flow

```
startVenue(venueId, genre, volume)
    │
    ▼
fetchTracksForGenre(genre)
    │
    ├── GET /api/music/library?genre=<genre>&language=en
    ├── GET /api/music/jamendo?genre=<genre>&limit=20
    └── GET /api/music/ccmixter?genre=<genre>&limit=10
    │
    ▼
Shuffle combined results
    │
    ▼
audioEl.src = tracks[0].audioUrl
audioEl.play()
    │
    ▼
audioEl.onended → advance currentIndex, play next track
    │
    ▼
Notify listeners via onUpdate({ title, artist, genre, progress })
```

#### Key Methods

```typescript
class SoundmarkAudioEngineV2 {
  async startVenue(venueId: string, genre: string, volume: number): Promise<void>
  stopVenue(venueId: string): void
  pauseVenue(venueId: string): void
  resumeVenue(venueId: string): void
  setVolume(venueId: string, volume: number): void  // 0–100
  seek(venueId: string, seconds: number): void
  skipNext(venueId: string): void
  skipPrev(venueId: string): void
  getNowPlaying(venueId: string): NowPlayingInfo | null
  addListener(id: string, callback: PlaybackListener): void
  removeListener(id: string): void
}
```

---

## 11. Authentication & Authorization

**File:** `src/lib/auth.ts`

### JWT Token Strategy

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access token | 15 minutes | API authorization |
| Refresh token | 30 days | Token renewal |

Signing algorithm: HS256. Secret from `JWT_SECRET` env var.

```typescript
// Generate tokens
function generateTokens(user: User): { accessToken: string; refreshToken: string }

// Verify access token
function verifyAccessToken(token: string): JwtPayload | null

// Extract user from Authorization header
function getUserFromRequest(request: Request): User | null
```

### Password Hashing

```typescript
// Hash password (bcrypt, 12 rounds)
async function hashPassword(password: string): Promise<string>

// Compare password to hash
async function comparePassword(password: string, hash: string): Promise<boolean>
```

### Password Validation Rules

```typescript
function validatePassword(password: string): { valid: boolean; errors: string[] }
// Rules:
// - Minimum 8 characters
// - At least one uppercase letter [A-Z]
// - At least one digit [0-9]
// - At least one special character [!@#$%^&*]
```

### Role Permissions Matrix

| Capability | super_admin | admin | owner | manager | staff |
|-----------|:-----------:|:-----:|:-----:|:-------:|:-----:|
| Music upload/delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| User management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subscription management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Venue CRUD | ✅ | ✅ | ✅ | ❌ | ❌ |
| Device management | ✅ | ✅ | ✅ | ✅ | ❌ |
| Playback control | ✅ | ✅ | ✅ | ✅ | View |
| Schedule management | ✅ | ✅ | ✅ | ✅ | ❌ |
| Analytics view | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 12. Music Library & S3 Organization

**File:** `src/lib/s3.ts`

### S3 Bucket Structure

```
s3://soundmark-music/
├── en/                         # English
│   ├── jazz/
│   ├── lounge/
│   ├── ambient/
│   ├── electronic/
│   ├── deep-house/
│   ├── chill/
│   ├── classical/
│   ├── acoustic/
│   ├── folk/
│   ├── indie/
│   ├── soul/
│   ├── r&b/
│   ├── bossa-nova/
│   ├── pop/
│   └── rock/
├── hi/                         # Hindi
│   ├── bollywood/
│   ├── devotional/
│   ├── ghazal/
│   ├── sufi/
│   ├── indie-hindi/
│   ├── retro/
│   ├── romantic/
│   ├── party/
│   └── lofi-hindi/
├── es/                         # Spanish
│   ├── latin/
│   ├── reggaeton/
│   ├── flamenco/
│   ├── bossa-nova/
│   ├── salsa/
│   └── bachata/
├── ar/                         # Arabic
│   ├── arabic-pop/
│   ├── oud/
│   ├── khaleeji/
│   ├── andalusian/
│   └── sufi-arabic/
├── af/                         # African
│   ├── afrobeats/
│   ├── highlife/
│   ├── amapiano/
│   ├── soukous/
│   └── afro-jazz/
├── in-regional/                # Indian Regional Languages
│   ├── tamil/
│   ├── telugu/
│   ├── kannada/
│   ├── malayalam/
│   ├── bengali/
│   ├── marathi/
│   ├── gujarati/
│   └── punjabi/
└── in-instrumental/            # Indian Instrumental / Ceremonial
    ├── wedding/
    ├── ceremony/
    ├── classical-indian/
    ├── fusion/
    ├── shehnai/
    ├── sitar/
    ├── tabla/
    └── flute/
```

### Key Parsing

S3 keys are parsed to extract metadata without a database:

```
Key:    "en/jazz/velvet-dusk.mp3"
Parsed: { language: "en", genre: "jazz", filename: "velvet-dusk.mp3" }
```

### S3 Operations

```typescript
// List tracks with pagination
listMusicTracks(language?: string, genre?: string, limit?: number, cursor?: string)
  → { tracks: S3Track[], nextCursor: string | undefined }

// Generate presigned upload URL (1 hour expiry)
getPresignedUploadUrl(language: string, genre: string, filename: string, contentType: string)
  → { uploadUrl: string, key: string }

// Generate presigned download URL (1 hour expiry)
getPresignedDownloadUrl(key: string)
  → string

// Delete a track
deleteMusicTrack(key: string)
  → void

// Get storage statistics
getMusicStats()
  → { languages: Record<string, { trackCount, totalSizeBytes }>, totalTracks, totalSizeBytes }
```

---

## 13. External Integrations

### Jamendo Music API

- **API Base URL:** `https://api.jamendo.com/v3.0`
- **Client ID:** `2c9a11b9` (public)
- **License:** Creative Commons (CC BY, CC BY-NC, CC BY-SA)
- **Catalog:** 600,000+ free tracks
- **Format:** OGG Vorbis (audio stream)
- **Pagination:** offset-based

**Query example:**
```
GET https://api.jamendo.com/v3.0/tracks/
  ?client_id=2c9a11b9
  &format=json
  &limit=20
  &offset=0
  &tags=jazz
  &audioformat=ogg
  &order=popularity_total
```

### ccMixter API

- **API Base URL:** `http://ccmixter.org/api/query`
- **Authentication:** None required
- **License:** Creative Commons
- **Catalog:** 45,000+ instrumental remixes
- **Normalization:** Response mapped to `MusicTrackResult` interface

### OpenMeteo Weather API

- **API Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Authentication:** None required (free tier)
- **Variables fetched:** `temperature_2m`, `apparent_temperature`, `relativehumidity_2m`, `windspeed_10m`, `weathercode`, `is_day`
- **Cache:** 10 minutes (`next: { revalidate: 600 }`)

**WMO Code Mapping (39 conditions):**

| Code Range | Condition |
|-----------|-----------|
| 0 | Clear Sky |
| 1–3 | Mainly/Partly/Overcast |
| 45, 48 | Fog |
| 51–57 | Drizzle variants |
| 61–67 | Rain variants |
| 71–77 | Snow variants |
| 80–82 | Showers |
| 85–86 | Snow showers |
| 95 | Thunderstorm |
| 96, 99 | Thunderstorm with hail |

---

## 14. Analytics & Tracking

**File:** `src/lib/analytics-tracker.ts`

Client-side only — no server logging. Uses `localStorage` key `soundmark_play_events`.

### Event Storage

```typescript
interface PlayEvent {
  id: string            // uuid
  trackTitle: string
  artist: string
  genre: string
  language?: string
  source: 's3' | 'venue'
  durationSec: number
  playedAt: string      // ISO 8601
}
```

**Limits:**
- Maximum 200 events stored
- Events older than 5 days are purged on each write
- Oldest events dropped first when limit exceeded

### Computed Metrics

```typescript
class AnalyticsTracker {
  logPlay(event: Omit<PlayEvent, 'id' | 'playedAt'>): void

  getStats(): ComputedAnalytics
  // Returns:
  // - totalPlaybackHours: sum(durationSec) / 3600
  // - tracksPlayed: count
  // - genreDistribution: [{ genre, percentage }] sorted desc
  // - dailyPlayback: last 7 days [{ date: "Mon", hours }]
  // - peakHour: "HH AM/PM" with most plays
  // - recentTracks: last 10 events

  clearAll(): void
}
```

### Dashboard Integration

The Analytics page (`dashboard/analytics/page.tsx`) uses `analyticsTracker.getStats()` plus the mock `AnalyticsData` for chart rendering via Recharts:

- **Bar chart:** Daily playback hours (last 7 days)
- **Pie chart:** Genre distribution
- **Line chart:** Venue activity over time
- **Heatmap:** Hourly activity matrix

---

## 15. Scheduling Engine

**File:** `src/app/dashboard/schedules/page.tsx`
**Data:** `Schedule[]` in global state

### Schedule Rules

Each schedule specifies:
- Which days of the week it applies (multi-select, 0=Sun to 6=Sat)
- Time window: `startTime` – `endTime` (24h format)
- Genres to play (array; first genre is primary)
- Tempo range (BPM min/max)
- Energy range (0.0–1.0)
- Active/inactive toggle

### Conflict Resolution

Multiple schedules can overlap in time. Resolution priority:
1. More specific day wins over generic
2. Earlier `startTime` wins on exact tie
3. Most recently created schedule wins (fallback)

### Applying Schedules

The dashboard page evaluates active schedules against the current time and automatically suggests the matching schedule's genre when a venue starts playback. No background cron job in the MVP — evaluation is client-side on page load.

---

## 16. Device Management (Android TV)

**Files:**
- Web: `src/lib/device-store.ts`, `src/app/api/devices/`
- Android: `ambience-tv-android/`

### In-Memory Device Store

```typescript
// Module-level singleton (reset on server restart)
const deviceStore: Map<string, DeviceRecord> = new Map()

// Key operations
function getDevice(id: string): DeviceRecord | undefined
function getDeviceByPairingCode(code: string): DeviceRecord | undefined
function setDevice(device: DeviceRecord): void
function deleteDevice(id: string): void
function getAllDevices(): DeviceRecord[]
function getDevicesForOrg(orgId: string): DeviceRecord[]
```

### Heartbeat & Offline Detection

- Android TV polls every 3 seconds
- Each poll updates `device.lastHeartbeat = Date.now()`
- `GET /api/devices` marks device offline if `Date.now() - lastHeartbeat > 60000`
- Dashboard shows visual indicator (green = online, grey = offline)

### Command Queue Model

Commands are single-shot (not queued):
- Only ONE pending command at a time per device
- New command overwrites previous unacknowledged command
- TV retrieves command on next poll, executes it, sends ack
- Ack sets `command.acknowledged = true` but command stays in record for audit

---

## 17. Subscription Tiers & Billing

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Monthly price | $49 | $149 | $4,999/year |
| Max venues | 5 | 25 | Unlimited (999+) |
| Copyright-free music | ✅ | ✅ | ✅ |
| Licensed music | ❌ | ✅ | ✅ |
| Custom uploads | ❌ | ❌ | ✅ |
| Analytics | Basic | Full | Full + Export |
| Day-part scheduling | ✅ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Dedicated support | ❌ | ❌ | ✅ |
| Multi-language catalog | ❌ | ✅ | ✅ |
| Proof-of-play reports | ❌ | ✅ | ✅ |

**License enforcement** is handled via `CustomerMusicMapping.allowedLicenseTypes` and `MusicTrack.allowedPlans`. The music library API filters tracks based on the authenticated user's plan.

---

## 18. Component Hierarchy

```
app/layout.tsx
└── ThemeProvider
    └── AppStateProvider (Context)
        ├── app/(auth)/login/page.tsx
        │   └── LoginForm
        ├── app/(auth)/register/page.tsx
        │   └── RegisterForm
        ├── app/page.tsx            (Landing)
        └── app/dashboard/layout.tsx
            ├── Sidebar
            │   └── nav items (icon + label, active highlight)
            ├── Header
            │   └── UserMenu (avatar, role badge, logout)
            ├── AudioPlayerBar
            │   └── NowPlayingInfo + ProgressBar + VolumeSlider
            └── {page content}
                ├── dashboard/page.tsx
                │   ├── StatCards (venues, hours, tracks, satisfaction)
                │   ├── ActiveVenueCards (playback controls per venue)
                │   ├── WeatherWidget (temperature, condition, mood picker)
                │   └── GenreRecommendation (mood → genre mapping)
                ├── dashboard/venues/page.tsx
                │   ├── VenueList (grid/list toggle)
                │   ├── VenueCard (status, type, controls)
                │   ├── AddVenueModal
                │   └── VenueConfigPanel (genres, tempo, energy sliders)
                ├── dashboard/devices/page.tsx
                │   ├── DeviceGrid (online/offline status)
                │   ├── AddDeviceModal (shows pairing code)
                │   ├── AssignVenueDropdown
                │   └── CommandPanel (send play/pause/skip/volume)
                ├── dashboard/music-library/page.tsx
                │   ├── LanguageTabBar
                │   ├── GenreFilter
                │   ├── TrackTable (key, size, lastModified, stream button)
                │   ├── UploadForm (drag & drop + presigned URL upload)
                │   └── StorageStatsCard
                ├── dashboard/schedules/page.tsx
                │   ├── ScheduleList
                │   ├── AddScheduleModal (day picker, time range, genres)
                │   └── ScheduleConflictWarning
                ├── dashboard/analytics/page.tsx
                │   ├── MetricCards (hours, tracks, venues, peak)
                │   ├── PlaybackBarChart (Recharts, 7-day)
                │   ├── GenrePieChart (Recharts)
                │   ├── HourlyHeatmap
                │   └── RecentTracksTable
                ├── dashboard/environment/page.tsx
                │   ├── WeatherCard (live OpenMeteo data)
                │   ├── SensorCards (temp, humidity, CO2, noise, crowd, light)
                │   └── MoodGenreMapper
                ├── dashboard/proof-of-play/page.tsx
                │   ├── ReportFilter (date range, venue)
                │   ├── ProofOfPlayTable
                │   └── ExportPDFButton (jsPDF + autoTable)
                └── dashboard/settings/page.tsx
                    ├── ProfileForm
                    ├── OrganizationForm
                    ├── BillingPlanCard
                    ├── SecuritySettings (2FA toggle)
                    └── NotificationPreferences
```

---

## 19. Mock Data

**File:** `src/lib/mock-data.ts`

Seeded on every app load from this file. All data is San Francisco-based for realism.

| Entity | Count | Notes |
|--------|-------|-------|
| Venues | 8 | Real SF addresses, accurate GPS coordinates |
| Users | 12 | Various roles, plans, subscription statuses |
| Music tracks | 22 | 12 copyright-free, 10 licensed |
| Music sources | 7 | Jamendo, ccMixter, Uploaded Library |
| Schedules | 8 | Time-based genre rules across venues |
| Proof-of-Play reports | 3 | Jan–Feb 2026, 847.3 total hours |
| Customer mappings | 5 | One per org, plan-gated |

**Sample venues:**
- The Grand Lounge (bar) — 580 California St
- Skyline Rooftop Bar (bar) — 1 Front St
- Zen Spa & Wellness (spa) — 396 Hayes St
- Urban Grind Coffee (cafe) — 388 Market St
- Palazzo Italian Restaurant (restaurant) — 374 Sutter St
- WeWork Salesforce Tower (office) — 415 Mission St

---

## 20. Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | Full-stack framework (App Router, API routes) |
| `react` / `react-dom` | 19.2.4 | UI library |
| `typescript` | 5.9.3 | Type safety |
| `tailwindcss` | 4.1.18 | Utility-first CSS |
| `@aws-sdk/client-s3` | 3.988.0 | S3 operations |
| `@aws-sdk/s3-request-presigner` | 3.988.0 | Presigned URLs |
| `jsonwebtoken` | 9.0.3 | JWT sign/verify |
| `bcryptjs` | 3.0.3 | Password hashing |
| `uuid` | 13.0.0 | UUID generation |
| `date-fns` | 4.1.0 | Date formatting |
| `recharts` | 3.7.0 | Analytics charts |
| `jspdf` | 4.1.0 | PDF report generation |
| `jspdf-autotable` | 5.0.7 | PDF table plugin |
| `lucide-react` | 0.563.0 | Icon library |
| `class-variance-authority` | 0.7.1 | Component variant utilities |
| `tailwind-merge` | 3.4.0 | Class merging |

---

## 21. Deployment

### Vercel (Recommended)

```bash
# Deploy with Vercel CLI
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard under Project Settings → Environment Variables.

### AWS Amplify

```bash
# Amplify CLI
amplify init
amplify add hosting
amplify publish
```

Production URL: `https://main.soundmark.amplifyapp.com`

### Docker (Self-Hosted)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Required Infrastructure

| Service | Purpose | Provider |
|---------|---------|----------|
| Web hosting | Next.js app | Vercel / AWS Amplify |
| Object storage | Music files | AWS S3 |
| CDN (optional) | Audio streaming | AWS CloudFront |
| Database (future) | Persistent data | AWS RDS / MongoDB Atlas |
| Cache (future) | Sessions, queues | Redis / ElastiCache |

---

## 22. Known Limitations & Roadmap

### Current MVP Limitations

| Limitation | Impact | Recommended Fix |
|-----------|--------|----------------|
| In-memory device store | Resets on server restart | PostgreSQL / MongoDB |
| Hardcoded demo auth | No real user accounts | Database-backed auth |
| No persistent database | All data from mock file | PostgreSQL + Prisma ORM |
| Polling-based device control | 3s latency | WebSocket / Server-Sent Events |
| Single command queue slot | Commands can be overwritten | Redis pub/sub or SQS |
| No music metadata extraction | No BPM/key/energy detection | ffprobe + AI tagging |
| Client-side analytics only | No cross-device persistence | Server-side event logging |

### Planned Features

- [ ] **Stripe billing integration** — actual subscription management
- [ ] **AI music recommendations** — ML model for mood → genre mapping
- [ ] **Proof-of-play blockchain** — immutable audit trail for licensed music
- [ ] **POS integration** — connect Square/Revel to adapt music to order volume
- [ ] **Multi-zone audio** — different music in different areas of same venue
- [ ] **Mobile app** — iOS/Android app for venue managers
- [ ] **API rate limiting** — Kong/Nginx rate limiting by plan tier
- [ ] **Audit logging** — track all admin actions
- [ ] **Refresh token rotation** — sliding session security
- [ ] **Music AI classification** — auto-tag uploaded tracks with BPM, key, energy

---

## License

Proprietary — Aj Luxury © 2026. All rights reserved.
