'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play, Pause, Volume2, MapPin, Music, Thermometer, Users,
  TrendingUp, Clock, Activity, Zap,
} from 'lucide-react';
import { demoVenues, demoPlaybackStates, demoEnvironmentData } from '@/lib/demo-data';

export default function DemoPage() {
  const [playbackStates] = useState(demoPlaybackStates);
  const venues = demoVenues;
  const environmentData = demoEnvironmentData;

  const activeVenues = venues.filter(v => v.status === 'active').length;
  const playingVenues = Object.values(playbackStates).filter(ps => ps.isPlaying).length;
  const totalPlayHours = 4820;
  const avgCrowdDensity = Math.round(
    Object.values(environmentData).reduce((sum, env) => sum + env.crowdDensity, 0) / Object.values(environmentData).length
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your venues and music playback
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Venues</CardTitle>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVenues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {venues.length} total venues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Now Playing</CardTitle>
              <Music className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playingVenues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeVenues - playingVenues} venues paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Play Hours</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlayHours.toLocaleString()}</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Crowd Density</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCrowdDensity}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all venues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Venues Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Venues</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {venues.map(venue => {
              const playback = playbackStates[venue.id];
              const env = environmentData[venue.id];
              const isPlaying = playback?.isPlaying || false;

              return (
                <Card key={venue.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {venue.venueType}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {venue.city}, {venue.state}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isPlaying ? 'default' : 'outline'}
                        className={
                          isPlaying
                            ? 'bg-violet-500 hover:bg-violet-400'
                            : 'opacity-50 cursor-not-allowed'
                        }
                        disabled
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Track */}
                    {playback?.currentTrack && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Music className="w-3 h-3" />
                          Now Playing
                        </div>
                        <p className="font-medium text-sm">{playback.currentTrack.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {playback.currentTrack.bpm} BPM
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {Math.round(playback.currentTrack.energy * 100)}% Energy
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Environment */}
                    {env && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="text-sm font-medium">{env.temperature}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Crowd</p>
                            <p className="text-sm font-medium">{env.crowdDensity}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Volume */}
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${playback?.volume || 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {playback?.volume || 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
