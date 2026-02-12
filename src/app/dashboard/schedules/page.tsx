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
import { Schedule } from '@/types';
import { Calendar, Plus, Clock, Music, Trash2, X, Power } from 'lucide-react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const genres = ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'bossa nova', 'nature', 'meditation'];

export default function SchedulesPage() {
  const { state, dispatch } = useAppState();
  const { schedules, venues } = state;
  const [showCreate, setShowCreate] = useState(false);
  const [filterVenue, setFilterVenue] = useState<string>('all');

  const [newSchedule, setNewSchedule] = useState({
    venueId: venues[0]?.id || '', name: '', dayOfWeek: [] as number[],
    startTime: '09:00', endTime: '17:00', genres: [] as string[],
    tempoMin: 80, tempoMax: 120, energyMin: 30, energyMax: 70,
  });

  const filteredSchedules = filterVenue === 'all' ? schedules : schedules.filter(s => s.venueId === filterVenue);

  const handleCreate = () => {
    const schedule: Schedule = {
      id: String(Date.now()),
      venueId: newSchedule.venueId,
      name: newSchedule.name,
      dayOfWeek: newSchedule.dayOfWeek,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      genres: newSchedule.genres,
      tempoRange: { min: newSchedule.tempoMin, max: newSchedule.tempoMax },
      energyRange: { min: newSchedule.energyMin / 100, max: newSchedule.energyMax / 100 },
      isActive: true,
    };
    dispatch({ type: 'ADD_SCHEDULE', payload: schedule });
    setShowCreate(false);
  };

  const toggleDay = (day: number) => {
    setNewSchedule(prev => ({
      ...prev,
      dayOfWeek: prev.dayOfWeek.includes(day) ? prev.dayOfWeek.filter(d => d !== day) : [...prev.dayOfWeek, day],
    }));
  };

  const toggleGenre = (genre: string) => {
    setNewSchedule(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre],
    }));
  };

  const toggleActive = (schedule: Schedule) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: { ...schedule, isActive: !schedule.isActive } });
  };

  const getVenueName = (venueId: string) => venues.find(v => v.id === venueId)?.name || 'Unknown';

  return (
    <div className="animate-slide-up">
      <Header title="Schedules" description="Configure day-part scheduling for automated music playback" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} className="w-36 sm:w-48">
            <option value="all">All Venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
          <span className="text-xs sm:text-sm text-muted-foreground">{filteredSchedules.length} schedules</span>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add Schedule</span>
        </Button>
      </div>

      {/* Schedule Timeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSchedules.map(schedule => (
          <Card key={schedule.id} className={`transition-all ${schedule.isActive ? 'hover:border-primary/30' : 'opacity-60'}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <Badge variant={schedule.isActive ? 'success' : 'outline'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{getVenueName(schedule.venueId)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => toggleActive(schedule)} aria-label={schedule.isActive ? `Deactivate schedule ${schedule.name}` : `Activate schedule ${schedule.name}`}>
                    <Power className={`w-4 h-4 ${schedule.isActive ? 'text-success' : 'text-muted-foreground'}`} aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => dispatch({ type: 'DELETE_SCHEDULE', payload: schedule.id })} aria-label={`Delete schedule ${schedule.name}`}>
                    <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Music className="w-3.5 h-3.5" />
                  {schedule.tempoRange.min}-{schedule.tempoRange.max} BPM
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {dayNames.map((day, i) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                      schedule.dayOfWeek.includes(i) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.charAt(0)}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {schedule.genres.map(g => (
                  <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No schedules configured</p>
          <p className="text-sm mt-1">Create a schedule to automate music playback</p>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Schedule</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} aria-label="Close dialog">
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="sched-venue" className="text-sm font-medium">Venue</label>
                <Select id="sched-venue" value={newSchedule.venueId} onChange={e => setNewSchedule({ ...newSchedule, venueId: e.target.value })}>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              </div>

              <div>
                <label htmlFor="sched-name" className="text-sm font-medium">Schedule Name</label>
                <Input id="sched-name" placeholder="e.g. Morning Calm" value={newSchedule.name} onChange={e => setNewSchedule({ ...newSchedule, name: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Days</label>
                <div className="flex gap-2">
                  {dayNames.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        newSchedule.dayOfWeek.includes(i) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sched-start" className="text-sm font-medium">Start Time</label>
                  <Input id="sched-start" type="time" value={newSchedule.startTime} onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="sched-end" className="text-sm font-medium">End Time</label>
                  <Input id="sched-end" type="time" value={newSchedule.endTime} onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        newSchedule.genres.includes(g) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Slider label="Tempo Min (BPM)" value={newSchedule.tempoMin} onChange={v => setNewSchedule({ ...newSchedule, tempoMin: v })} min={40} max={200} />
              <Slider label="Tempo Max (BPM)" value={newSchedule.tempoMax} onChange={v => setNewSchedule({ ...newSchedule, tempoMax: v })} min={40} max={200} />
              <Slider label="Energy Min %" value={newSchedule.energyMin} onChange={v => setNewSchedule({ ...newSchedule, energyMin: v })} />
              <Slider label="Energy Max %" value={newSchedule.energyMax} onChange={v => setNewSchedule({ ...newSchedule, energyMax: v })} />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreate} disabled={!newSchedule.name || newSchedule.dayOfWeek.length === 0}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
