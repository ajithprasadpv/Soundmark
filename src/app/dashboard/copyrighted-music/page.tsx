'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Play, Pause, SkipForward, SkipBack, Search, Music, Shield,
  Volume2, VolumeX, Clock, Shuffle, Repeat, Loader2, RefreshCw,
  Globe, ListMusic, Disc3,
} from 'lucide-react';
import { logPlay } from '@/lib/analytics-tracker';

interface S3Track {
  key: string;
  size: number;
  lastModified: string;
  language: string;
  genre: string;
  filename: string;
  streamUrl: string;
  languageName: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English', hi: 'Hindi', es: 'Spanish', ar: 'Arabic',
  af: 'African', 'in-regional': 'Indian Regional', 'in-instrumental': 'Indian Instrumental',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function trackName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
}

function parseArtistTitle(filename: string): { artist: string; title: string } {
  const clean = filename.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
  const parts = clean.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: 'Unknown Artist', title: clean };
}

export default function CopyrightedMusicPage() {
  const [tracks, setTracks] = useState<S3Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [search, setSearch] = useState('');

  // Player state
  const [playlist, setPlaylist] = useState<S3Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playStartRef = useRef(0);

  const currentTrack = playlist[currentIndex] || null;

  // Fetch tracks
  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (language) params.set('language', language);
      if (genre) params.set('genre', genre);
      params.set('limit', '500');
      const res = await fetch(`/api/music/library?${params.toString()}`);
      const json = await res.json();
      setTracks(json.data?.tracks || []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [language, genre]);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  const filteredTracks = search
    ? tracks.filter(t => t.filename.toLowerCase().includes(search.toLowerCase()) || t.genre.toLowerCase().includes(search.toLowerCase()))
    : tracks;

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    };
  }, []);

  // Play a specific track from the filtered list
  const playTrack = useCallback((index: number, trackList?: S3Track[]) => {
    const list = trackList || filteredTracks;
    if (index < 0 || index >= list.length) return;

    // Stop current
    if (audioRef.current) {
      // Log previous play
      if (currentTrack && playStartRef.current > 0) {
        const sec = Math.round(audioRef.current.currentTime || 0);
        if (sec > 2) {
          logPlay({
            trackTitle: trackName(currentTrack.filename),
            artist: 'Unknown',
            genre: currentTrack.genre || 'Unknown',
            language: currentTrack.language,
            source: 's3',
            durationSec: sec,
          });
        }
      }
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (progressRef.current) clearInterval(progressRef.current);

    setPlaylist(list);
    setCurrentIndex(index);

    const track = list[index];
    const proxyUrl = `/api/music/stream/${track.key.split('/').map(s => encodeURIComponent(s)).join('/')}`;
    const el = new Audio(proxyUrl);
    el.volume = volume;
    el.muted = muted;

    el.onloadedmetadata = () => setDuration(el.duration);
    el.onended = () => {
      if (repeatMode === 'one') {
        el.currentTime = 0;
        el.play();
      } else {
        skipNext();
      }
    };
    el.onerror = () => skipNext();
    el.play().catch(() => {});

    audioRef.current = el;
    playStartRef.current = Date.now();
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    progressRef.current = setInterval(() => {
      if (el && !el.paused) {
        setCurrentTime(el.currentTime);
        setDuration(el.duration || 0);
      }
    }, 250);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTracks, volume, muted, repeatMode]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const skipNext = useCallback(() => {
    if (playlist.length === 0) return;
    let next: number;
    if (shuffled) {
      next = Math.floor(Math.random() * playlist.length);
    } else {
      next = (currentIndex + 1) % playlist.length;
    }
    if (next === 0 && repeatMode === 'off' && !shuffled) {
      // End of playlist, stop
      setIsPlaying(false);
      return;
    }
    playTrack(next, playlist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, currentIndex, shuffled, repeatMode]);

  const skipPrev = useCallback(() => {
    if (playlist.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(prev, playlist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, currentIndex]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0 && muted) setMuted(false);
  };

  const toggleMute = () => {
    setMuted(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  const playAll = () => {
    const list = shuffled ? [...filteredTracks].sort(() => Math.random() - 0.5) : filteredTracks;
    if (list.length > 0) playTrack(0, list);
  };

  // Unique genres and languages from tracks
  const uniqueGenres = [...new Set(tracks.map(t => t.genre))].sort();
  const uniqueLanguages = [...new Set(tracks.map(t => t.language))].sort();

  return (
    <div className="animate-slide-up">
      <Header title="Copyrighted Music" description="Licensed music from your S3 library — select and play tracks" />

      {/* Hero / Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-red-500/20 flex items-center justify-center shadow-xl shadow-amber-500/10 border border-amber-500/10">
          <Shield className="w-12 h-12 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning" className="text-xs">Licensed</Badge>
            <Badge variant="outline" className="text-xs">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</Badge>
          </div>
          <p className="text-sm text-muted-foreground/70 mb-3">
            Your copyrighted music library stored in S3. Select tracks to play on venues or devices.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20"
              onClick={playAll}
              disabled={filteredTracks.length === 0}
            >
              <Play className="w-4 h-4 mr-1.5" /> Play All
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShuffled(!shuffled); }} className={shuffled ? 'border-amber-500/40 text-amber-400' : ''}>
              <Shuffle className="w-4 h-4 mr-1.5" /> Shuffle {shuffled ? 'On' : 'Off'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTracks} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tracks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-0" />
        </div>
        <Select value={language} onChange={e => { setLanguage(e.target.value); setGenre(''); }} className="w-36">
          <option value="">All Languages</option>
          {uniqueLanguages.map(l => (
            <option key={l} value={l}>{LANGUAGE_LABELS[l] || l}</option>
          ))}
        </Select>
        <Select value={genre} onChange={e => setGenre(e.target.value)} className="w-36">
          <option value="">All Genres</option>
          {uniqueGenres.map(g => (
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </Select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400 mr-3" />
          <span className="text-muted-foreground">Loading S3 library...</span>
        </div>
      )}

      {/* Track List — Spotify-style */}
      {!loading && filteredTracks.length > 0 && (
        <Card className="border-border/60 bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_120px_100px_80px] gap-3 px-4 py-3 border-b border-border/60 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="hidden sm:block">Language</span>
              <span className="hidden sm:block">Genre</span>
              <span className="text-right">Size</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/30">
              {filteredTracks.map((track, idx) => {
                const { artist, title } = parseArtistTitle(track.filename);
                const isCurrent = currentTrack?.key === track.key;
                const isThisPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.key}
                    className={`group grid grid-cols-[40px_1fr_120px_100px_80px] gap-3 px-4 py-2.5 items-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/[0.06]'
                        : 'hover:bg-foreground/[0.03]'
                    }`}
                    onDoubleClick={() => playTrack(idx)}
                  >
                    {/* Number / Play */}
                    <div className="flex items-center justify-center">
                      {isThisPlaying ? (
                        <div className="flex gap-[2px] items-end h-3.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-[2.5px] bg-amber-400 rounded-full eq-bar" style={{ animationDelay: `${i * 0.12}s`, height: '40%' }} />
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground/50 group-hover:hidden">{idx + 1}</span>
                          <button
                            onClick={() => playTrack(idx)}
                            className="hidden group-hover:flex w-7 h-7 items-center justify-center cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 text-foreground" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Title + Artist */}
                    <div className="min-w-0" onClick={() => playTrack(idx)}>
                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-amber-400' : 'text-foreground/90'}`}>
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground/60 truncate">{artist}</p>
                    </div>

                    {/* Language */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                      <span className="text-xs text-muted-foreground/60 truncate">{LANGUAGE_LABELS[track.language] || track.language}</span>
                    </div>

                    {/* Genre */}
                    <span className="hidden sm:block text-xs text-muted-foreground/60 capitalize truncate">{track.genre}</span>

                    {/* Size */}
                    <span className="text-xs text-muted-foreground/50 text-right font-mono">{formatFileSize(track.size)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredTracks.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="p-16 text-center text-muted-foreground/50">
            <Disc3 className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No tracks found</p>
            <p className="text-sm">Upload songs to your S3 bucket to see them here</p>
            <code className="block mt-3 text-xs bg-muted/50 rounded-lg p-3 max-w-md mx-auto text-left">
              ./scripts/bulk-upload.sh ~/soundmark-songs
            </code>
          </CardContent>
        </Card>
      )}

      {/* ─── Bottom Player Bar ─── */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-64 bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-2xl shadow-black/30">
          {/* Progress bar */}
          <div className="h-1.5 bg-muted/50 cursor-pointer group relative" onClick={seek}>
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, marginLeft: '-7px' }}
            />
          </div>

          <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground/90">{parseArtistTitle(currentTrack.filename).title}</p>
                <p className="text-[11px] text-muted-foreground/60 truncate">
                  {parseArtistTitle(currentTrack.filename).artist} • {currentTrack.genre} • S3 Library
                </p>
              </div>
            </div>

            {/* Time */}
            <span className="text-[11px] text-muted-foreground/50 font-mono hidden sm:block whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={() => setShuffled(!shuffled)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${shuffled ? 'text-amber-400' : 'text-muted-foreground/50 hover:text-foreground'}`}>
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button onClick={skipPrev} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-black transition-colors cursor-pointer shadow-md shadow-amber-500/30"
              >
                {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
              </button>
              <button onClick={skipNext} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${repeatMode !== 'off' ? 'text-amber-400' : 'text-muted-foreground/50 hover:text-foreground'}`}
              >
                <Repeat className="w-3.5 h-3.5" />
                {repeatMode === 'one' && <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-amber-400">1</span>}
              </button>
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button onClick={toggleMute} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground cursor-pointer">
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
