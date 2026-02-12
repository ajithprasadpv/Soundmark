'use client';

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
} from 'lucide-react';
import Link from 'next/link';
import { useAudio } from '@/hooks/useAudio';

export default function DashboardPage() {
  const { state, dispatch } = useAppState();
  const { venues, playbackStates, analytics } = state;
  const audio = useAudio();

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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Avg. Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-emerald-400">{analytics?.avgSatisfactionScore}</span>
                    <span className="text-xs text-muted-foreground/50">/5.0</span>
                  </div>
                </div>
                <div className="w-full bg-foreground/[0.04] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-2 rounded-full transition-all shadow-sm shadow-emerald-400/20"
                    style={{ width: `${((analytics?.avgSatisfactionScore || 0) / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground/80">Peak Hour</span>
                  <span className="text-sm font-medium text-foreground/80">{analytics?.peakHour}</span>
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
              <div className="space-y-3.5">
                {analytics?.genreDistribution.slice(0, 5).map((genre, i) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
