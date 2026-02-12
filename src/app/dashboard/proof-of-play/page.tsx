'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPlayEvents, PlayEvent } from '@/lib/analytics-tracker';
import {
  FileText, Download, Clock, Music,
  Search, CheckCircle2, BarChart3, Globe,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProofOfPlayPage() {
  const [events, setEvents] = useState<PlayEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setEvents(getPlayEvents());
  }, []);

  // Empty state
  if (events.length === 0) {
    return (
      <div className="animate-slide-up">
        <Header title="Proof of Play" description="Verified playback reports for licensing compliance" />
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium text-foreground/70">No play records yet</p>
          <p className="text-sm text-muted-foreground mt-1">Play tracks from the Music Library to build your proof-of-play log</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter(e => {
    if (genreFilter !== 'all' && e.genre !== genreFilter) return false;
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.trackTitle.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        e.genre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorted newest first
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  // Stats
  const totalSec = filteredEvents.reduce((s, e) => s + e.durationSec, 0);
  const totalMinutes = Math.round(totalSec / 60);
  const totalHoursDisplay = totalSec >= 3600
    ? `${(totalSec / 3600).toFixed(1)}h`
    : `${totalMinutes}m`;

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  filteredEvents.forEach(e => { genreCounts[e.genre || 'Unknown'] = (genreCounts[e.genre || 'Unknown'] || 0) + 1; });
  const genreBreakdown = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  filteredEvents.forEach(e => { sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1; });
  const sourceBreakdown = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  // All genres for filter
  const allGenres = [...new Set(events.map(e => e.genre))].sort();
  const allSources = [...new Set(events.map(e => e.source))].sort();

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const generatePDF = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();

    // Header
    doc.setFillColor(30, 30, 35);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Proof of Play Report', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Last 5 Days`, 14, 24);
    doc.setFontSize(9);
    doc.text(`Generated: ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);
    doc.text('Powered by Soundmark', pageWidth - 14, 16, { align: 'right' });

    // Summary
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Tracks Played: ${sortedEvents.length}`, 14, 52);
    doc.text(`Total Playback: ${totalHoursDisplay}`, 14, 58);
    doc.text(`Genres: ${genreBreakdown.map(([g, c]) => `${g} (${c})`).join(', ')}`, 14, 64);
    doc.text(`Sources: ${sourceBreakdown.map(([s, c]) => `${s} (${c})`).join(', ')}`, 14, 70);

    // Track log table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Play Log', 14, 82);

    const trackRows = sortedEvents.map(e => [
      new Date(e.playedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      new Date(e.playedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      e.trackTitle,
      e.artist,
      e.genre,
      e.source === 's3' ? 'S3 Library' : 'Venue',
      formatDuration(e.durationSec),
    ]);

    autoTable(doc, {
      startY: 86,
      head: [['Date', 'Time', 'Track', 'Artist', 'Genre', 'Source', 'Duration']],
      body: trackRows,
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Soundmark — Proof of Play — Page ${i} of ${pageCount}`,
        pageWidth / 2, doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      );
    }

    doc.save(`proof-of-play-${now.toISOString().split('T')[0]}.pdf`);
    setGenerating(false);
  };

  return (
    <div className="animate-slide-up">
      <Header title="Proof of Play" description="Verified playback log from your actual listening activity (last 5 days)" />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Genres</option>
          {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Sources</option>
          {allSources.map(s => <option key={s} value={s}>{s === 's3' ? 'S3 Library' : 'Venue'}</option>)}
        </select>

        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm order-last sm:order-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tracks, artists, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button onClick={generatePDF} disabled={generating} className="ml-auto gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{generating ? 'Generating...' : 'Download PDF'}</span>
          <span className="sm:hidden">{generating ? '...' : 'PDF'}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Tracks', value: filteredEvents.length.toLocaleString(), icon: Music, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Playback Time', value: totalHoursDisplay, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Genres', value: String(genreBreakdown.length), icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Sources', value: String(sourceBreakdown.length), icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map(stat => (
          <Card key={stat.label} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold mt-0.5">{stat.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Genre Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Genre Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {genreBreakdown.map(([genre, count]) => {
                const pct = Math.round((count / filteredEvents.length) * 100);
                return (
                  <div key={genre}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{genre}</span>
                      <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {genreBreakdown.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Play Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Play Log ({sortedEvents.length} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedEvents.length > 0 ? (
            <div className="max-h-[400px] overflow-x-auto overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-[11px] min-w-[500px]">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Track</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Artist</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Genre</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Source</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map(e => (
                    <tr key={e.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {new Date(e.playedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                        {new Date(e.playedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-2 font-medium truncate max-w-[180px]">{e.trackTitle}</td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">{e.artist}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px] px-1.5">{e.genre}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{e.source === 's3' ? 'S3 Library' : 'Venue'}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatDuration(e.durationSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">No matching entries</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
