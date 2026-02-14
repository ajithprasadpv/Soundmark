'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAppState } from '@/lib/store';
import { MusicTrack, LicenseType, PlanType } from '@/types';
import {
  Library, Upload, Play, Pause, Trash2, X, Search, Filter,
  Music, Clock, Shield, Crown, Lock, Unlock, MoreVertical,
  FileAudio, Tag, Disc3, ChevronDown, Plus, Edit, Eye,
  HardDrive, RefreshCw, Globe, FolderOpen, Loader2,
  Volume2, VolumeX, Square, SkipForward,
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
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
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  ar: 'Arabic',
  af: 'African',
  'in-regional': 'Indian Regional',
  'in-instrumental': 'Indian Instrumental',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const allGenres = ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'bossa nova', 'nature', 'meditation'];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicLibraryPage() {
  const { state, dispatch } = useAppState();
  const { musicLibrary, musicCategories } = state;
  const audio = useAudio();

  const [activeTab, setActiveTab] = useState<'catalog' | 's3'>('s3');
  const [filterLicense, setFilterLicense] = useState<'all' | LicenseType>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // S3 Library state
  const [s3Tracks, setS3Tracks] = useState<S3Track[]>([]);
  const [s3Loading, setS3Loading] = useState(false);
  const [s3Error, setS3Error] = useState<string | null>(null);
  const [s3Language, setS3Language] = useState<string>('');
  const [s3Genre, setS3Genre] = useState<string>('');
  const [s3Search, setS3Search] = useState('');
  const [s3SelectedTrack, setS3SelectedTrack] = useState<S3Track | null>(null);
  const [s3PlayingKey, setS3PlayingKey] = useState<string | null>(null);
  const [s3AudioEl, setS3AudioEl] = useState<HTMLAudioElement | null>(null);
  const [s3Progress, setS3Progress] = useState(0);
  const [s3Duration, setS3Duration] = useState(0);
  const [s3CurrentTime, setS3CurrentTime] = useState(0);
  const [s3Muted, setS3Muted] = useState(false);
  const [s3Volume, setS3Volume] = useState(0.8);
  const s3ProgressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const s3PlayStartTime = useRef<number>(0);

  const stopS3Playback = useCallback(() => {
    // Log the play event before stopping
    if (s3AudioEl && s3SelectedTrack && s3PlayStartTime.current > 0) {
      const listenedSec = Math.round(s3AudioEl.currentTime || 0);
      if (listenedSec > 2) { // only log if listened > 2 seconds
        logPlay({
          trackTitle: s3SelectedTrack.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          artist: 'Unknown',
          genre: s3SelectedTrack.genre || 'Unknown',
          language: s3SelectedTrack.language,
          source: 's3',
          durationSec: listenedSec,
        });
      }
    }
    if (s3AudioEl) {
      s3AudioEl.pause();
      s3AudioEl.src = '';
    }
    if (s3ProgressInterval.current) clearInterval(s3ProgressInterval.current);
    s3PlayStartTime.current = 0;
    setS3PlayingKey(null);
    setS3AudioEl(null);
    setS3Progress(0);
    setS3CurrentTime(0);
    setS3Duration(0);
  }, [s3AudioEl, s3SelectedTrack]);

  const fetchS3Tracks = useCallback(async () => {
    setS3Loading(true);
    setS3Error(null);
    try {
      const params = new URLSearchParams();
      if (s3Language) params.set('language', s3Language);
      if (s3Genre) params.set('genre', s3Genre);
      params.set('limit', '200');
      const res = await fetch(`/api/music/library?${params.toString()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setS3Tracks(json.data.tracks || []);
    } catch (err: unknown) {
      setS3Error(err instanceof Error ? err.message : 'Failed to fetch S3 tracks');
    } finally {
      setS3Loading(false);
    }
  }, [s3Language, s3Genre]);

  useEffect(() => {
    if (activeTab === 's3') fetchS3Tracks();
  }, [activeTab, fetchS3Tracks]);

  const playS3Track = (track: S3Track) => {
    if (s3PlayingKey === track.key) {
      // Toggle pause/resume
      if (s3AudioEl?.paused) {
        s3AudioEl.play();
      } else {
        s3AudioEl?.pause();
      }
      return;
    }
    stopS3Playback();
    const proxyUrl = `/api/music/stream/${track.key.split('/').map(s => encodeURIComponent(s)).join('/')}`;
    const el = new Audio(proxyUrl);
    el.volume = s3Volume;
    el.muted = s3Muted;
    el.onloadedmetadata = () => setS3Duration(el.duration);
    el.onended = () => stopS3Playback();
    el.play();
    s3PlayStartTime.current = Date.now();
    setS3AudioEl(el);
    setS3PlayingKey(track.key);
    setS3SelectedTrack(track);
    // Progress tracking
    if (s3ProgressInterval.current) clearInterval(s3ProgressInterval.current);
    s3ProgressInterval.current = setInterval(() => {
      if (el && !el.paused) {
        setS3CurrentTime(el.currentTime);
        setS3Progress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
      }
    }, 250);
  };

  const seekS3 = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!s3AudioEl || !s3Duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    s3AudioEl.currentTime = pct * s3Duration;
    setS3CurrentTime(s3AudioEl.currentTime);
    setS3Progress(pct * 100);
  };

  const toggleS3Mute = () => {
    setS3Muted(prev => {
      const next = !prev;
      if (s3AudioEl) s3AudioEl.muted = next;
      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (s3ProgressInterval.current) clearInterval(s3ProgressInterval.current);
    };
  }, []);

  const filteredS3Tracks = s3Search
    ? s3Tracks.filter(t => t.filename.toLowerCase().includes(s3Search.toLowerCase()) || t.genre.toLowerCase().includes(s3Search.toLowerCase()))
    : s3Tracks;

  const [newTrack, setNewTrack] = useState({
    title: '', artist: '', genre: 'ambient', licenseType: 'copyright-free' as LicenseType,
    bpm: 80, key: 'C', valence: 0.5, energy: 0.5, tags: '',
    allowedPlans: ['starter', 'professional', 'enterprise'] as PlanType[],
  });

  const filteredTracks = musicLibrary.filter(t => {
    if (filterLicense !== 'all' && t.licenseType !== filterLicense) return false;
    if (filterGenre !== 'all' && t.genre !== filterGenre) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    }
    return true;
  });

  const copyrightFreeCount = musicLibrary.filter(t => t.licenseType === 'copyright-free').length;
  const copyrightedCount = musicLibrary.filter(t => t.licenseType === 'copyrighted').length;
  const totalPlayCount = musicLibrary.reduce((sum, t) => sum + t.playCount, 0);

  const handleUpload = () => {
    const track: MusicTrack = {
      id: `ml-${Date.now()}`,
      title: newTrack.title,
      artist: newTrack.artist,
      genre: newTrack.genre,
      licenseType: newTrack.licenseType,
      bpm: newTrack.bpm,
      key: newTrack.key,
      valence: newTrack.valence,
      energy: newTrack.energy,
      duration: Math.floor(180 + Math.random() * 240),
      fileUrl: `/audio/${newTrack.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
      tags: newTrack.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'active',
      allowedPlans: newTrack.allowedPlans,
      playCount: 0,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin',
    };
    dispatch({ type: 'ADD_MUSIC_TRACK', payload: track });
    setShowUpload(false);
    setNewTrack({ title: '', artist: '', genre: 'ambient', licenseType: 'copyright-free', bpm: 80, key: 'C', valence: 0.5, energy: 0.5, tags: '', allowedPlans: ['starter', 'professional', 'enterprise'] });
  };

  const toggleTrackStatus = (track: MusicTrack) => {
    dispatch({ type: 'UPDATE_MUSIC_TRACK', payload: { ...track, status: track.status === 'active' ? 'inactive' : 'active' } });
  };

  const deleteTrack = (id: string) => {
    dispatch({ type: 'DELETE_MUSIC_TRACK', payload: id });
    if (selectedTrack === id) setSelectedTrack(null);
  };

  const togglePlan = (plan: PlanType) => {
    setNewTrack(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }));
  };

  const togglePreview = (trackId: string, genre: string) => {
    if (previewTrackId === trackId) {
      audio.stopPlayback('preview');
      setPreviewTrackId(null);
    } else {
      audio.stopPlayback('preview');
      audio.startPlayback('preview', genre, 50);
      setPreviewTrackId(trackId);
    }
  };

  const planColors: Record<PlanType, string> = {
    starter: 'bg-blue-500/20 text-blue-400',
    professional: 'bg-purple-500/20 text-purple-400',
    enterprise: 'bg-warning/20 text-warning',
  };

  const selected = musicLibrary.find(t => t.id === selectedTrack);

  return (
    <div className="animate-slide-up">
      <Header title="Music Library" description="Manage your music catalog — upload, categorize, and control access" />

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-6 bg-muted/50 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('s3')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 's3' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <HardDrive className="w-4 h-4" /> S3 Library
          {s3Tracks.length > 0 && <Badge variant="outline" className="text-[10px] ml-1">{s3Tracks.length}</Badge>}
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'catalog' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Library className="w-4 h-4" /> Mock Catalog
          <Badge variant="outline" className="text-[10px] ml-1">{musicLibrary.length}</Badge>
        </button>
      </div>

      {/* ═══════════════ S3 LIBRARY TAB ═══════════════ */}
      {activeTab === 's3' && (
        <div>
          {/* S3 Filters */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search files..." value={s3Search} onChange={e => setS3Search(e.target.value)} className="pl-9 w-full sm:w-56 bg-muted border-0" />
              </div>
              <Select value={s3Language} onChange={e => { setS3Language(e.target.value); setS3Genre(''); }} className="w-36 sm:w-44">
                <option value="">All Languages</option>
                {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </Select>
              {s3Language && (
                <Select value={s3Genre} onChange={e => setS3Genre(e.target.value)} className="w-32 sm:w-40">
                  <option value="">All Genres</option>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchS3Tracks} disabled={s3Loading}>
                <RefreshCw className={`w-4 h-4 sm:mr-2 ${s3Loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* S3 Error */}
          {s3Error && (
            <Card className="mb-4 border-destructive/30">
              <CardContent className="p-4 text-sm text-destructive flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" /> {s3Error}
              </CardContent>
            </Card>
          )}

          {/* S3 Loading */}
          {s3Loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
              <span className="text-muted-foreground">Loading tracks from S3...</span>
            </div>
          )}

          {/* S3 Tracks Grid */}
          {!s3Loading && filteredS3Tracks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <div className="min-w-[500px]">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_100px_100px_80px] gap-2 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span>File</span>
                        <span>Language</span>
                        <span>Genre</span>
                        <span className="text-right">Size</span>
                      </div>
                      {/* Rows */}
                      <div className="divide-y divide-border">
                        {filteredS3Tracks.map(track => (
                          <div
                            key={track.key}
                            className={`grid grid-cols-[1fr_100px_100px_80px] gap-2 px-4 py-3 items-center hover:bg-muted/50 transition-colors cursor-pointer ${s3SelectedTrack?.key === track.key ? 'bg-primary/5' : ''}`}
                            onClick={() => setS3SelectedTrack(track)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); playS3Track(track); }}
                                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {s3PlayingKey === track.key ? (
                                  <Pause className="w-4 h-4 text-primary" />
                                ) : (
                                  <Play className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{track.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}</p>
                                <p className="text-xs text-muted-foreground truncate">{track.key}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">{LANGUAGE_LABELS[track.language] || track.language}</span>
                            </div>
                            <span className="text-sm text-muted-foreground capitalize truncate">{track.genre}</span>
                            <span className="text-sm text-muted-foreground text-right font-mono">{formatFileSize(track.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* S3 Track Detail */}
              <div>
                {s3SelectedTrack ? (
                  <Card className="sticky top-8">
                    <CardHeader>
                      <CardTitle className="text-base">Track Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
                          <FileAudio className="w-7 h-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{s3SelectedTrack.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground truncate">{s3SelectedTrack.key}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Language</p>
                          <p className="font-medium">{LANGUAGE_LABELS[s3SelectedTrack.language] || s3SelectedTrack.language}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Genre</p>
                          <p className="font-medium capitalize">{s3SelectedTrack.genre}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">File Size</p>
                          <p className="font-medium">{formatFileSize(s3SelectedTrack.size)}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Modified</p>
                          <p className="font-medium">{new Date(s3SelectedTrack.lastModified).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => playS3Track(s3SelectedTrack)}>
                        {s3PlayingKey === s3SelectedTrack.key ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Play</>}
                      </Button>
                      <a href={s3SelectedTrack.streamUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full">
                          <FolderOpen className="w-4 h-4 mr-2" /> Open Stream URL
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="sticky top-8">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <HardDrive className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Select a track to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ── Mini Player Bar ── */}
          {s3PlayingKey && (() => {
            const nowPlaying = s3Tracks.find(t => t.key === s3PlayingKey);
            if (!nowPlaying) return null;
            const fmtTime = (s: number) => {
              const m = Math.floor(s / 60);
              const sec = Math.floor(s % 60);
              return `${m}:${sec.toString().padStart(2, '0')}`;
            };
            return (
              <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-64 bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-2xl shadow-black/20">
                {/* Progress bar — clickable to seek */}
                <div
                  className="h-2 bg-muted cursor-pointer group relative"
                  onClick={seekS3}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-[width] duration-200"
                    style={{ width: `${s3Progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${s3Progress}%`, marginLeft: '-6px' }}
                  />
                </div>

                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3.5">
                  {/* Track info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <Music className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{nowPlaying.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{LANGUAGE_LABELS[nowPlaying.language] || nowPlaying.language} • {nowPlaying.genre}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-[11px] text-muted-foreground font-mono hidden sm:block">
                    {fmtTime(s3CurrentTime)} / {fmtTime(s3Duration)}
                  </span>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    {/* Play/Pause */}
                    <button
                      onClick={() => playS3Track(nowPlaying)}
                      className="w-10 h-10 rounded-full bg-violet-500 hover:bg-violet-600 flex items-center justify-center text-white transition-colors cursor-pointer shadow-md shadow-violet-500/30"
                    >
                      {s3AudioEl?.paused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                    </button>

                    {/* Mute */}
                    <button
                      onClick={toggleS3Mute}
                      className="w-8 h-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={s3Muted ? 'Unmute' : 'Mute'}
                    >
                      {s3Muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Volume slider — desktop only */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={s3Muted ? 0 : s3Volume}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        setS3Volume(v);
                        if (s3AudioEl) s3AudioEl.volume = v;
                        if (v > 0 && s3Muted) setS3Muted(false);
                      }}
                      className="w-20 h-1 accent-violet-500 hidden sm:block cursor-pointer"
                    />

                    {/* Stop */}
                    <button
                      onClick={stopS3Playback}
                      className="w-8 h-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Stop"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* S3 Empty State */}
          {!s3Loading && !s3Error && filteredS3Tracks.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium mb-1">No tracks in S3</p>
                <p className="text-sm">Upload songs using the CLI script or the upload API</p>
                <code className="block mt-3 text-xs bg-muted rounded-lg p-3 text-left max-w-md mx-auto">
                  ./scripts/bulk-upload.sh ~/soundmark-songs
                </code>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════ MOCK CATALOG TAB ═══════════════ */}
      {activeTab === 'catalog' && (<div>
      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tracks</p>
                <p className="text-3xl font-bold mt-1">{musicLibrary.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Library className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-success/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Copyright-Free</p>
                <p className="text-3xl font-bold mt-1">{copyrightFreeCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-warning/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Copyrighted</p>
                <p className="text-3xl font-bold mt-1">{copyrightedCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-purple-400/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plays</p>
                <p className="text-3xl font-bold mt-1">{totalPlayCount.toLocaleString()}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tracks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-56 bg-muted border-0" />
          </div>
          <Select value={filterLicense} onChange={e => setFilterLicense(e.target.value as 'all' | LicenseType)} className="w-32 sm:w-44">
            <option value="all">All Licenses</option>
            <option value="copyright-free">Copyright-Free</option>
            <option value="copyrighted">Copyrighted</option>
          </Select>
          <Select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} className="w-28 sm:w-36">
            <option value="all">All Genres</option>
            {allGenres.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </Select>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')} className="w-28 sm:w-32">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Upload Track</span>
        </Button>
      </div>

      {/* Track List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_100px_80px_100px_80px] gap-2 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Track</span>
                <span>Genre</span>
                <span>License</span>
                <span>BPM</span>
                <span>Plans</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Track Rows */}
              <div className="divide-y divide-border">
                {filteredTracks.map(track => (
                  <div
                    key={track.id}
                    className={`grid grid-cols-[1fr_120px_100px_80px_100px_80px] gap-2 px-4 py-3 items-center hover:bg-muted/50 transition-colors cursor-pointer ${selectedTrack === track.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePreview(track.id, track.genre); }}
                        className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        {previewTrackId === track.id ? (
                          <Pause className="w-4 h-4 text-primary" />
                        ) : (
                          <Play className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist} • {formatDuration(track.duration)}</p>
                      </div>
                    </div>

                    {/* Genre */}
                    <span className="text-sm text-muted-foreground capitalize truncate">{track.genre}</span>

                    {/* License */}
                    <Badge variant={track.licenseType === 'copyright-free' ? 'success' : 'warning'} className="text-[10px] w-fit">
                      {track.licenseType === 'copyright-free' ? 'Free' : 'Licensed'}
                    </Badge>

                    {/* BPM */}
                    <span className="text-sm text-muted-foreground">{track.bpm || '—'}</span>

                    {/* Plans */}
                    <div className="flex gap-0.5">
                      {track.allowedPlans.map(p => (
                        <span key={p} className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center ${planColors[p]}`}>
                          {p.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleTrackStatus(track); }}
                        className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${track.status === 'active' ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={track.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                        className="w-7 h-7 rounded flex items-center justify-center text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              </div>
              {filteredTracks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tracks found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Track Detail Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Track Details</CardTitle>
                  <Badge variant={selected.status === 'active' ? 'success' : 'outline'}>{selected.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
                    <FileAudio className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selected.title}</p>
                    <p className="text-sm text-muted-foreground">{selected.artist}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Genre</p>
                    <p className="font-medium capitalize">{selected.genre}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">BPM</p>
                    <p className="font-medium">{selected.bpm || '—'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Key</p>
                    <p className="font-medium">{selected.key}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(selected.duration)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Energy</p>
                    <p className="font-medium">{Math.round(selected.energy * 100)}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Play Count</p>
                    <p className="font-medium">{selected.playCount.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">License Type</p>
                  <Badge variant={selected.licenseType === 'copyright-free' ? 'success' : 'warning'}>
                    {selected.licenseType === 'copyright-free' ? 'Copyright-Free' : 'Copyrighted / Licensed'}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Allowed Plans</p>
                  <div className="flex gap-1.5">
                    {selected.allowedPlans.map(p => (
                      <Badge key={p} className={planColors[p]}>{p}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                  Uploaded {new Date(selected.uploadedAt).toLocaleDateString()} by {selected.uploadedBy}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-8">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileAudio className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a track to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>)}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upload New Track</CardTitle>
                <CardDescription>Add a new track to the music library</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop audio file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, FLAC up to 50MB</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Track Title</label>
                  <Input placeholder="e.g. Midnight Serenade" value={newTrack.title} onChange={e => setNewTrack({ ...newTrack, title: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Artist</label>
                  <Input placeholder="e.g. Soundmark Studio" value={newTrack.artist} onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Genre</label>
                  <Select value={newTrack.genre} onChange={e => setNewTrack({ ...newTrack, genre: e.target.value })}>
                    {allGenres.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">License Type</label>
                  <Select value={newTrack.licenseType} onChange={e => setNewTrack({ ...newTrack, licenseType: e.target.value as LicenseType })}>
                    <option value="copyright-free">Copyright-Free</option>
                    <option value="copyrighted">Copyrighted</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">BPM</label>
                  <Input type="number" value={newTrack.bpm} onChange={e => setNewTrack({ ...newTrack, bpm: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Key</label>
                  <Input placeholder="e.g. Am, C, Dm" value={newTrack.key} onChange={e => setNewTrack({ ...newTrack, key: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input placeholder="e.g. smooth, evening, warm" value={newTrack.tags} onChange={e => setNewTrack({ ...newTrack, tags: e.target.value })} />
                </div>
              </div>

              {/* Plan Access */}
              <div>
                <label className="text-sm font-medium mb-2 block">Allowed Subscription Plans</label>
                <div className="flex gap-2">
                  {(['starter', 'professional', 'enterprise'] as PlanType[]).map(plan => (
                    <button
                      key={plan}
                      onClick={() => togglePlan(plan)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        newTrack.allowedPlans.includes(plan)
                          ? plan === 'starter' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : plan === 'professional' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-warning/20 text-warning border-warning/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {plan === 'starter' && '⭐ Starter'}
                      {plan === 'professional' && '💎 Professional'}
                      {plan === 'enterprise' && '👑 Enterprise'}
                    </button>
                  ))}
                </div>
                {newTrack.licenseType === 'copyrighted' && newTrack.allowedPlans.includes('starter') && (
                  <p className="text-xs text-warning mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Copyrighted tracks are typically not available on Starter plans
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleUpload} disabled={!newTrack.title || !newTrack.artist}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Track
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
