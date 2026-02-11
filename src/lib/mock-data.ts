import { User, Organization, Venue, VenueConfiguration, Track, EnvironmentData, Schedule, AnalyticsData, PlaybackState, MusicTrack, MusicCategory, CustomerMusicMapping, MusicSource } from '@/types';

// ─── User & Organization ────────────────────────────────────────

export const mockUser: User = {
  id: '1',
  email: 'ajith.prasad@ajluxury.com',
  name: 'Ajith Prasad',
  role: 'owner',
  status: 'active',
  organizationId: '1',
  createdAt: '2025-09-12T10:00:00Z',
  updatedAt: '2026-02-11T10:00:00Z',
};

export const mockOrganization: Organization = {
  id: '1',
  name: 'Aj Luxury',
  ownerId: '1',
  planType: 'professional',
  subscriptionStatus: 'active',
  createdAt: '2025-09-12T10:00:00Z',
};

// ─── Venues ─────────────────────────────────────────────────────
// 8 venues across SF — real addresses, accurate lat/lng, realistic configs

export const mockVenues: Venue[] = [
  {
    id: '1', organizationId: '1',
    name: 'The Grand Lounge',
    venueType: 'lounge',
    address: '345 Stockton St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7880, longitude: -122.4065,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2025-09-15T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c1', venueId: '1', preferredGenres: ['jazz', 'lounge', 'ambient'], tempoRange: { min: 70, max: 110 }, valenceRange: { min: 0.4, max: 0.7 }, energyRange: { min: 0.3, max: 0.6 }, volumeLevel: 45 },
  },
  {
    id: '2', organizationId: '1',
    name: 'Skyline Rooftop Bar',
    venueType: 'bar',
    address: '199 New Montgomery St, Floor 26', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7867, longitude: -122.4005,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2025-10-01T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c2', venueId: '2', preferredGenres: ['electronic', 'deep house', 'chill'], tempoRange: { min: 100, max: 128 }, valenceRange: { min: 0.5, max: 0.8 }, energyRange: { min: 0.5, max: 0.8 }, volumeLevel: 62 },
  },
  {
    id: '3', organizationId: '1',
    name: 'Zen Spa & Wellness',
    venueType: 'spa',
    address: '750 Kearny St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7946, longitude: -122.4050,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2025-10-20T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c3', venueId: '3', preferredGenres: ['ambient', 'nature', 'meditation'], tempoRange: { min: 50, max: 80 }, valenceRange: { min: 0.3, max: 0.6 }, energyRange: { min: 0.1, max: 0.35 }, volumeLevel: 28 },
  },
  {
    id: '4', organizationId: '1',
    name: 'Urban Grind Coffee',
    venueType: 'cafe',
    address: '3655 Lawton St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7570, longitude: -122.5030,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2025-11-05T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c4', venueId: '4', preferredGenres: ['indie', 'acoustic', 'folk'], tempoRange: { min: 80, max: 120 }, valenceRange: { min: 0.5, max: 0.8 }, energyRange: { min: 0.3, max: 0.6 }, volumeLevel: 38 },
  },
  {
    id: '5', organizationId: '1',
    name: 'Palazzo Restaurant',
    venueType: 'restaurant',
    address: '640 Sacramento St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7939, longitude: -122.4040,
    timezone: 'America/Los_Angeles', status: 'inactive',
    createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c5', venueId: '5', preferredGenres: ['classical', 'jazz', 'bossa nova'], tempoRange: { min: 60, max: 100 }, valenceRange: { min: 0.4, max: 0.7 }, energyRange: { min: 0.2, max: 0.5 }, volumeLevel: 32 },
  },
  {
    id: '6', organizationId: '1',
    name: 'WeWork SoMa',
    venueType: 'office',
    address: '600 California St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7925, longitude: -122.4048,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c6', venueId: '6', preferredGenres: ['chill', 'ambient', 'electronic'], tempoRange: { min: 70, max: 115 }, valenceRange: { min: 0.4, max: 0.7 }, energyRange: { min: 0.2, max: 0.5 }, volumeLevel: 30 },
  },
  {
    id: '7', organizationId: '1',
    name: 'WeWork Financial District',
    venueType: 'office',
    address: '44 Montgomery St, Suite 1100', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7891, longitude: -122.4020,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c7', venueId: '7', preferredGenres: ['lounge', 'jazz', 'acoustic'], tempoRange: { min: 75, max: 110 }, valenceRange: { min: 0.45, max: 0.7 }, energyRange: { min: 0.25, max: 0.5 }, volumeLevel: 25 },
  },
  {
    id: '8', organizationId: '1',
    name: 'WeWork Mission',
    venueType: 'office',
    address: '2300 Harrison St', city: 'San Francisco', state: 'CA', country: 'US',
    latitude: 37.7599, longitude: -122.4130,
    timezone: 'America/Los_Angeles', status: 'active',
    createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-02-11T08:00:00Z',
    configuration: { id: 'c8', venueId: '8', preferredGenres: ['indie', 'folk', 'chill'], tempoRange: { min: 80, max: 115 }, valenceRange: { min: 0.5, max: 0.75 }, energyRange: { min: 0.3, max: 0.55 }, volumeLevel: 28 },
  },
];

