'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProofOfPlayReports, MonthlyReport, ProofOfPlayEntry } from '@/lib/mock-data';
import {
  FileText, Download, Calendar, Clock, Music, MapPin,
  ChevronDown, ChevronRight, Filter, Search, CheckCircle2,
  BarChart3, Globe,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProofOfPlayPage() {
  const reports = mockProofOfPlayReports;
  const [selectedReport, setSelectedReport] = useState<MonthlyReport>(reports[reports.length - 1]);
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const filteredEntries = useMemo(() => {
    let entries = selectedReport.entries;
    if (venueFilter !== 'all') {
      entries = entries.filter(e => e.venueId === venueFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(e =>
        e.trackTitle.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        e.genre.toLowerCase().includes(q)
      );
    }
    return entries;
  }, [selectedReport, venueFilter, searchQuery]);

  const venueNames = useMemo(() => {
    const map = new Map<string, string>();
    selectedReport.entries.forEach(e => map.set(e.venueId, e.venueName));
    return Array.from(map.entries());
  }, [selectedReport]);

  const venueStats = useMemo(() => {
    const stats: Record<string, { tracks: number; hours: number; completed: number }> = {};
    filteredEntries.forEach(e => {
      if (!stats[e.venueId]) stats[e.venueId] = { tracks: 0, hours: 0, completed: 0 };
      stats[e.venueId].tracks++;
      stats[e.venueId].hours += e.duration;
      if (e.completedFull) stats[e.venueId].completed++;
    });
    Object.keys(stats).forEach(k => { stats[k].hours = Math.round(stats[k].hours / 3600); });
    return stats;
  }, [filteredEntries]);

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => { counts[e.source] = (counts[e.source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredEntries]);

  const completionRate = useMemo(() => {
    if (filteredEntries.length === 0) return 0;
    return Math.round((filteredEntries.filter(e => e.completedFull).length / filteredEntries.length) * 100);
  }, [filteredEntries]);

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

    // Header
    doc.setFillColor(30, 30, 35);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Proof of Play Report', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedReport.month} ${selectedReport.year}`, 14, 24);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);
    doc.text('Luxe Hospitality Group', pageWidth - 14, 16, { align: 'right' });
    doc.text('Powered by Ambience AI', pageWidth - 14, 24, { align: 'right' });

    // Summary
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const totalHours = Math.round(filteredEntries.reduce((s, e) => s + e.duration, 0) / 3600);
    doc.text(`Total Tracks Played: ${filteredEntries.length.toLocaleString()}`, 14, 52);
    doc.text(`Total Playback Hours: ${totalHours.toLocaleString()}h`, 14, 58);
    doc.text(`Active Venues: ${venueNames.length}`, 100, 52);
    doc.text(`Completion Rate: ${completionRate}%`, 100, 58);
    doc.text(`Sources: ${sourceBreakdown.map(([s, c]) => `${s} (${c})`).join(', ')}`, 14, 64);

    // Venue breakdown table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Venue Breakdown', 14, 76);

    const venueRows = venueNames.map(([vid, vname]) => {
      const s = venueStats[vid] || { tracks: 0, hours: 0, completed: 0 };
      const rate = s.tracks > 0 ? Math.round((s.completed / s.tracks) * 100) : 0;
      return [vname, String(s.tracks), `${s.hours}h`, `${rate}%`];
    });

    autoTable(doc, {
      startY: 80,
      head: [['Venue', 'Tracks', 'Hours', 'Completion']],
      body: venueRows,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    // Track log table
    doc.addPage();
    doc.setFillColor(30, 30, 35);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Play Log', 14, 14);

    const trackRows = filteredEntries.slice(0, 500).map(e => [
      new Date(e.playedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      new Date(e.playedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      e.venueName,
      e.trackTitle,
      e.artist,
      e.genre,
      e.source,
      e.licenseType,
      formatDuration(e.duration),
      e.completedFull ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: 26,
      head: [['Date', 'Time', 'Venue', 'Track', 'Artist', 'Genre', 'Source', 'License', 'Duration', 'Full Play']],
      body: trackRows,
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 6.5 },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 16 }, 2: { cellWidth: 35 },
        3: { cellWidth: 35 }, 4: { cellWidth: 28 }, 5: { cellWidth: 20 },
        6: { cellWidth: 22 }, 7: { cellWidth: 16 }, 8: { cellWidth: 16 }, 9: { cellWidth: 14 },
      },
      margin: { left: 14, right: 14 },
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Ambience AI — Proof of Play — ${selectedReport.month} ${selectedReport.year} — Page ${i} of ${pageCount}`,
        pageWidth / 2, doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      );
    }

    doc.save(`proof-of-play-${selectedReport.month.toLowerCase()}-${selectedReport.year}.pdf`);
    setGenerating(false);
  };

  return (
    <div className="animate-slide-up">
      <Header title="Proof of Play" description="Monthly playback verification reports for licensing compliance" />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={`${selectedReport.month}-${selectedReport.year}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split('-');
              const r = reports.find(r => r.month === m && r.year === Number(y));
              if (r) setSelectedReport(r);
            }}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {reports.map(r => (
              <option key={`${r.month}-${r.year}`} value={`${r.month}-${r.year}`}>
                {r.month} {r.year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Venues</option>
            {venueNames.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
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
          {generating ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Tracks', value: filteredEntries.length.toLocaleString(), icon: Music, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Playback Hours', value: `${Math.round(filteredEntries.reduce((s, e) => s + e.duration, 0) / 3600)}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Active Venues', value: String(venueNames.length), icon: MapPin, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Sources Used', value: String(sourceBreakdown.length), icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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
        {/* Source Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Source Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceBreakdown.map(([source, count]) => {
                const pct = Math.round((count / filteredEntries.length) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{source}</span>
                      <span className="text-xs text-muted-foreground">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Venue Performance */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Venue Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {venueNames.map(([vid, vname]) => {
                const s = venueStats[vid] || { tracks: 0, hours: 0, completed: 0 };
                const rate = s.tracks > 0 ? Math.round((s.completed / s.tracks) * 100) : 0;
                const isExpanded = expandedVenue === vid;
                const venueEntries = filteredEntries.filter(e => e.venueId === vid);
                return (
                  <div key={vid}>
                    <button
                      onClick={() => setExpandedVenue(isExpanded ? null : vid)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      <span className="text-xs font-medium flex-1 truncate">{vname}</span>
                      <span className="text-[10px] text-muted-foreground">{s.tracks} tracks</span>
                      <span className="text-[10px] text-muted-foreground">{s.hours}h</span>
                      <Badge variant="outline" className="text-[10px] px-1.5">{rate}%</Badge>
                    </button>
                    {isExpanded && (
                      <div className="ml-7 mt-1 mb-2 max-h-40 overflow-y-auto border border-border rounded-lg">
                        <table className="w-full text-[10px]">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Date</th>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Track</th>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Artist</th>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Source</th>
                              <th className="text-left px-2 py-1 font-medium text-muted-foreground">Duration</th>
                              <th className="text-center px-2 py-1 font-medium text-muted-foreground">Full</th>
                            </tr>
                          </thead>
                          <tbody>
                            {venueEntries.slice(0, 30).map(e => (
                              <tr key={e.id} className="border-t border-border/50">
                                <td className="px-2 py-1 text-muted-foreground">{new Date(e.playedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                <td className="px-2 py-1 font-medium truncate max-w-[120px]">{e.trackTitle}</td>
                                <td className="px-2 py-1 text-muted-foreground truncate max-w-[100px]">{e.artist}</td>
                                <td className="px-2 py-1 text-muted-foreground">{e.source}</td>
                                <td className="px-2 py-1 text-muted-foreground">{formatDuration(e.duration)}</td>
                                <td className="px-2 py-1 text-center">{e.completedFull ? <CheckCircle2 className="w-3 h-3 text-green-400 inline" /> : <span className="text-muted-foreground">—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {venueEntries.length > 30 && (
                          <p className="text-[10px] text-muted-foreground text-center py-1">+{venueEntries.length - 30} more entries — download PDF for full report</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.map(r => (
              <div
                key={`${r.month}-${r.year}`}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${selectedReport.month === r.month && selectedReport.year === r.year ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                onClick={() => setSelectedReport(r)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.month} {r.year}</p>
                  <p className="text-xs text-muted-foreground">{r.totalTracks.toLocaleString()} tracks • {r.totalHours}h playback • {r.venues} venues</p>
                </div>
                <Badge variant={selectedReport.month === r.month ? 'default' : 'outline'} className="text-[10px]">
                  {selectedReport.month === r.month && selectedReport.year === r.year ? 'Selected' : 'View'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setTimeout(generatePDF, 100); }}
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
