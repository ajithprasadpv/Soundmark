'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/lib/store';
import {
  Tv, Plus, X, Wifi, WifiOff, Play, Pause, SkipForward, SkipBack,
  Volume2, Music, MapPin, Trash2, Link, Unlink, RefreshCw, Copy, Check,
} from 'lucide-react';

interface DeviceRecord {
  id: string;
  name: string;
  pairingCode: string;
  venueId: string | null;
  organizationId: string;
  paired: boolean;
  online: boolean;
  lastHeartbeat: number;
  registeredAt: string;
  pendingCommand: unknown;
  status: {
    isPlaying: boolean;
    trackName: string | null;
    artistName: string | null;
    albumImage: string | null;
    genre: string | null;
    volume: number;
    currentTime: number;
    duration: number;
    source: string | null;
    updatedAt: number;
  } | null;
}

export default function DevicesPage() {
  const { state } = useAppState();
  const { venues } = state;
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices?orgId=1');
      const data = await res.json();
      setDevices(data.devices || []);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const createDevice = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), organizationId: '1' }),
      });
      setNewName('');
      setShowCreate(false);
      await fetchDevices();
    } catch (e) {
      console.error('Failed to create device:', e);
    }
    setLoading(false);
  };

  const deleteDevice = async (id: string) => {
    try {
      await fetch(`/api/devices?id=${id}`, { method: 'DELETE' });
      if (selectedDevice === id) setSelectedDevice(null);
      await fetchDevices();
    } catch (e) {
      console.error('Failed to delete device:', e);
    }
  };

  const assignVenue = async (deviceId: string, venueId: string) => {
    try {
      await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, action: 'assign_venue', venueId }),
      });
      await fetchDevices();
    } catch (e) {
      console.error('Failed to assign venue:', e);
    }
  };

  const unassignVenue = async (deviceId: string) => {
    try {
      await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, action: 'unassign_venue' }),
      });
      await fetchDevices();
    } catch (e) {
      console.error('Failed to unassign venue:', e);
    }
  };

  const sendCommand = async (deviceId: string, commandType: string, payload: Record<string, unknown> = {}) => {
    try {
      await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, action: 'send_command', commandType, commandPayload: payload }),
      });
    } catch (e) {
      console.error('Failed to send command:', e);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selected = devices.find(d => d.id === selectedDevice);

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timeSince = (ts: number) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="animate-slide-up">
      <Header title="Devices" description="Manage Android TV boxes deployed at your venues" />

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-border text-muted-foreground/70">
            {devices.length} device{devices.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-400">
            {devices.filter(d => d.online).length} online
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDevices} className="border-border hover:bg-foreground/[0.04]">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/20">
            <Plus className="w-4 h-4 mr-1.5" /> Add Device
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="lg:col-span-2 space-y-3">
          {devices.map(device => {
            const venue = venues.find(v => v.id === device.venueId);
            const isSelected = selectedDevice === device.id;

            return (
              <Card
                key={device.id}
                className={`cursor-pointer transition-all duration-300 border-border/60 bg-card ${
                  isSelected
                    ? 'border-violet-500/30 shadow-lg shadow-violet-500/[0.05]'
                    : 'hover:border-border'
                }`}
                onClick={() => setSelectedDevice(device.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Device Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      device.online
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20'
                        : 'bg-foreground/[0.04]'
                    }`}>
                      <Tv className={`w-6 h-6 ${device.online ? 'text-white' : 'text-muted-foreground/50'}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate text-foreground/90">{device.name}</h3>
                        <Badge variant={device.online ? 'success' : 'outline'} className={device.online ? 'shadow-sm shadow-emerald-400/20' : ''}>
                          {device.online ? 'Online' : 'Offline'}
                        </Badge>
                        {!device.paired && (
                          <Badge variant="warning">Unpaired</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
                        {venue ? (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {venue.name}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400/60"><Unlink className="w-3 h-3" /> No venue assigned</span>
                        )}
                        <span className="flex items-center gap-1">
                          {device.online ? <Wifi className="w-3 h-3 text-emerald-400/60" /> : <WifiOff className="w-3 h-3" />}
                          {timeSince(device.lastHeartbeat)}
                        </span>
                      </div>
                      {/* Now Playing */}
                      {device.status?.isPlaying && device.status.trackName && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-[2px] items-end h-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-[2px] bg-violet-400 rounded-full eq-bar" style={{ animationDelay: `${i * 0.1}s`, height: '40%' }} />
                            ))}
                          </div>
                          <span className="text-xs text-violet-300/70 truncate">
                            {device.status.trackName} — {device.status.artistName || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pairing Code */}
                    {!device.paired && (
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-muted-foreground/50 mb-0.5">Pairing Code</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyCode(device.pairingCode); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-lg tracking-[0.15em] hover:bg-violet-500/15 transition-colors cursor-pointer"
                        >
                          {device.pairingCode}
                          {copiedCode === device.pairingCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-50" />}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {devices.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/50">
              <Tv className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-sm mb-1">No devices registered</p>
              <p className="text-xs text-muted-foreground/30">Add an Android TV box to get started</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-8 border-border/60 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground/90">
                  <Tv className="w-5 h-5 text-violet-400" />
                  {selected.name}
                </CardTitle>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => deleteDevice(selected.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${selected.online ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-600'}`} />
                      <span className="text-sm font-medium text-foreground/80">{selected.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-1">Last Seen</p>
                    <span className="text-sm font-medium text-foreground/80">{timeSince(selected.lastHeartbeat)}</span>
                  </div>
                </div>

                {/* Venue Assignment */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70 mb-2">Assigned Venue</p>
                  {selected.venueId ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.1]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-foreground/80">
                          {venues.find(v => v.id === selected.venueId)?.name || selected.venueId}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => unassignVenue(selected.id)}>
                        <Unlink className="w-3 h-3 mr-1" /> Unlink
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {venues.map(v => (
                        <button
                          key={v.id}
                          onClick={() => assignVenue(selected.id, v.id)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-foreground/[0.03] border border-border hover:bg-foreground/[0.06] hover:border-violet-500/20 transition-all text-left cursor-pointer"
                        >
                          <Link className="w-3.5 h-3.5 text-muted-foreground/40" />
                          <span className="text-sm text-foreground/70">{v.name}</span>
                          <span className="text-[10px] text-muted-foreground/40 ml-auto capitalize">{v.venueType}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remote Control */}
                {selected.online && selected.paired && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/70 mb-2">Remote Control</p>
                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground/[0.03] border border-border">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" onClick={() => sendCommand(selected.id, 'skip_prev')}>
                        <SkipBack className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      {selected.status?.isPlaying ? (
                        <Button
                          size="icon"
                          className="w-11 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10"
                          onClick={() => sendCommand(selected.id, 'pause')}
                        >
                          <Pause className="w-5 h-5" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          className="w-11 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10"
                          onClick={() => sendCommand(selected.id, 'play', { genre: selected.status?.genre || 'ambient' })}
                        >
                          <Play className="w-5 h-5 ml-0.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" onClick={() => sendCommand(selected.id, 'skip_next')}>
                        <SkipForward className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-3 mt-3 px-1">
                      <Volume2 className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selected.status?.volume ?? 50}
                        onChange={(e) => sendCommand(selected.id, 'set_volume', { volume: Number(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground/50 font-mono w-8 text-right">{selected.status?.volume ?? 50}</span>
                    </div>
                  </div>
                )}

                {/* Now Playing on Device */}
                {selected.status?.trackName && (
                  <div className="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.1]">
                    <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-[0.15em] mb-1.5">Playing on Device</p>
                    <div className="flex items-center gap-3">
                      {selected.status.albumImage ? (
                        <img src={selected.status.albumImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <Music className="w-5 h-5 text-violet-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-foreground/80">{selected.status.trackName}</p>
                        <p className="text-xs text-muted-foreground/50">{selected.status.artistName || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/40 font-mono">
                      <span>{formatTime(selected.status.currentTime)}</span>
                      <div className="flex-1 h-1 bg-foreground/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500/50 rounded-full"
                          style={{ width: `${selected.status.duration ? (selected.status.currentTime / selected.status.duration) * 100 : 0}%` }}
                        />
                      </div>
                      <span>{formatTime(selected.status.duration)}</span>
                    </div>
                  </div>
                )}

                {/* Pairing Code */}
                {!selected.paired && (
                  <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] text-center">
                    <p className="text-xs text-amber-400/80 mb-2">Enter this code on the Android TV box</p>
                    <p className="text-3xl font-mono font-bold tracking-[0.3em] text-amber-300">{selected.pairingCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-8 border-border/60 bg-card">
              <CardContent className="p-8 text-center text-muted-foreground/50">
                <Tv className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a device to manage</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Device Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <Card className="w-full max-w-md border-border/60 bg-card shadow-2xl shadow-black/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground/90">Register New Device</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Device Name</label>
                <Input
                  placeholder="e.g. Lobby TV, Cafe Counter Box"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createDevice()}
                  className="bg-foreground/[0.04] border-border"
                />
                <p className="text-[11px] text-muted-foreground/40 mt-1.5">
                  A pairing code will be generated. Enter it on the Android TV box to connect.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 border-border" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button className="flex-1 bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/20" onClick={createDevice} disabled={!newName.trim() || loading}>
                  {loading ? 'Creating...' : 'Register Device'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