// ─── Recently Played Tracks (per-venue last-played) ─────────────

export const mockTracks: Track[] = [
  { id: 't1', title: 'Midnight Velvet', genre: 'jazz', bpm: 85, key: 'Dm', valence: 0.55, energy: 0.4, duration: 245, generatedAt: '2026-02-11T14:30:00Z' },
  { id: 't2', title: 'Neon Horizons', genre: 'electronic', bpm: 118, key: 'Am', valence: 0.7, energy: 0.65, duration: 312, generatedAt: '2026-02-11T14:35:00Z' },
  { id: 't3', title: 'Crystal Waters', genre: 'ambient', bpm: 65, key: 'C', valence: 0.4, energy: 0.2, duration: 420, generatedAt: '2026-02-11T14:40:00Z' },
  { id: 't4', title: 'Morning Brew', genre: 'acoustic', bpm: 95, key: 'G', valence: 0.65, energy: 0.45, duration: 198, generatedAt: '2026-02-11T14:45:00Z' },
  { id: 't5', title: 'Golden Hour', genre: 'lounge', bpm: 92, key: 'Eb', valence: 0.6, energy: 0.35, duration: 278, generatedAt: '2026-02-11T14:50:00Z' },
  { id: 't6', title: 'Deep Current', genre: 'deep house', bpm: 122, key: 'Fm', valence: 0.72, energy: 0.7, duration: 356, generatedAt: '2026-02-11T15:00:00Z' },
  { id: 't7', title: 'Sakura Dreams', genre: 'meditation', bpm: 55, key: 'D', valence: 0.35, energy: 0.15, duration: 480, generatedAt: '2026-02-11T15:05:00Z' },
  { id: 't8', title: 'Cobblestone Walk', genre: 'folk', bpm: 105, key: 'A', valence: 0.68, energy: 0.5, duration: 225, generatedAt: '2026-02-11T15:10:00Z' },
];

// ─── Playback States ────────────────────────────────────────────

export const mockPlaybackStates: Record<string, PlaybackState> = {
  '1': { venueId: '1', isPlaying: false, currentTrack: mockTracks[0], volume: 45 },
  '2': { venueId: '2', isPlaying: false, currentTrack: mockTracks[5], volume: 62 },
  '3': { venueId: '3', isPlaying: false, currentTrack: mockTracks[6], volume: 28 },
  '4': { venueId: '4', isPlaying: false, currentTrack: mockTracks[7], volume: 38 },
  '5': { venueId: '5', isPlaying: false, volume: 32 },
  '6': { venueId: '6', isPlaying: false, currentTrack: mockTracks[2], volume: 30 },
  '7': { venueId: '7', isPlaying: false, currentTrack: mockTracks[4], volume: 25 },
  '8': { venueId: '8', isPlaying: false, currentTrack: mockTracks[3], volume: 28 },
};

// ─── Environment Data (real-time sensor snapshot) ───────────────

