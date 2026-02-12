'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAppState } from '@/lib/store';
import { Venue, VenueType, VenueStatus } from '@/types';
import {
  MapPin, Plus, Play, Pause, Volume2, Settings2, X,
  Music, Thermometer, Users, ChevronRight, Trash2,
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

const venueTypes: VenueType[] = ['restaurant', 'cafe', 'hotel', 'retail', 'spa', 'gym', 'office', 'bar', 'lounge', 'other'];
const genres = ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'bossa nova', 'nature', 'meditation', 'r&b', 'pop'];

export default function VenuesPage() {
  const { state, dispatch } = useAppState();
  const { venues, playbackStates, environmentData } = state;
  const audio = useAudio();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | VenueStatus>('all');

  const [newVenue, setNewVenue] = useState({
    name: '', venueType: 'restaurant' as VenueType, address: '', city: '', state: '', country: 'US',
    genres: [] as string[], tempoMin: 70, tempoMax: 120, energyMin: 0.3, energyMax: 0.7, volumeLevel: 50,
  });

  const filteredVenues = filter === 'all' ? venues : venues.filter(v => v.status === filter);

  const handleCreateVenue = () => {
    const venue: Venue = {
      id: String(Date.now()),
      organizationId: '1',
      name: newVenue.name,
      venueType: newVenue.venueType,
      address: newVenue.address,
      city: newVenue.city,
      state: newVenue.state,
      country: newVenue.country,
      timezone: 'America/Los_Angeles',
      status: 'setup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: {
        id: String(Date.now()) + '-c',
        venueId: String(Date.now()),
        preferredGenres: newVenue.genres,
        tempoRange: { min: newVenue.tempoMin, max: newVenue.tempoMax },
        valenceRange: { min: 0.3, max: 0.7 },
        energyRange: { min: newVenue.energyMin, max: newVenue.energyMax },
        volumeLevel: newVenue.volumeLevel,
      },
    };
    dispatch({ type: 'ADD_VENUE', payload: venue });
    setShowCreate(false);
    setNewVenue({ name: '', venueType: 'restaurant', address: '', city: '', state: '', country: 'US', genres: [], tempoMin: 70, tempoMax: 120, energyMin: 0.3, energyMax: 0.7, volumeLevel: 50 });
  };

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

      dispatch({ type: 'SET_PLAYBACK', payload: { venueId, state: { ...current, isPlaying: willPlay } } });

      const venue = venues.find(v => v.id === venueId);
      if (willPlay && venue) {
        const genre = venue.configuration?.preferredGenres[0] || 'ambient';
        audio.startPlayback(venueId, genre, current.volume);
      } else {
        audio.stopPlayback(venueId);
      }
    }
  };

  const deleteVenueWithStop = (venueId: string) => {
    audio.stopPlayback(venueId);
    deleteVenue(venueId);
  };

  const deleteVenue = (venueId: string) => {
    dispatch({ type: 'DELETE_VENUE', payload: venueId });
    if (selectedVenue === venueId) setSelectedVenue(null);
  };

  const toggleGenre = (genre: string) => {
    setNewVenue(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre],
    }));
  };

  const selected = venues.find(v => v.id === selectedVenue);

  return (
    <div className="animate-slide-up">
      <Header title="Venues" description="Manage your venue locations and music configurations" />

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'setup'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/20' : 'border-border hover:bg-foreground/[0.04]'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {venues.filter(v => v.status === f).length}
                </span>
              )}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/20">
          <Plus className="w-4 h-4 mr-2" /> Add Venue
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venue List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredVenues.map(venue => {
            const playback = playbackStates[venue.id];
            const env = environmentData[venue.id];
            const isPlaying = playback?.isPlaying || false;
            const isSelected = selectedVenue === venue.id;

            return (
              <Card
                key={venue.id}
                className={`cursor-pointer transition-all duration-300 border-border/60 bg-card ${
                  isSelected
                    ? 'border-violet-500/30 shadow-lg shadow-violet-500/[0.05]'
                    : isPlaying
                      ? 'border-violet-500/15 shadow-md shadow-violet-500/[0.03]'
                      : 'hover:border-border'
                }`}
                onClick={() => setSelectedVenue(venue.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30'
                        : 'bg-foreground/[0.04]'
                    }`}>
                      {isPlaying ? (
                        <div className="flex gap-[3px] items-end h-6">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-[3px] bg-white rounded-full eq-bar" style={{ animationDelay: `${i * 0.12}s`, height: '30%' }} />
                          ))}
                        </div>
                      ) : (
                        <MapPin className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate text-foreground/90">{venue.name}</h3>
                        <Badge variant={venue.status === 'active' ? 'success' : venue.status === 'setup' ? 'warning' : 'outline'} className={venue.status === 'active' && isPlaying ? 'shadow-sm shadow-emerald-400/20' : ''}>
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${venue.status === 'active' ? 'bg-current' : venue.status === 'setup' ? 'border border-current' : 'border border-current'}`} aria-hidden="true" />
                            {venue.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground/60">{venue.address}, {venue.city}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/50">
                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {venue.configuration?.preferredGenres.slice(0, 2).join(', ')}</span>
                        {env && <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> {env.temperature}°C</span>}
                        {env && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {env.crowdDensity}%</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {venue.status === 'active' && (
                        <Button
                          variant={isPlaying ? 'outline' : 'default'}
                          size="icon"
                          aria-label={isPlaying ? `Pause ${venue.name}` : `Play ${venue.name}`}
                          className={`w-9 h-9 rounded-xl transition-all duration-200 ${
                            isPlaying
                              ? 'border-border hover:bg-foreground/[0.06]'
                              : 'bg-violet-500 hover:bg-violet-400 shadow-md shadow-violet-500/25'
                          }`}
                          onClick={(e) => { e.stopPropagation(); togglePlayback(venue.id); }}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
                        </Button>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredVenues.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No venues found</p>
            </div>
          )}
        </div>

        {/* Venue Detail Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-8 border-border/60 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground/90">
                  <Settings2 className="w-5 h-5 text-violet-400" />
                  Configuration
                </CardTitle>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => deleteVenueWithStop(selected.id)} aria-label={`Delete venue ${selected.name}`}>
                  <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h4 className="text-sm font-medium mb-1">{selected.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{selected.venueType} • {selected.city}, {selected.state}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Preferred Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.configuration?.preferredGenres.map(g => (
                      <Badge key={g} variant="default">{g}</Badge>
                    ))}
                  </div>
                </div>

                <Slider label="Volume" value={selected.configuration?.volumeLevel || 50} onChange={() => {}} min={0} max={100} />
                <Slider label="Tempo Min" value={selected.configuration?.tempoRange.min || 70} onChange={() => {}} min={40} max={200} />
                <Slider label="Tempo Max" value={selected.configuration?.tempoRange.max || 120} onChange={() => {}} min={40} max={200} />
                <Slider label="Energy Min" value={Math.round((selected.configuration?.energyRange.min || 0.3) * 100)} onChange={() => {}} min={0} max={100} />
                <Slider label="Energy Max" value={Math.round((selected.configuration?.energyRange.max || 0.7) * 100)} onChange={() => {}} min={0} max={100} />

                {playbackStates[selected.id]?.isPlaying && playbackStates[selected.id]?.currentTrack && (
                  <div className="bg-violet-500/[0.06] border border-violet-500/[0.1] rounded-xl p-3">
                    <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-[0.15em] mb-1">Now Playing</p>
                    <p className="text-sm font-medium">{playbackStates[selected.id].currentTrack?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {playbackStates[selected.id].currentTrack?.genre} • {playbackStates[selected.id].currentTrack?.bpm} BPM • Key: {playbackStates[selected.id].currentTrack?.key}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-8 border-border/60 bg-card">
              <CardContent className="p-8 text-center text-muted-foreground/50">
                <Settings2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a venue to view its configuration</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Venue Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-border bg-card shadow-2xl shadow-black/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create New Venue</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} aria-label="Close dialog">
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label htmlFor="venue-name" className="text-sm font-medium">Venue Name</label>
                  <Input id="venue-name" placeholder="e.g. The Grand Lounge" value={newVenue.name} onChange={e => setNewVenue({ ...newVenue, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="venue-type" className="text-sm font-medium">Type</label>
                  <Select id="venue-type" value={newVenue.venueType} onChange={e => setNewVenue({ ...newVenue, venueType: e.target.value as VenueType })}>
                    {venueTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </Select>
                </div>
                <div>
                  <label htmlFor="venue-country" className="text-sm font-medium">Country</label>
                  <Input id="venue-country" value={newVenue.country} onChange={e => setNewVenue({ ...newVenue, country: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label htmlFor="venue-address" className="text-sm font-medium">Address</label>
                  <Input id="venue-address" placeholder="Street address" value={newVenue.address} onChange={e => setNewVenue({ ...newVenue, address: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="venue-city" className="text-sm font-medium">City</label>
                  <Input id="venue-city" value={newVenue.city} onChange={e => setNewVenue({ ...newVenue, city: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="venue-state" className="text-sm font-medium">State</label>
                  <Input id="venue-state" value={newVenue.state} onChange={e => setNewVenue({ ...newVenue, state: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Music Genres</label>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        newVenue.genres.includes(g) ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/30' : 'bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Slider label="Volume Level" value={newVenue.volumeLevel} onChange={v => setNewVenue({ ...newVenue, volumeLevel: v })} />
              <Slider label="Tempo Min (BPM)" value={newVenue.tempoMin} onChange={v => setNewVenue({ ...newVenue, tempoMin: v })} min={40} max={200} />
              <Slider label="Tempo Max (BPM)" value={newVenue.tempoMax} onChange={v => setNewVenue({ ...newVenue, tempoMax: v })} min={40} max={200} />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreateVenue} disabled={!newVenue.name || !newVenue.city}>Create Venue</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
