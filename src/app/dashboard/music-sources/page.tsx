'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { MusicSource, MusicSourceStatus } from '@/types';
import {
  Radio, Trash2, Power, PowerOff, ExternalLink, RefreshCw,
  Music, Globe, Shield, CheckCircle2, XCircle, AlertTriangle,
  Clock, Tag, Database, Activity, ChevronRight, Loader2,
} from 'lucide-react';

const statusConfig: Record<MusicSourceStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', color: 'bg-success/15 text-success border-success/30', icon: CheckCircle2 },
  disabled: { label: 'Disabled', color: 'bg-muted text-muted-foreground border-border', icon: PowerOff },
  error: { label: 'Error', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: AlertTriangle },
};

export default function MusicSourcesPage() {
  const { state, dispatch } = useAppState();
  const { musicSources } = state;
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeSources = musicSources.filter(s => s.status === 'active').length;
  const totalTracks = musicSources.reduce((sum, s) => sum + s.tracksAvailable, 0);
  const totalUsed = musicSources.reduce((sum, s) => sum + s.tracksUsed, 0);

  const toggleSourceStatus = (source: MusicSource) => {
    const newStatus: MusicSourceStatus = source.status === 'active' ? 'disabled' : 'active';
    dispatch({
      type: 'UPDATE_MUSIC_SOURCE',
      payload: { ...source, status: newStatus },
    });
  };

  const deleteSource = (id: string) => {
    dispatch({ type: 'DELETE_MUSIC_SOURCE', payload: id });
    if (selectedSource === id) setSelectedSource(null);
    setConfirmDelete(null);
  };

  const syncSource = async (source: MusicSource) => {
    setSyncing(source.id);
    // Simulate sync
    await new Promise(r => setTimeout(r, 2000));
    dispatch({
      type: 'UPDATE_MUSIC_SOURCE',
      payload: { ...source, lastSyncAt: new Date().toISOString() },
    });
    setSyncing(null);
  };

  const selected = musicSources.find(s => s.id === selectedSource);

  return (
    <div className="animate-slide-up">
      <Header title="Music Sources" description="Manage external music API providers — enable, disable, or remove sources" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-3xl font-bold mt-1">{musicSources.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-success/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-3xl font-bold mt-1">{activeSources}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-purple-400/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracks Available</p>
                <p className="text-3xl font-bold mt-1">{totalTracks.toLocaleString()}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-warning/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracks Streamed</p>
                <p className="text-3xl font-bold mt-1">{totalUsed.toLocaleString()}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sources List */}
        <div className="lg:col-span-2 space-y-4">
          {musicSources.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium mb-1">No Music Sources</p>
                <p className="text-sm">Add an external music API to start streaming tracks.</p>
              </CardContent>
            </Card>
          ) : (
            musicSources.map(source => {
              const cfg = statusConfig[source.status];
              const StatusIcon = cfg.icon;
              const isSelected = selectedSource === source.id;

              return (
                <Card
                  key={source.id}
                  className={`cursor-pointer transition-all hover:border-primary/30 ${isSelected ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                  onClick={() => setSelectedSource(source.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${source.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                        {source.provider === 'Jamendo' ? (
                          <Globe className={`w-6 h-6 ${source.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                        ) : (
                          <Music className={`w-6 h-6 ${source.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold">{source.name}</h3>
                          <Badge className={`text-[10px] ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {source.provider}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{source.description}</p>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {source.tracksAvailable.toLocaleString()} tracks
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {source.tracksUsed.toLocaleString()} streamed
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Synced {new Date(source.lastSyncAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {source.licenseType === 'copyright-free' ? 'CC Licensed' : 'Licensed'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={(e) => { e.stopPropagation(); syncSource(source); }}
                          disabled={syncing === source.id || source.status === 'disabled'}
                          title="Sync now"
                        >
                          {syncing === source.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={(e) => { e.stopPropagation(); toggleSourceStatus(source); }}
                          title={source.status === 'active' ? 'Disable source' : 'Enable source'}
                        >
                          {source.status === 'active' ? (
                            <Power className="w-4 h-4 text-success" />
                          ) : (
                            <PowerOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(source.id); }}
                          title="Remove source"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Genre Tags */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                        {source.supportedGenres.map(genre => (
                          <span key={genre} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground capitalize">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Source Details</CardTitle>
                  <Badge className={statusConfig[selected.status].color}>
                    {statusConfig[selected.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selected.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                    {selected.provider === 'Jamendo' ? (
                      <Globe className="w-7 h-7 text-primary" />
                    ) : (
                      <Music className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.provider}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">License</p>
                    <p className="font-medium">{selected.licenseType === 'copyright-free' ? 'CC / Free' : 'Licensed'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tracks Available</p>
                    <p className="font-medium">{selected.tracksAvailable.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tracks Streamed</p>
                    <p className="font-medium">{selected.tracksUsed.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Last Sync</p>
                    <p className="font-medium">{new Date(selected.lastSyncAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">API Endpoint</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{selected.apiEndpoint}</code>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Supported Genres ({selected.supportedGenres.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.supportedGenres.map(genre => (
                      <span key={genre} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary capitalize font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant={selected.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleSourceStatus(selected)}
                  >
                    {selected.status === 'active' ? (
                      <><PowerOff className="w-3.5 h-3.5 mr-1.5" /> Disable</>
                    ) : (
                      <><Power className="w-3.5 h-3.5 mr-1.5" /> Enable</>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmDelete(selected.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                  </Button>
                </div>

                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                  Added {new Date(selected.addedAt).toLocaleDateString()} by {selected.addedBy}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-8">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Radio className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a source to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Remove Music Source
              </CardTitle>
              <CardDescription>
                This will permanently remove this source. Venues currently streaming from this source will stop playing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                <Globe className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{musicSources.find(s => s.id === confirmDelete)?.name}</p>
                  <p className="text-xs text-muted-foreground">{musicSources.find(s => s.id === confirmDelete)?.provider}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => deleteSource(confirmDelete)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Remove Source
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