export const mockEnvironmentData: Record<string, EnvironmentData> = {
  '1': { venueId: '1', timestamp: '2026-02-11T14:30:00Z', temperature: 21.5, humidity: 44, weatherCondition: 'partly cloudy', ambientLight: 32, crowdDensity: 58 },
  '2': { venueId: '2', timestamp: '2026-02-11T14:30:00Z', temperature: 16.2, humidity: 62, weatherCondition: 'overcast', ambientLight: 18, crowdDensity: 72 },
  '3': { venueId: '3', timestamp: '2026-02-11T14:30:00Z', temperature: 23.8, humidity: 48, weatherCondition: 'clear', ambientLight: 12, crowdDensity: 35 },
  '4': { venueId: '4', timestamp: '2026-02-11T14:30:00Z', temperature: 20.1, humidity: 41, weatherCondition: 'partly cloudy', ambientLight: 68, crowdDensity: 48 },
  '5': { venueId: '5', timestamp: '2026-02-11T14:30:00Z', temperature: 22.0, humidity: 46, weatherCondition: 'clear', ambientLight: 38, crowdDensity: 0 },
  '6': { venueId: '6', timestamp: '2026-02-11T14:30:00Z', temperature: 22.4, humidity: 39, weatherCondition: 'clear', ambientLight: 55, crowdDensity: 64 },
  '7': { venueId: '7', timestamp: '2026-02-11T14:30:00Z', temperature: 21.8, humidity: 37, weatherCondition: 'partly cloudy', ambientLight: 60, crowdDensity: 52 },
  '8': { venueId: '8', timestamp: '2026-02-11T14:30:00Z', temperature: 22.6, humidity: 40, weatherCondition: 'clear', ambientLight: 50, crowdDensity: 56 },
};

// ─── Schedules ──────────────────────────────────────────────────

