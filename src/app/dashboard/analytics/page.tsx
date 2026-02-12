'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, Music, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getAnalytics, ComputedAnalytics } from '@/lib/analytics-tracker';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7dd3fc', '#6ee7b7', '#fbbf24'];

export default function AnalyticsPage() {
  const [data, setData] = useState<ComputedAnalytics | null>(null);

  useEffect(() => {
    setData(getAnalytics());
  }, []);

  if (!data || data.tracksPlayed === 0) {
    return (
      <div className="animate-slide-up">
        <Header title="Analytics" description="Insights and performance metrics from your playback" />
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium text-foreground/70">No analytics yet</p>
          <p className="text-sm text-muted-foreground mt-1">Play some tracks from the Music Library to see your listening stats here</p>
        </div>
      </div>
    );
  }

  const pieData = data.genreDistribution.map(g => ({ name: g.genre, value: g.percentage }));

  const stats = [
    { label: 'Total Playback Hours', value: data.totalPlaybackHours.toLocaleString(undefined, { maximumFractionDigits: 1 }), icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Tracks Played', value: data.tracksPlayed.toLocaleString(), icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Peak Hour', value: data.peakHour, icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Top Genre', value: data.genreDistribution[0]?.genre || '--', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="animate-slide-up">
      <Header title="Analytics" description="Insights and performance metrics from your playback" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label} className="card-glow border-border/60 bg-card overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/[0.03] to-transparent rounded-bl-full" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1.5 text-foreground">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Playback */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground/90">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              Daily Playback Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyPlayback.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.dailyPlayback}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                  labelStyle={{ color: 'var(--color-muted-foreground)' }}
                  cursor={{ fill: 'rgba(139,92,246,0.06)' }}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
                <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-xs text-muted-foreground">No daily data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground/90">
              <Music className="w-5 h-5 text-violet-400" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center">
              <ResponsiveContainer width="100%" height={220} className="sm:!w-[60%] sm:!h-[280px]">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((_: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full sm:w-[40%] space-y-2.5 mt-2 sm:mt-0">
                {pieData.map((entry: { name: string; value: number }, index: number) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground/80 truncate">{entry.name}</span>
                    <span className="text-xs font-medium ml-auto text-foreground/70 font-mono">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            ) : (
              <div className="text-center py-10 text-xs text-muted-foreground">No genre data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tracks */}
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground/90">
            <Clock className="w-5 h-5 text-violet-400" />
            Recent Plays
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTracks.length > 0 ? (
          <div className="space-y-2">
            {data.recentTracks.map((track) => (
              <div key={track.id} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground/90">{track.trackTitle}</p>
                  <p className="text-xs text-muted-foreground">{track.genre} • {track.source === 's3' ? 'S3 Library' : 'Venue'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-muted-foreground">{Math.floor(track.durationSec / 60)}:{String(track.durationSec % 60).padStart(2, '0')}</p>
                  <p className="text-[10px] text-muted-foreground/60">{new Date(track.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-10 text-xs text-muted-foreground">No recent plays</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
