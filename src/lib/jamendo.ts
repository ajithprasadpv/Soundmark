// Unified music source fetcher — supports Jamendo + ccMixter + extensible
// All requests go through our Next.js API routes to avoid CORS issues

export interface MusicTrackResult {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  image: string;
  shareurl: string;
  source: string;
}

// ─── Jamendo ────────────────────────────────────────────────────

interface JamendoResponse {
  headers: { status: string; code: number; results_count: number };
  results: JamendoRawTrack[];
}

interface JamendoRawTrack {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_name: string;
  album_id: string;
  album_image: string;
  audio: string;
  audiodownload: string;
  image: string;
  shareurl: string;
  releasedate: string;
}

// Keep the old export name for backward compat
export type JamendoTrack = MusicTrackResult;

const GENRE_TAG_MAP: Record<string, string> = {
  jazz: 'jazz',
  lounge: 'lounge',
  ambient: 'ambient',
  electronic: 'electronic',
  'deep house': 'deephouse',
  chill: 'chillout',
  classical: 'classical',
  acoustic: 'acoustic',
  folk: 'folk',
  indie: 'indie',
  soul: 'soul',
  'bossa nova': 'bossanova',
  nature: 'nature',
  meditation: 'relaxation',
  pop: 'pop',
  rock: 'rock',
};

async function fetchFromJamendo(genre: string, limit: number, offset: number): Promise<MusicTrackResult[]> {
  const tag = GENRE_TAG_MAP[genre.toLowerCase()] || genre.toLowerCase();
  const url = `/api/music/jamendo?genre=${encodeURIComponent(tag)}&limit=${limit}&offset=${offset}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data: JamendoResponse = await res.json();
    return (data.results || []).map((t) => ({
      id: `jam-${t.id}`,
      name: t.name,
      duration: t.duration,
      artist_name: t.artist_name,
      album_name: t.album_name,
      album_image: t.album_image,
      audio: t.audio,
      image: t.image,
      shareurl: t.shareurl,
      source: 'Jamendo',
    }));
  } catch (err) {
    console.error('Jamendo fetch error:', err);
    return [];
  }
}

// ─── ccMixter ───────────────────────────────────────────────────

const CCMIXTER_GENRE_MAP: Record<string, string> = {
  jazz: 'jazz',
  lounge: 'lounge',
  ambient: 'ambient',
  electronic: 'electronic',
  'deep house': 'electronic',
  chill: 'chill',
  classical: 'classical',
  acoustic: 'acoustic',
  folk: 'folk',
  indie: 'indie',
  soul: 'soul',
  'bossa nova': 'jazz',
  nature: 'ambient',
  meditation: 'ambient',
  pop: 'pop',
  rock: 'rock',
};

async function fetchFromCcMixter(genre: string, limit: number, offset: number): Promise<MusicTrackResult[]> {
  const tag = CCMIXTER_GENRE_MAP[genre.toLowerCase()] || genre.toLowerCase();
  const url = `/api/music/ccmixter?genre=${encodeURIComponent(tag)}&limit=${limit}&offset=${offset}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []) as MusicTrackResult[];
  } catch (err) {
    console.error('ccMixter fetch error:', err);
    return [];
  }
}

// ─── Unified Fetcher ────────────────────────────────────────────

export type MusicSourceId = 'jamendo' | 'ccmixter' | 'all';

export async function fetchJamendoTracks(
  genre: string,
  limit: number = 10,
  offset: number = 0,
  sourceId: MusicSourceId = 'all',
): Promise<MusicTrackResult[]> {
  if (sourceId === 'jamendo') {
    return fetchFromJamendo(genre, limit, offset);
  }
  if (sourceId === 'ccmixter') {
    return fetchFromCcMixter(genre, limit, offset);
  }

  // 'all' — fetch from both sources in parallel and merge
  const perSource = Math.ceil(limit / 2);
  const [jamendo, ccmixter] = await Promise.all([
    fetchFromJamendo(genre, perSource, offset),
    fetchFromCcMixter(genre, perSource, offset),
  ]);

  // Interleave results from both sources
  const merged: MusicTrackResult[] = [];
  const maxLen = Math.max(jamendo.length, ccmixter.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < jamendo.length) merged.push(jamendo[i]);
    if (i < ccmixter.length) merged.push(ccmixter[i]);
  }
  return merged.slice(0, limit);
}

export async function fetchMultipleGenres(
  genres: string[],
  tracksPerGenre: number = 8,
): Promise<Record<string, MusicTrackResult[]>> {
  const results: Record<string, MusicTrackResult[]> = {};
  const promises = genres.map(async (genre) => {
    const tracks = await fetchJamendoTracks(genre, tracksPerGenre);
    results[genre] = tracks;
  });
  await Promise.all(promises);
  return results;
}

export async function fetchFeaturedTracks(limit: number = 20): Promise<MusicTrackResult[]> {
  const url = `/api/music/jamendo?featured=1&limit=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data: JamendoResponse = await res.json();
    return (data.results || []).map((t) => ({
      id: `jam-${t.id}`,
      name: t.name,
      duration: t.duration,
      artist_name: t.artist_name,
      album_name: t.album_name,
      album_image: t.album_image,
      audio: t.audio,
      image: t.image,
      shareurl: t.shareurl,
      source: 'Jamendo',
    }));
  } catch (err) {
    console.error('Jamendo featured fetch error:', err);
    return [];
  }
}
