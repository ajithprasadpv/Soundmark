export type UserRole = 'super_admin' | 'admin' | 'owner' | 'manager' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type PlanType = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled';
export type VenueStatus = 'active' | 'inactive' | 'setup';
export type VenueType = 'restaurant' | 'cafe' | 'hotel' | 'retail' | 'spa' | 'gym' | 'office' | 'bar' | 'lounge' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}

export interface Venue {
  id: string;
  organizationId: string;
  name: string;
  venueType: VenueType;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  status: VenueStatus;
  createdAt: string;
  updatedAt: string;
  configuration?: VenueConfiguration;
}

export type MusicSourceType = 'jamendo' | 's3';

export interface VenueConfiguration {
  id: string;
  venueId: string;
  preferredGenres: string[];
  tempoRange: { min: number; max: number };
  valenceRange: { min: number; max: number };
  energyRange: { min: number; max: number };
  volumeLevel: number;
  musicSource?: MusicSourceType;
}

export interface PlaybackState {
  venueId: string;
  isPlaying: boolean;
  currentTrack?: Track;
  volume: number;
  startedAt?: string;
}

export interface Track {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  valence: number;
  energy: number;
  duration: number;
  generatedAt: string;
}

export interface EnvironmentData {
  venueId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  weatherCondition: string;
  ambientLight: number;
  crowdDensity: number;
}

export interface Schedule {
  id: string;
  venueId: string;
  name: string;
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
  genres: string[];
  tempoRange: { min: number; max: number };
  energyRange: { min: number; max: number };
  isActive: boolean;
}

export interface AnalyticsData {
  totalVenues: number;
  activeVenues: number;
  totalPlaybackHours: number;
  avgSatisfactionScore: number;
  tracksGenerated: number;
  peakHour: string;
  dailyPlayback: { date: string; hours: number }[];
  genreDistribution: { genre: string; percentage: number }[];
  venueActivity: { venue: string; hours: number; tracks: number }[];
  hourlyActivity: { hour: string; venues: number }[];
}

export type LicenseType = 'copyright-free' | 'copyrighted';
export type MusicTrackStatus = 'active' | 'inactive' | 'processing';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  subGenre?: string;
  licenseType: LicenseType;
  bpm: number;
  key: string;
  valence: number;
  energy: number;
  duration: number;
  fileUrl: string;
  coverUrl?: string;
  tags: string[];
  status: MusicTrackStatus;
  allowedPlans: PlanType[];
  playCount: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface MusicCategory {
  id: string;
  name: string;
  licenseType: LicenseType;
  description: string;
  trackCount: number;
  genres: string[];
}

export interface CustomerMusicMapping {
  id: string;
  organizationId: string;
  organizationName: string;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  allowedLicenseTypes: LicenseType[];
  allowedGenres: string[];
  customTrackIds?: string[];
  maxConcurrentVenues: number;
  createdAt: string;
  updatedAt: string;
}

export type MusicSourceStatus = 'active' | 'disabled' | 'error';

export interface MusicSource {
  id: string;
  name: string;
  provider: string;
  description: string;
  apiEndpoint: string;
  iconUrl?: string;
  status: MusicSourceStatus;
  licenseType: LicenseType;
  supportedGenres: string[];
  tracksAvailable: number;
  tracksUsed: number;
  lastSyncAt: string;
  addedAt: string;
  addedBy: string;
}

export interface FavoriteTrack {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  genre: string;
  source: string;
  albumImage: string;
  audioUrl: string;
  favoritedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  venueId?: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