export const mockSchedules: Schedule[] = [
  { id: 's1', venueId: '1', name: 'Morning Calm', dayOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '12:00', genres: ['ambient', 'jazz'], tempoRange: { min: 60, max: 90 }, energyRange: { min: 0.2, max: 0.4 }, isActive: true },
  { id: 's2', venueId: '1', name: 'Afternoon Vibes', dayOfWeek: [1, 2, 3, 4, 5], startTime: '12:00', endTime: '17:00', genres: ['lounge', 'jazz'], tempoRange: { min: 80, max: 110 }, energyRange: { min: 0.4, max: 0.6 }, isActive: true },
  { id: 's3', venueId: '1', name: 'Evening Energy', dayOfWeek: [1, 2, 3, 4, 5, 6], startTime: '17:00', endTime: '23:00', genres: ['jazz', 'soul'], tempoRange: { min: 90, max: 120 }, energyRange: { min: 0.5, max: 0.7 }, isActive: true },
  { id: 's4', venueId: '2', name: 'Sunset Session', dayOfWeek: [4, 5, 6], startTime: '16:00', endTime: '20:00', genres: ['chill', 'deep house'], tempoRange: { min: 100, max: 120 }, energyRange: { min: 0.4, max: 0.6 }, isActive: true },
  { id: 's5', venueId: '2', name: 'Night Groove', dayOfWeek: [5, 6], startTime: '20:00', endTime: '02:00', genres: ['electronic', 'deep house'], tempoRange: { min: 118, max: 128 }, energyRange: { min: 0.6, max: 0.9 }, isActive: true },
  { id: 's6', venueId: '3', name: 'All Day Zen', dayOfWeek: [0, 1, 2, 3, 4, 5, 6], startTime: '07:00', endTime: '21:00', genres: ['ambient', 'nature', 'meditation'], tempoRange: { min: 50, max: 75 }, energyRange: { min: 0.1, max: 0.3 }, isActive: true },
  { id: 's7', venueId: '4', name: 'Cafe Open', dayOfWeek: [1, 2, 3, 4, 5, 6, 0], startTime: '06:30', endTime: '14:00', genres: ['acoustic', 'indie', 'folk'], tempoRange: { min: 80, max: 110 }, energyRange: { min: 0.3, max: 0.55 }, isActive: true },
  { id: 's8', venueId: '6', name: 'WeWork Morning Focus', dayOfWeek: [1, 2, 3, 4, 5], startTime: '07:00', endTime: '12:00', genres: ['ambient', 'chill', 'electronic'], tempoRange: { min: 70, max: 100 }, energyRange: { min: 0.2, max: 0.4 }, isActive: true },
  { id: 's9', venueId: '6', name: 'WeWork Afternoon Flow', dayOfWeek: [1, 2, 3, 4, 5], startTime: '12:00', endTime: '18:00', genres: ['chill', 'lounge', 'indie'], tempoRange: { min: 85, max: 115 }, energyRange: { min: 0.3, max: 0.55 }, isActive: true },
  { id: 's10', venueId: '7', name: 'FiDi Focus', dayOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00', genres: ['lounge', 'jazz', 'acoustic'], tempoRange: { min: 75, max: 110 }, energyRange: { min: 0.25, max: 0.5 }, isActive: true },
  { id: 's11', venueId: '8', name: 'Mission Creative', dayOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '19:00', genres: ['indie', 'folk', 'chill'], tempoRange: { min: 80, max: 115 }, energyRange: { min: 0.3, max: 0.55 }, isActive: true },
];

// ─── Analytics ──────────────────────────────────────────────────
// Feb 2026 MTD (11 days). Derived from per-venue operating hours with natural variance.
// Grand Lounge: 15h/day, Skyline: 8h (Thu–Sat only, ~3.4/day avg), Zen Spa: 14h/day,
// Urban Grind: 7.5h/day, WeWork SoMa: 11h/day (weekdays), WeWork FiDi: 10h/day,
// WeWork Mission: 10h/day. Palazzo: offline since Jan 28.

export const mockAnalytics: AnalyticsData = {
  totalVenues: 8,
  activeVenues: 7,
  totalPlaybackHours: 847.3,
  avgSatisfactionScore: 4.63,
  tracksGenerated: 12741,
  peakHour: '10:47 AM',
  dailyPlayback: [
    { date: 'Mon', hours: 71.4 },
    { date: 'Tue', hours: 74.8 },
    { date: 'Wed', hours: 69.2 },
    { date: 'Thu', hours: 83.6 },
    { date: 'Fri', hours: 91.3 },
    { date: 'Sat', hours: 67.9 },
    { date: 'Sun', hours: 44.1 },
  ],
  genreDistribution: [
    { genre: 'Jazz', percentage: 22.4 },
    { genre: 'Ambient', percentage: 18.7 },
    { genre: 'Chill', percentage: 15.1 },
    { genre: 'Electronic', percentage: 13.8 },
    { genre: 'Lounge', percentage: 11.6 },
    { genre: 'Indie / Folk', percentage: 9.3 },
    { genre: 'Acoustic', percentage: 5.8 },
    { genre: 'Classical', percentage: 3.3 },
  ],
  venueActivity: [
    { venue: 'The Grand Lounge', hours: 158.7, tracks: 2314 },
    { venue: 'Zen Spa & Wellness', hours: 147.2, tracks: 1289 },
    { venue: 'WeWork SoMa', hours: 118.4, tracks: 1763 },
    { venue: 'Skyline Rooftop Bar', hours: 109.6, tracks: 1427 },
    { venue: 'WeWork Financial District', hours: 104.1, tracks: 1582 },
    { venue: 'WeWork Mission', hours: 97.8, tracks: 1491 },
    { venue: 'Urban Grind Coffee', hours: 78.3, tracks: 1174 },
    { venue: 'Palazzo Restaurant', hours: 0, tracks: 0 },
  ],
  hourlyActivity: [
    { hour: '6AM', venues: 1 }, { hour: '7AM', venues: 3 }, { hour: '8AM', venues: 5 },
    { hour: '9AM', venues: 7 }, { hour: '10AM', venues: 7 }, { hour: '11AM', venues: 7 },
    { hour: '12PM', venues: 7 }, { hour: '1PM', venues: 6 }, { hour: '2PM', venues: 6 },
    { hour: '3PM', venues: 5 }, { hour: '4PM', venues: 5 }, { hour: '5PM', venues: 5 },
    { hour: '6PM', venues: 4 }, { hour: '7PM', venues: 4 }, { hour: '8PM', venues: 3 },
    { hour: '9PM', venues: 2 }, { hour: '10PM', venues: 2 }, { hour: '11PM', venues: 1 },
  ],
};

// ─── Auth Database ──────────────────────────────────────────────

export const mockUsersDB: Array<{ id: string; email: string; name: string; passwordHash: string; role: 'admin' | 'owner' | 'manager' | 'staff'; status: 'active' | 'inactive' | 'suspended'; organizationId: string }> = [
  {
    id: '1',
    email: 'admin@ambienceai.com',
    name: 'Ajith Prasad',
    passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjQ==',
    role: 'owner',
    status: 'active',
    organizationId: '1',
  },
];

// ─── Music Library ──────────────────────────────────────────────

export const mockMusicCategories: MusicCategory[] = [
  { id: 'cat-1', name: 'Royalty-Free Collection', licenseType: 'copyright-free', description: 'Curated royalty-free tracks cleared for all commercial use. No per-play licensing fees.', trackCount: 12, genres: ['ambient', 'jazz', 'lounge', 'acoustic', 'chill', 'electronic', 'meditation', 'nature', 'classical'] },
  { id: 'cat-2', name: 'Premium Licensed Catalog', licenseType: 'copyrighted', description: 'Licensed tracks from independent artists. Requires Professional or Enterprise plan.', trackCount: 10, genres: ['jazz', 'deep house', 'electronic', 'soul', 'bossa nova', 'indie', 'folk', 'lounge'] },
];

export const mockMusicLibrary: MusicTrack[] = [
  // ── Royalty-Free (available to all plans) ──
  { id: 'ml-1', title: 'Velvet Dusk', artist: 'Ambience Studio', genre: 'jazz', licenseType: 'copyright-free', bpm: 82, key: 'Dm', valence: 0.5, energy: 0.35, duration: 248, fileUrl: '/audio/velvet-dusk.mp3', tags: ['smooth', 'evening', 'warm'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 3417, uploadedAt: '2025-10-10T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-2', title: 'Morning Mist', artist: 'Ambience Studio', genre: 'ambient', licenseType: 'copyright-free', bpm: 60, key: 'C', valence: 0.4, energy: 0.2, duration: 360, fileUrl: '/audio/morning-mist.mp3', tags: ['calm', 'morning', 'ethereal'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 5183, uploadedAt: '2025-10-10T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-3', title: 'Cafe Parisien', artist: 'Ambience Studio', genre: 'lounge', licenseType: 'copyright-free', bpm: 95, key: 'Bb', valence: 0.6, energy: 0.4, duration: 215, fileUrl: '/audio/cafe-parisien.mp3', tags: ['french', 'cafe', 'daytime'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 2864, uploadedAt: '2025-10-12T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-4', title: 'Wooden Trails', artist: 'Ambience Studio', genre: 'acoustic', licenseType: 'copyright-free', bpm: 100, key: 'G', valence: 0.65, energy: 0.45, duration: 198, fileUrl: '/audio/wooden-trails.mp3', tags: ['guitar', 'warm', 'organic'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 1947, uploadedAt: '2025-10-14T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-5', title: 'Cloud Nine', artist: 'Ambience Studio', genre: 'chill', licenseType: 'copyright-free', bpm: 88, key: 'Em', valence: 0.55, energy: 0.3, duration: 275, fileUrl: '/audio/cloud-nine.mp3', tags: ['dreamy', 'soft', 'floating'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 4089, uploadedAt: '2025-10-15T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-6', title: 'Pulse Wave', artist: 'Ambience Studio', genre: 'electronic', licenseType: 'copyright-free', bpm: 118, key: 'Am', valence: 0.7, energy: 0.6, duration: 310, fileUrl: '/audio/pulse-wave.mp3', tags: ['modern', 'upbeat', 'clean'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 3621, uploadedAt: '2025-10-16T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-7', title: 'Zen Garden', artist: 'Ambience Studio', genre: 'meditation', licenseType: 'copyright-free', bpm: 52, key: 'D', valence: 0.3, energy: 0.1, duration: 480, fileUrl: '/audio/zen-garden.mp3', tags: ['spa', 'peaceful', 'healing'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 6743, uploadedAt: '2025-10-17T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-8', title: 'Rainfall', artist: 'Ambience Studio', genre: 'nature', licenseType: 'copyright-free', bpm: 0, key: '-', valence: 0.35, energy: 0.1, duration: 600, fileUrl: '/audio/rainfall.mp3', tags: ['rain', 'nature', 'white-noise'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 8891, uploadedAt: '2025-10-18T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-9', title: 'String Quartet No. 7', artist: 'Ambience Studio', genre: 'classical', licenseType: 'copyright-free', bpm: 72, key: 'F', valence: 0.5, energy: 0.35, duration: 340, fileUrl: '/audio/string-quartet.mp3', tags: ['elegant', 'formal', 'dining'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 2318, uploadedAt: '2025-10-19T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-10', title: 'Horizon Glow', artist: 'Ambience Studio', genre: 'ambient', licenseType: 'copyright-free', bpm: 65, key: 'Ab', valence: 0.45, energy: 0.25, duration: 390, fileUrl: '/audio/horizon-glow.mp3', tags: ['sunset', 'warm', 'golden'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 3074, uploadedAt: '2025-10-20T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-11', title: 'Lobby Elegance', artist: 'Ambience Studio', genre: 'lounge', licenseType: 'copyright-free', bpm: 90, key: 'Eb', valence: 0.55, energy: 0.35, duration: 265, fileUrl: '/audio/lobby-elegance.mp3', tags: ['hotel', 'luxury', 'sophisticated'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 4537, uploadedAt: '2025-10-21T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-12', title: 'Focus Flow', artist: 'Ambience Studio', genre: 'electronic', licenseType: 'copyright-free', bpm: 110, key: 'Cm', valence: 0.6, energy: 0.5, duration: 285, fileUrl: '/audio/focus-flow.mp3', tags: ['productivity', 'office', 'concentration'], status: 'active', allowedPlans: ['starter', 'professional', 'enterprise'], playCount: 5412, uploadedAt: '2025-10-22T08:00:00Z', uploadedBy: 'admin' },

  // ── Licensed Tracks (Professional / Enterprise) ──
  { id: 'ml-13', title: 'Midnight in Manhattan', artist: 'Clara Voss', genre: 'jazz', licenseType: 'copyrighted', bpm: 78, key: 'Gm', valence: 0.5, energy: 0.4, duration: 295, fileUrl: '/audio/midnight-manhattan.mp3', tags: ['saxophone', 'nightlife', 'premium'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 1873, uploadedAt: '2025-11-25T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-14', title: 'Neon Depths', artist: 'Synthwave Collective', genre: 'deep house', licenseType: 'copyrighted', bpm: 124, key: 'Fm', valence: 0.72, energy: 0.7, duration: 345, fileUrl: '/audio/neon-depths.mp3', tags: ['club', 'nightlife', 'bass'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 2431, uploadedAt: '2025-11-26T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-15', title: 'Electric Sunset', artist: 'Nova Beats', genre: 'electronic', licenseType: 'copyrighted', bpm: 126, key: 'Bbm', valence: 0.75, energy: 0.72, duration: 330, fileUrl: '/audio/electric-sunset.mp3', tags: ['rooftop', 'sunset', 'energy'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 3094, uploadedAt: '2025-11-27T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-16', title: 'Soul Kitchen', artist: 'Marcus Bell', genre: 'soul', licenseType: 'copyrighted', bpm: 86, key: 'Db', valence: 0.6, energy: 0.5, duration: 268, fileUrl: '/audio/soul-kitchen.mp3', tags: ['vocal', 'warm', 'restaurant'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 1543, uploadedAt: '2025-11-28T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-17', title: 'Rio Nights', artist: 'Luana Ferreira', genre: 'bossa nova', licenseType: 'copyrighted', bpm: 76, key: 'A', valence: 0.58, energy: 0.38, duration: 242, fileUrl: '/audio/rio-nights.mp3', tags: ['brazilian', 'romantic', 'guitar'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 1987, uploadedAt: '2025-11-29T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-18', title: 'Wildflower', artist: 'The Meadows', genre: 'indie', licenseType: 'copyrighted', bpm: 108, key: 'E', valence: 0.68, energy: 0.55, duration: 218, fileUrl: '/audio/wildflower.mp3', tags: ['indie', 'fresh', 'young'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 1762, uploadedAt: '2025-12-01T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-19', title: 'Timber Road', artist: 'Owen Hartley', genre: 'folk', licenseType: 'copyrighted', bpm: 102, key: 'D', valence: 0.62, energy: 0.45, duration: 235, fileUrl: '/audio/timber-road.mp3', tags: ['folk', 'acoustic', 'storytelling'], status: 'active', allowedPlans: ['professional', 'enterprise'], playCount: 1319, uploadedAt: '2025-12-02T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-20', title: 'Champagne Terrace', artist: 'Elise Laurent', genre: 'lounge', licenseType: 'copyrighted', bpm: 94, key: 'Gb', valence: 0.6, energy: 0.4, duration: 278, fileUrl: '/audio/champagne-terrace.mp3', tags: ['luxury', 'upscale', 'evening'], status: 'active', allowedPlans: ['enterprise'], playCount: 963, uploadedAt: '2025-12-05T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-21', title: 'Aurora Borealis', artist: 'Nordic Sound Lab', genre: 'ambient', licenseType: 'copyrighted', bpm: 58, key: 'Eb', valence: 0.4, energy: 0.2, duration: 420, fileUrl: '/audio/aurora-borealis.mp3', tags: ['cinematic', 'vast', 'premium'], status: 'active', allowedPlans: ['enterprise'], playCount: 847, uploadedAt: '2025-12-08T08:00:00Z', uploadedBy: 'admin' },
  { id: 'ml-22', title: 'Velvet Underground', artist: 'Deep Frequency', genre: 'deep house', licenseType: 'copyrighted', bpm: 120, key: 'Cm', valence: 0.68, energy: 0.65, duration: 355, fileUrl: '/audio/velvet-underground.mp3', tags: ['underground', 'bass', 'groove'], status: 'active', allowedPlans: ['enterprise'], playCount: 738, uploadedAt: '2025-12-10T08:00:00Z', uploadedBy: 'admin' },
];

// ─── Customer Mappings ──────────────────────────────────────────

export const mockCustomerMappings: CustomerMusicMapping[] = [
  {
    id: 'cm-1', organizationId: '1', organizationName: 'Luxe Hospitality Group',
    planType: 'professional', subscriptionStatus: 'active',
    allowedLicenseTypes: ['copyright-free', 'copyrighted'],
    allowedGenres: ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'acoustic', 'soul', 'bossa nova', 'indie', 'folk'],
    maxConcurrentVenues: 25, createdAt: '2025-09-12T10:00:00Z', updatedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'cm-2', organizationId: '2', organizationName: 'Sunrise Cafe Chain',
    planType: 'starter', subscriptionStatus: 'active',
    allowedLicenseTypes: ['copyright-free'],
    allowedGenres: ['acoustic', 'jazz', 'ambient', 'folk', 'chill', 'lounge'],
    maxConcurrentVenues: 5, createdAt: '2025-10-20T10:00:00Z', updatedAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'cm-3', organizationId: '3', organizationName: 'Pinnacle Hotels International',
    planType: 'enterprise', subscriptionStatus: 'active',
    allowedLicenseTypes: ['copyright-free', 'copyrighted'],
    allowedGenres: ['jazz', 'lounge', 'ambient', 'classical', 'bossa nova', 'soul', 'chill', 'electronic', 'deep house', 'meditation', 'nature', 'acoustic', 'indie', 'folk'],
    maxConcurrentVenues: 999, createdAt: '2025-08-10T10:00:00Z', updatedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'cm-4', organizationId: '4', organizationName: 'FitZone Gyms',
    planType: 'professional', subscriptionStatus: 'active',
    allowedLicenseTypes: ['copyright-free', 'copyrighted'],
    allowedGenres: ['electronic', 'deep house', 'indie'],
    maxConcurrentVenues: 25, createdAt: '2025-11-01T10:00:00Z', updatedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'cm-5', organizationId: '5', organizationName: 'Tranquil Spas',
    planType: 'starter', subscriptionStatus: 'trial',
    allowedLicenseTypes: ['copyright-free'],
    allowedGenres: ['ambient', 'meditation', 'nature', 'classical'],
    maxConcurrentVenues: 5, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-02-11T10:00:00Z',
  },
];

// ─── Music Sources ──────────────────────────────────────────────

export const mockMusicSources: MusicSource[] = [
  {
    id: 'src-jamendo',
    name: 'Jamendo Music',
    provider: 'Jamendo',
    description: 'Over 600,000 Creative Commons licensed tracks. Free for commercial use with attribution.',
    apiEndpoint: '/api/music/jamendo',
    iconUrl: 'https://www.jamendo.com/favicon.ico',
    status: 'active',
    licenseType: 'copyright-free',
    supportedGenres: ['jazz', 'lounge', 'ambient', 'electronic', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'pop', 'rock'],
    tracksAvailable: 600000,
    tracksUsed: 281,
    lastSyncAt: '2026-02-11T14:00:00Z',
    addedAt: '2025-09-15T08:00:00Z',
    addedBy: 'admin',
  },
  {
    id: 'src-ccmixter',
    name: 'ccMixter',
    provider: 'ccMixter',
    description: 'Community-driven remix platform with CC-licensed instrumental tracks. No API key required.',
    apiEndpoint: '/api/music/ccmixter',
    iconUrl: 'https://ccmixter.org/favicon.ico',
    status: 'active',
    licenseType: 'copyright-free',
    supportedGenres: ['jazz', 'ambient', 'electronic', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'pop', 'rock'],
    tracksAvailable: 45000,
    tracksUsed: 113,
    lastSyncAt: '2026-02-11T14:00:00Z',
    addedAt: '2025-11-01T08:00:00Z',
    addedBy: 'admin',
  },
  {
    id: 'src-uploaded',
    name: 'Uploaded Library',
    provider: 'Internal',
    description: 'Manually uploaded tracks managed by your team. Full control over licensing and categorization.',
    apiEndpoint: '/api/music/library',
    status: 'active',
    licenseType: 'copyright-free',
    supportedGenres: ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'bossa nova', 'nature', 'meditation'],
    tracksAvailable: 22,
    tracksUsed: 22,
    lastSyncAt: '2026-02-11T14:00:00Z',
    addedAt: '2025-09-15T08:00:00Z',
    addedBy: 'admin',
  },
];

// ─── Proof of Play Report Data ──────────────────────────────────

export interface ProofOfPlayEntry {
  id: string;
  venueId: string;
  venueName: string;
  trackTitle: string;
  artist: string;
  genre: string;
  source: string;
  licenseType: string;
  playedAt: string;
  duration: number;
  completedFull: boolean;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalTracks: number;
  totalHours: number;
  venues: number;
  generatedAt: string;
  entries: ProofOfPlayEntry[];
}

function generateProofOfPlayData(): MonthlyReport[] {
  const venueNames: Record<string, string> = { '1': 'The Grand Lounge', '2': 'Skyline Rooftop Bar', '3': 'Zen Spa & Wellness', '4': 'Urban Grind Coffee', '6': 'WeWork SoMa', '7': 'WeWork Financial District', '8': 'WeWork Mission' };
  const genresByVenue: Record<string, string[]> = { '1': ['jazz', 'lounge', 'ambient'], '2': ['electronic', 'deep house', 'chill'], '3': ['ambient', 'nature', 'meditation'], '4': ['indie', 'acoustic', 'folk'], '6': ['chill', 'ambient', 'electronic'], '7': ['lounge', 'jazz', 'acoustic'], '8': ['indie', 'folk', 'chill'] };
  const artists = ['Ambience Studio', 'Clara Voss', 'Nova Beats', 'Marcus Bell', 'Luana Ferreira', 'The Meadows', 'Owen Hartley', 'Nordic Sound Lab', 'Synthwave Collective', 'Deep Frequency', 'Elise Laurent'];
  const sources = ['Jamendo', 'ccMixter', 'Uploaded Library'];
  const trackNames = ['Velvet Dusk', 'Morning Mist', 'Cafe Parisien', 'Cloud Nine', 'Pulse Wave', 'Zen Garden', 'Rainfall', 'Focus Flow', 'Midnight in Manhattan', 'Neon Depths', 'Electric Sunset', 'Soul Kitchen', 'Rio Nights', 'Wildflower', 'Timber Road', 'Lobby Elegance', 'Horizon Glow', 'String Quartet No. 7', 'Golden Hour', 'Deep Current'];

  const reports: MonthlyReport[] = [];
  const months = [
    { month: 'January', year: 2026, days: 31 },
    { month: 'February', year: 2026, days: 11 },
  ];

  for (const m of months) {
    const entries: ProofOfPlayEntry[] = [];
    const venueIds = Object.keys(venueNames);
    let id = 0;
    for (let day = 1; day <= m.days; day++) {
      for (const vid of venueIds) {
        const tracksPerDay = 12 + Math.floor(Math.random() * 6);
        for (let t = 0; t < tracksPerDay; t++) {
          id++;
          const genres = genresByVenue[vid];
          const genre = genres[Math.floor(Math.random() * genres.length)];
          const hour = 7 + Math.floor(Math.random() * 14);
          const min = Math.floor(Math.random() * 60);
          const dur = 180 + Math.floor(Math.random() * 300);
          entries.push({
            id: `pop-${m.month.slice(0, 3).toLowerCase()}-${id}`,
            venueId: vid,
            venueName: venueNames[vid],
            trackTitle: trackNames[Math.floor(Math.random() * trackNames.length)],
            artist: artists[Math.floor(Math.random() * artists.length)],
            genre,
            source: sources[Math.floor(Math.random() * sources.length)],
            licenseType: Math.random() > 0.3 ? 'CC BY' : 'Licensed',
            playedAt: `${m.year}-${String(months.indexOf(m) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00Z`,
            duration: dur,
            completedFull: Math.random() > 0.08,
          });
        }
      }
    }
    const totalHours = Math.round(entries.reduce((s, e) => s + e.duration, 0) / 3600);
    reports.push({
      month: m.month,
      year: m.year,
      totalTracks: entries.length,
      totalHours,
      venues: venueIds.length,
      generatedAt: `${m.year}-${String(months.indexOf(m) + 2).padStart(2, '0')}-01T00:00:00Z`,
      entries,
    });
  }
  return reports;
}

export const mockProofOfPlayReports: MonthlyReport[] = generateProofOfPlayData();
