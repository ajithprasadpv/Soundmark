'use client';

// ─── Playback Analytics Tracker ─────────────────────────────────
// Persists play events in localStorage. Auto-purges events older than 5 days.
// Keeps max 200 events to minimize storage footprint.

const STORAGE_KEY = 'soundmark_play_events';
const MAX_EVENTS = 200;
const MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export interface PlayEvent {
  id: string;
  trackTitle: string;
  artist: string;
  genre: string;
  language?: string;
  source: 's3' | 'venue';
  durationSec: number;
  playedAt: string;
}

export interface ComputedAnalytics {
  totalPlaybackHours: number;
  tracksPlayed: number;
  genreDistribution: { genre: string; percentage: number }[];
  dailyPlayback: { date: string; hours: number }[];
  peakHour: string;
  recentTracks: PlayEvent[];
}

// ─── Storage helpers ────────────────────────────────────────────

function getStoredEvents(): PlayEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const events: PlayEvent[] = JSON.parse(raw);
    // Purge events older than 5 days
    const cutoff = Date.now() - MAX_AGE_MS;
    return events.filter(e => new Date(e.playedAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

function saveEvents(events: PlayEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    // Keep only recent events within 5 days, cap at MAX_EVENTS
    const cutoff = Date.now() - MAX_AGE_MS;
    const fresh = events
      .filter(e => new Date(e.playedAt).getTime() > cutoff)
      .slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // localStorage full — silently fail
  }
}

// ─── Public API ─────────────────────────────────────────────────

export function logPlay(event: Omit<PlayEvent, 'id' | 'playedAt'>) {
  const events = getStoredEvents();
  events.push({
    ...event,
    id: `p${Date.now()}`,
    playedAt: new Date().toISOString(),
  });
  saveEvents(events);
}

export function getAnalytics(): ComputedAnalytics {
  const events = getStoredEvents();
  // Also save back (auto-purges stale entries)
  if (events.length > 0) saveEvents(events);

  if (events.length === 0) {
    return {
      totalPlaybackHours: 0,
      tracksPlayed: 0,
      genreDistribution: [],
      dailyPlayback: [],
      peakHour: '--',
      recentTracks: [],
    };
  }

  const totalSec = events.reduce((s, e) => s + e.durationSec, 0);
  const totalPlaybackHours = parseFloat((totalSec / 3600).toFixed(1));

  // Genre distribution
  const gc: Record<string, number> = {};
  events.forEach(e => { gc[e.genre || 'Unknown'] = (gc[e.genre || 'Unknown'] || 0) + 1; });
  const genreDistribution = Object.entries(gc)
    .map(([genre, count]) => ({ genre, percentage: parseFloat(((count / events.length) * 100).toFixed(1)) }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  // Daily playback (last 5 days)
  const dm: Record<string, number> = {};
  events.forEach(e => { const d = e.playedAt.split('T')[0]; dm[d] = (dm[d] || 0) + e.durationSec; });
  const dailyPlayback = Object.entries(dm)
    .map(([date, sec]) => ({ date, hours: parseFloat((sec / 3600).toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Peak hour
  const hc: Record<number, number> = {};
  events.forEach(e => { const h = new Date(e.playedAt).getHours(); hc[h] = (hc[h] || 0) + 1; });
  const ph = Object.entries(hc).sort(([, a], [, b]) => b - a)[0]?.[0];
  const peakHour = ph !== undefined
    ? `${parseInt(ph) % 12 || 12}:00 ${parseInt(ph) >= 12 ? 'PM' : 'AM'}`
    : '--';

  return {
    totalPlaybackHours,
    tracksPlayed: events.length,
    genreDistribution,
    dailyPlayback,
    peakHour,
    recentTracks: events.slice(-10).reverse(),
  };
}
