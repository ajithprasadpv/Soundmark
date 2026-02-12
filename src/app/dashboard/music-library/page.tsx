'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

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

  const [filterLicense, setFilterLicense] = useState<'all' | LicenseType>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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
