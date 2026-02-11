'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioEngine, AmbienceAudioEngine, NowPlayingInfo } from '@/lib/audio-engine-v2';

export function useAudio() {
  const engineRef = useRef<AmbienceAudioEngine | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Record<string, NowPlayingInfo>>({});

  useEffect(() => {
    const engine = getAudioEngine();
    engineRef.current = engine;

    const listenerId = 'useAudio-' + Math.random().toString(36).slice(2);
    engine.onPlaybackUpdate(listenerId, (venueId, info) => {
      setNowPlaying((prev) => {
        if (!info) {
          const next = { ...prev };
          delete next[venueId];
          return next;
        }
        return { ...prev, [venueId]: info };
      });
    });

    return () => {
      engine.removeListener(listenerId);
    };
  }, []);

  const getEngine = useCallback(() => engineRef.current || getAudioEngine(), []);

  const startPlayback = useCallback((venueId: string, genre: string, volume: number) => {
    getEngine().startVenue(venueId, genre, volume);
  }, [getEngine]);

  const stopPlayback = useCallback((venueId: string) => {
    getEngine().stopVenue(venueId);
  }, [getEngine]);

  const setVolume = useCallback((venueId: string, volume: number) => {
    getEngine().setVenueVolume(venueId, volume);
  }, [getEngine]);

  const seek = useCallback((venueId: string, time: number) => {
    getEngine().seekVenue(venueId, time);
  }, [getEngine]);

  const nextTrack = useCallback((venueId: string) => {
    getEngine().nextTrack(venueId);
  }, [getEngine]);

  const previousTrack = useCallback((venueId: string) => {
    getEngine().previousTrack(venueId);
  }, [getEngine]);

  const isPlaying = useCallback((venueId: string): boolean => {
    return getEngine().isPlaying(venueId);
  }, [getEngine]);

  const getVenueInfo = useCallback((venueId: string): NowPlayingInfo | null => {
    return getEngine().getVenueInfo(venueId);
  }, [getEngine]);

  const stopAll = useCallback(() => {
    getEngine().stopAll();
  }, [getEngine]);

  return {
    startPlayback, stopPlayback, setVolume, seek,
    nextTrack, previousTrack, isPlaying, getVenueInfo,
    stopAll, nowPlaying,
  };
}
