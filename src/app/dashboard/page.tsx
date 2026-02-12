'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import {
  MapPin,
  Music,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  Zap,
  Activity,
  Waves,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  Smile,
  Heart,
  Coffee,
  Flame,
  Moon,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAudio } from '@/hooks/useAudio';

// ─── Weather types & helpers ─────────────────────────────────────
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  isDay: boolean;
}

const WEATHER_ICONS: Record<string, React.ElementType> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  heavy_rain: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

const MOODS = [
  { id: 'energetic', label: 'Energetic', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', activeBg: 'bg-orange-500/20 border-orange-500/40' },
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', activeBg: 'bg-amber-500/20 border-amber-500/40' },
  { id: 'relaxed', label: 'Relaxed', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', activeBg: 'bg-emerald-500/20 border-emerald-500/40' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', activeBg: 'bg-pink-500/20 border-pink-500/40' },
  { id: 'calm', label: 'Calm', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', activeBg: 'bg-indigo-500/20 border-indigo-500/40' },
  { id: 'focused', label: 'Focused', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', activeBg: 'bg-violet-500/20 border-violet-500/40' },
] as const;

export default function DashboardPage() {
  const { state, dispatch } = useAppState();
  const { venues, playbackStates, analytics } = state;
  const audio = useAudio();

  // ─── Weather & Mood state ──────────────────────────────────────
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('relaxed');
  const [locationName, setLocationName] = useState<string>('');

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setWeather(json.data);
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prioritize browser geolocation for accurate local weather
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Reverse geocode city name from coordinates
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m&timezone=auto`)
            .then(r => r.json())
            .then(d => {
              setLocationName(d.timezone?.replace(/_/g, ' ').split('/').pop() || 'Your Location');
            })
            .catch(() => setLocationName('Your Location'));
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Geolocation denied — fall back to first venue
          const firstVenue = venues.find(v => v.latitude && v.longitude);
          if (firstVenue?.latitude && firstVenue?.longitude) {
            setLocationName(`${firstVenue.city}, ${firstVenue.state}`);
            fetchWeather(firstVenue.latitude, firstVenue.longitude);
          } else {
            setLocationName('Bangalore, KA');
            fetchWeather(12.9716, 77.5946);
          }
        },
        { timeout: 5000 }
      );
    } else {
      // No geolocation API — fall back to first venue
      const firstVenue = venues.find(v => v.latitude && v.longitude);
      if (firstVenue?.latitude && firstVenue?.longitude) {
        setLocationName(`${firstVenue.city}, ${firstVenue.state}`);
        fetchWeather(firstVenue.latitude, firstVenue.longitude);
      } else {
        setLocationName('Bangalore, KA');
        fetchWeather(12.9716, 77.5946);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWeather]);

  const activeVenues = venues.filter((v) => v.status === 'active');
  const playingVenues = Object.values(playbackStates).filter((p) => p.isPlaying);

  const togglePlayback = (venueId: string) => {
    const current = playbackStates[venueId];
    if (current) {
      const willPlay = !current.isPlaying;

      // Stop all other venues first
      if (willPlay) {
        Object.entries(playbackStates).forEach(([id, ps]) => {
          if (id !== venueId && ps.isPlaying) {
            dispatch({ type: 'SET_PLAYBACK', payload: { venueId: id, state: { ...ps, isPlaying: false } } });
            audio.stopPlayback(id);
          }
        });
      }

      dispatch({
        type: 'SET_PLAYBACK',
        payload: {
          venueId,
          state: { ...current, isPlaying: willPlay },
        },
      });

      const venue = venues.find(v => v.id === venueId);
      if (willPlay && venue) {
        const genre = venue.configuration?.preferredGenres[0] || 'ambient';
        audio.startPlayback(venueId, genre, current.volume);
      } else {
        audio.stopPlayback(venueId);
      }
    }
  };

  const stats = [
    {
      label: 'Total Venues',
      value: venues.length,
      icon: MapPin,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Now Playing',
      value: playingVenues.length,
      icon: Music,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Playback Hours',
      value: analytics?.totalPlaybackHours?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || '0',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Tracks Played',
      value: analytics?.tracksGenerated?.toLocaleString() || '0',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="animate-slide-up">
      <Header title="Dashboard" description="Overview of your ambient music platform" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow border-border/60 bg-card overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/[0.04] to-transparent rounded-bl-full" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1.5 text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center backdrop-blur-sm`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Venues */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground/90">
                <Activity className="w-5 h-5 text-violet-400" />
                Active Venues
              </CardTitle>
              <Link href="/dashboard/venues">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeVenues.length === 0 ? (
                <div className="text-center py-10">
                  <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground/70">No venues yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first venue to start streaming ambient music</p>
                  <Link href="/dashboard/venues">
                    <Button size="sm" className="mt-4">Add Venue</Button>
                  </Link>
                </div>
              ) : (
              <div className="space-y-2">
                {activeVenues.map((venue) => {
                  const playback = playbackStates[venue.id];
                  const isPlaying = playback?.isPlaying || false;
                  return (
                    <div
                      key={venue.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                        isPlaying
                          ? 'bg-gradient-to-r from-violet-500/[0.08] to-purple-500/[0.04] border border-violet-500/[0.12] shadow-lg shadow-violet-500/[0.03]'
                          : 'bg-foreground/[0.02] hover:bg-foreground/[0.04] border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isPlaying
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30'
                            : 'bg-foreground/[0.06]'
                        }`}
                      >
                        {isPlaying ? (
                          <div className="flex gap-[3px] items-end h-5">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-[3px] bg-white rounded-full eq-bar"
                                style={{ animationDelay: `${i * 0.15}s`, height: '40%' }}
                              />
                            ))}
                          </div>
                        ) : (
                          <MapPin className="w-5 h-5 text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate text-foreground/90">{venue.name}</p>
                          <Badge variant={isPlaying ? 'success' : 'outline'} className={isPlaying ? 'shadow-sm shadow-emerald-400/20' : 'opacity-60'}>
                            {isPlaying ? (
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" /> Playing</span>
                            ) : (
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-current" aria-hidden="true" /> Stopped</span>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground/70 mt-0.5">
                          {isPlaying && playback?.currentTrack
                            ? `${playback.currentTrack.title} • ${playback.currentTrack.genre} • ${playback.currentTrack.bpm} BPM`
                            : `${venue.venueType} • ${venue.city}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPlaying && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                            <Volume2 className="w-3.5 h-3.5" />
                            {playback?.volume}%
                          </div>
                        )}
                        <Button
                          variant={isPlaying ? 'outline' : 'default'}
                          size="icon"
                          onClick={() => togglePlayback(venue.id)}
                          aria-label={isPlaying ? `Pause ${venue.name}` : `Play ${venue.name}`}
                          className={`w-9 h-9 rounded-xl transition-all duration-200 ${
                            isPlaying
                              ? 'border-border hover:bg-foreground/[0.06]'
                              : 'bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/25'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground/90">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analytics ? (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No performance data yet</p>
                </div>
              ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Avg. Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-emerald-400">{analytics.avgSatisfactionScore}</span>
                    <span className="text-xs text-muted-foreground/50">/5.0</span>
                  </div>
                </div>
                <div className="w-full bg-foreground/[0.04] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-2 rounded-full transition-all shadow-sm shadow-emerald-400/20"
                    style={{ width: `${((analytics.avgSatisfactionScore || 0) / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground/80">Peak Hour</span>
                  <span className="text-sm font-medium text-foreground/80">{analytics.peakHour}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Active Venues</span>
                  <span className="text-sm font-medium text-foreground/80">{activeVenues.length}/{venues.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Last Sync</span>
                  <span className="text-xs font-medium text-muted-foreground/60">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Weather & Mood */}
          <Card className="border-border/60 bg-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground/90">
                  <Thermometer className="w-5 h-5 text-violet-400" />
                  Weather & Mood
                </CardTitle>
                {!weatherLoading && weather && (
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                          () => {
                            const v = venues.find(v => v.latitude && v.longitude);
                            if (v?.latitude && v?.longitude) fetchWeather(v.latitude, v.longitude);
                          },
                          { timeout: 5000 }
                        );
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Refresh weather"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {locationName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {locationName}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weather Display */}
              {weatherLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground ml-2">Fetching weather...</span>
                </div>
              ) : weatherError ? (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">{weatherError}</p>
                </div>
              ) : weather ? (
                <>
                  {/* Main weather */}
                  <div className="flex items-center gap-4 p-3.5 rounded-xl bg-gradient-to-r from-sky-500/[0.08] to-blue-500/[0.04] border border-sky-500/10">
                    <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                      {(() => {
                        const WeatherIcon = WEATHER_ICONS[weather.icon] || Cloud;
                        return <WeatherIcon className="w-7 h-7 text-sky-400" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{weather.temperature}°</span>
                        <span className="text-sm text-muted-foreground">C</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{weather.condition}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Thermometer className="w-3 h-3" /> Feels {weather.feelsLike}°
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Droplets className="w-3 h-3" /> {weather.humidity}%
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Wind className="w-3 h-3" /> {weather.windSpeed} km/h
                      </p>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Mood Selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">Select Mood</p>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map((mood) => {
                    const isActive = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isActive ? mood.activeBg : `${mood.bg} hover:opacity-80`
                        }`}
                      >
                        <mood.icon className={`w-4 h-4 ${mood.color}`} />
                        <span className={`text-[11px] font-medium ${isActive ? mood.color : 'text-muted-foreground'}`}>
                          {mood.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Recommendation */}
              {weather && (
                <div className="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-medium text-violet-400">AI Suggestion</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {weather.temperature > 30
                      ? `Hot day at ${weather.temperature}°C — `
                      : weather.temperature > 20
                      ? `Pleasant ${weather.temperature}°C — `
                      : weather.temperature > 10
                      ? `Cool ${weather.temperature}°C — `
                      : `Cold ${weather.temperature}°C — `}
                    {selectedMood === 'energetic' && 'upbeat electronic and pop tracks recommended to match the energy.'}
                    {selectedMood === 'happy' && 'bright indie and feel-good acoustic tracks will complement the vibe.'}
                    {selectedMood === 'relaxed' && 'smooth jazz and lo-fi beats are perfect for a laid-back atmosphere.'}
                    {selectedMood === 'romantic' && 'soft piano and R&B ballads will set the perfect romantic tone.'}
                    {selectedMood === 'calm' && 'ambient soundscapes and nature sounds for a peaceful environment.'}
                    {selectedMood === 'focused' && 'minimal instrumental and deep focus playlists for concentration.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Genre Distribution */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground/90">
                <Waves className="w-5 h-5 text-violet-400" />
                Top Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analytics?.genreDistribution?.length ? (
                <div className="text-center py-6">
                  <Waves className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No genre data yet</p>
                </div>
              ) : (
              <div className="space-y-3.5">
                {analytics.genreDistribution.slice(0, 5).map((genre, i) => (
                  <div key={genre.genre}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground/80">{genre.genre}</span>
                      <span className="text-xs text-muted-foreground/60 font-mono">{genre.percentage}%</span>
                    </div>
                    <div className="w-full bg-foreground/[0.04] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${genre.percentage * 3.5}%`,
                          background: `linear-gradient(90deg, rgba(139,92,246,${0.9 - i * 0.12}), rgba(167,139,250,${0.7 - i * 0.1}))`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
