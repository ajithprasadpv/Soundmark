'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { BarChart3, TrendingUp, Clock, Music, Star, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7dd3fc', '#6ee7b7', '#fbbf24'];

export default function AnalyticsPage() {
  const { state } = useAppState();
  const { analytics } = state;

  if (!analytics) return null;

  const pieData = analytics.genreDistribution.map(g => ({ name: g.genre, value: g.percentage }));

  const stats = [
    { label: 'Total Playback Hours', value: analytics.totalPlaybackHours.toLocaleString(undefined, { maximumFractionDigits: 1 }), icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Tracks Played', value: analytics.tracksGenerated.toLocaleString(), icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Satisfaction', value: `${analytics.avgSatisfactionScore}/5.0`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Peak Hour', value: analytics.peakHour, icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ];

  return (
    <div className="animate-slide-up">
      <Header title="Analytics" description="Insights and performance metrics across all venues" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label} className="card-glow border-white/[0.06] bg-gradient-to-br from-[#0c0c14] to-[#0a0a12] overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/[0.03] to-transparent rounded-bl-full" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1.5 text-white">{stat.value}</p>
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
        <Card className="border-white/[0.06] bg-gradient-to-br from-[#0c0c14] to-[#0a0a12]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              Weekly Playback Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.dailyPlayback}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: '#9ca3af' }}
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
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card className="border-white/[0.06] bg-gradient-to-br from-[#0c0c14] to-[#0a0a12]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Music className="w-5 h-5 text-violet-400" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2.5">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground/80 truncate">{entry.name}</span>
                    <span className="text-xs font-medium ml-auto text-white/70 font-mono">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card className="border-white/[0.06] bg-gradient-to-br from-[#0c0c14] to-[#0a0a12]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Hourly Venue Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
                <defs>
                  <linearGradient id="colorVenues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="venues" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorVenues)" dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} activeDot={{ fill: '#a78bfa', r: 5, strokeWidth: 2, stroke: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Venue Performance */}
        <Card className="border-white/[0.06] bg-gradient-to-br from-[#0c0c14] to-[#0a0a12]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Zap className="w-5 h-5 text-violet-400" />
              Venue Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.venueActivity.map((venue, i) => (
                <div key={venue.venue}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate text-white/80">{venue.venue}</span>
                    <span className="text-xs text-muted-foreground/60 font-mono">{venue.hours.toLocaleString(undefined, { maximumFractionDigits: 1 })}h • {venue.tracks.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(venue.hours / Math.max(...analytics.venueActivity.map(v => v.hours), 1)) * 100}%`,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}88)`,
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
  );
}
