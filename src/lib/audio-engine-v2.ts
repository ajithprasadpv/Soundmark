'use client';

import { fetchJamendoTracks, fetchS3Tracks, MusicTrackResult } from './jamendo';
import type { MusicSourceType } from '@/types';

export interface NowPlayingInfo {
  trackName: string;
  artistName: string;
  albumImage: string;
  duration: number;
  genre: string;
  currentTime: number;
  isPlaying: boolean;
  source: string;
}

type PlaybackListener = (venueId: string, info: NowPlayingInfo | null) => void;

class VenuePlayer {
  private audioEl: HTMLAudioElement | null = null;
  private playlist: MusicTrackResult[] = [];
  private currentIndex = 0;
  private genre: string;
  private volume: number;
  private venueId: string;
  private musicSource: MusicSourceType;
  private onUpdate: (info: NowPlayingInfo | null) => void;
  private loading = false;
  private destroyed = false;

  constructor(venueId: string, genre: string, volume: number, onUpdate: (info: NowPlayingInfo | null) => void, musicSource: MusicSourceType = 'jamendo') {
    this.venueId = venueId;
    this.genre = genre;
    this.volume = volume / 100;
    this.onUpdate = onUpdate;
    this.musicSource = musicSource;
  }

  async start() {
    if (this.destroyed) return;
    this.loading = true;

    let tracks: MusicTrackResult[];

    if (this.musicSource === 's3') {
      // Fetch all copyrighted tracks from S3 library (no genre filter — library is small)
      console.log('[Soundmark] Fetching S3 copyrighted tracks...');
      tracks = await fetchS3Tracks('', 100);
      console.log(`[Soundmark] Got ${tracks.length} S3 tracks`);
      if (this.destroyed) return;
    } else {
      // Fetch copyright-free tracks from Jamendo + ccMixter
      tracks = await fetchJamendoTracks(this.genre, 10, Math.floor(Math.random() * 20));
      if (this.destroyed) return;

      if (tracks.length === 0) {
        const fallback = await fetchJamendoTracks('ambient', 10);
        if (this.destroyed) return;
        tracks = fallback;
      }
    }

    this.playlist = tracks;
    this.loading = false;

    if (this.playlist.length > 0) {
      // Shuffle playlist
      this.playlist = this.playlist.sort(() => Math.random() - 0.5);
      this.currentIndex = 0;
      this.playCurrentTrack();
    }
  }

  private playCurrentTrack() {
    if (this.destroyed || this.playlist.length === 0) return;

    const track = this.playlist[this.currentIndex];
    if (!track || !track.audio) {
      this.next();
      return;
    }

    // Clean up previous audio element
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
    }

    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.volume = this.volume;
    this.audioEl.src = track.audio;

    this.audioEl.onended = () => {
      this.next();
    };

    this.audioEl.onerror = () => {
      // Skip broken tracks
      console.warn(`Failed to load track: ${track.name}, skipping...`);
      setTimeout(() => this.next(), 500);
    };

    this.audioEl.onplay = () => {
      this.emitUpdate();
    };

    this.audioEl.ontimeupdate = () => {
      this.emitUpdate();
    };

    this.audioEl.play().catch((err) => {
      console.warn('Playback blocked or failed:', err.message);
      // Browser may block autoplay — user interaction needed
    });
  }

  private emitUpdate() {
    if (this.destroyed || !this.audioEl) return;
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    this.onUpdate({
      trackName: track.name,
      artistName: track.artist_name,
      albumImage: track.album_image || track.image,
      duration: track.duration || (this.audioEl.duration || 0),
      genre: this.genre,
      currentTime: this.audioEl.currentTime,
      isPlaying: !this.audioEl.paused,
      source: track.source || 'Unknown',
    });
  }

  next() {
    if (this.destroyed) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playCurrentTrack();
  }

  previous() {
    if (this.destroyed) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playCurrentTrack();
  }

  setVolume(vol: number) {
    this.volume = vol / 100;
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  seek(time: number) {
    if (this.audioEl && isFinite(time)) {
      this.audioEl.currentTime = time;
    }
  }

  pause() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.emitUpdate();
    }
  }

  resume() {
    if (this.audioEl) {
      this.audioEl.play().catch(() => {});
      this.emitUpdate();
    }
  }

  getInfo(): NowPlayingInfo | null {
    if (!this.audioEl || this.playlist.length === 0) return null;
    const track = this.playlist[this.currentIndex];
    if (!track) return null;
    return {
      trackName: track.name,
      artistName: track.artist_name,
      albumImage: track.album_image || track.image,
      duration: track.duration || (this.audioEl.duration || 0),
      genre: this.genre,
      currentTime: this.audioEl.currentTime,
      isPlaying: !this.audioEl.paused,
      source: track.source || 'Unknown',
    };
  }

  getPlaylist(): MusicTrackResult[] {
    return this.playlist;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  stop() {
    this.destroyed = true;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
      this.audioEl = null;
    }
    this.onUpdate(null);
  }
}

export class SoundmarkAudioEngine {
  private players: Map<string, VenuePlayer> = new Map();
  private listeners: Map<string, PlaybackListener> = new Map();

  onPlaybackUpdate(id: string, listener: PlaybackListener) {
    this.listeners.set(id, listener);
  }

  removeListener(id: string) {
    this.listeners.delete(id);
  }

  private notifyListeners(venueId: string, info: NowPlayingInfo | null) {
    this.listeners.forEach((listener) => {
      listener(venueId, info);
    });
  }

  startVenue(venueId: string, genre: string, volume: number, musicSource: MusicSourceType = 'jamendo') {
    this.stopVenue(venueId);
    const player = new VenuePlayer(venueId, genre, volume, (info) => {
      this.notifyListeners(venueId, info);
    }, musicSource);
    this.players.set(venueId, player);
    player.start();
  }

  stopVenue(venueId: string) {
    const player = this.players.get(venueId);
    if (player) {
      player.stop();
      this.players.delete(venueId);
    }
  }

  setVenueVolume(venueId: string, volume: number) {
    const player = this.players.get(venueId);
    if (player) player.setVolume(volume);
  }

  seekVenue(venueId: string, time: number) {
    const player = this.players.get(venueId);
    if (player) player.seek(time);
  }

  nextTrack(venueId: string) {
    const player = this.players.get(venueId);
    if (player) player.next();
  }

  previousTrack(venueId: string) {
    const player = this.players.get(venueId);
    if (player) player.previous();
  }

  pauseVenue(venueId: string) {
    const player = this.players.get(venueId);
    if (player) player.pause();
  }

  resumeVenue(venueId: string) {
    const player = this.players.get(venueId);
    if (player) player.resume();
  }

  isPlaying(venueId: string): boolean {
    return this.players.has(venueId);
  }

  getVenueInfo(venueId: string): NowPlayingInfo | null {
    const player = this.players.get(venueId);
    return player ? player.getInfo() : null;
  }

  stopAll() {
    this.players.forEach((player) => player.stop());
    this.players.clear();
  }

  dispose() {
    this.stopAll();
    this.listeners.clear();
  }
}

// Singleton instance
let engineInstance: SoundmarkAudioEngine | null = null;

export function getAudioEngine(): SoundmarkAudioEngine {
  if (!engineInstance) {
    engineInstance = new SoundmarkAudioEngine();
  }
  return engineInstance;
}
