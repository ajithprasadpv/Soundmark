'use client';

import { useState, useRef } from 'react';
import { useAppState } from '@/lib/store';
import { useAudio } from '@/hooks/useAudio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FavoriteTrack } from '@/types';
import {
  Play, Pause, SkipForward, SkipBack, Volume2,
  Radio, StopCircle, Waves, Loader2, Heart,
  ChevronUp, ChevronDown, Globe, Music, Clock,
  ListMusic, Plus, X, Check, ExternalLink, Tag,
} from 'lucide-react';

type PanelView = 'none' | 'detail' | 'streams' | 'playlists';

export function AudioPlayerBar() {
  const { state, dispatch } = useAppState();
  const { venues, playbackStates, favorites, playlists } = state;
  const audio = useAudio();
  const [panelView, setPanelView] = useState<PanelView>('none');
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const playingEntries = Object.entries(playbackStates).filter(([, ps]) => ps.isPlaying);
  const playingCount = playingEntries.length;

  if (playingCount === 0) return null;

  const firstVenueId = playingEntries[0][0];
  const firstVenue = venues.find((v) => v.id === firstVenueId);
  const firstPs = playingEntries[0][1];

  const npInfo = audio.nowPlaying[firstVenueId];
  const trackName = npInfo?.trackName || firstPs.currentTrack?.title || 'Loading...';
  const artistName = npInfo?.artistName || '';
  const albumImage = npInfo?.albumImage || '';
  const trackSource = npInfo?.source || '';
  const trackGenre = npInfo?.genre || firstVenue?.configuration?.preferredGenres[0] || 'ambient';
  const trackDuration = npInfo?.duration || firstPs.currentTrack?.duration || 300;
  const currentTime = isDragging ? dragValue : (npInfo?.currentTime || 0);
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;
  const isLoading = !npInfo;

  // Derive a stable track ID from now-playing info
  const currentTrackId = npInfo ? `${trackSource}-${trackName}-${artistName}`.replace(/\s+/g, '-').toLowerCase() : '';
  const isFavorited = favorites.some(f => f.trackId === currentTrackId);

  const toggleFavorite = () => {
    if (!npInfo) return;
    const fav: FavoriteTrack = {
      id: `fav-${Date.now()}`,
      trackId: currentTrackId,
      trackName,
      artistName,
      genre: trackGenre,
      source: trackSource,
      albumImage,
      audioUrl: '',
      favoritedAt: new Date().toISOString(),
    };
    dispatch({ type: 'TOGGLE_FAVORITE', payload: fav });
  };

  const togglePanel = (view: PanelView) => {
    setPanelView(panelView === view ? 'none' : view);
  };

  const toggleVenuePlayback = (venueId: string) => {
    const current = playbackStates[venueId];
    if (!current) return;
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

    dispatch({
      type: 'SET_PLAYBACK',
      payload: { venueId, state: { ...current, isPlaying: willPlay } },
    });
    const venue = venues.find((v) => v.id === venueId);
    if (willPlay && venue) {
      const genre = venue.configuration?.preferredGenres[0] || 'ambient';
      audio.startPlayback(venueId, genre, current.volume);
    } else {
      audio.stopPlayback(venueId);
    }
  };

  const stopAll = () => {
    playingEntries.forEach(([venueId, ps]) => {
      dispatch({
        type: 'SET_PLAYBACK',
        payload: { venueId, state: { ...ps, isPlaying: false } },
      });
      audio.stopPlayback(venueId);
    });
  };

  const changeVolume = (venueId: string, vol: number) => {
    const current = playbackStates[venueId];
    if (!current) return;
    dispatch({
      type: 'SET_PLAYBACK',
      payload: { venueId, state: { ...current, volume: vol } },
    });
    audio.setVolume(venueId, vol);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s) % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekPosition(e);
  };

  const updateSeekPosition = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    setDragValue(Math.floor(pct * trackDuration));
  };

  const handleSeekEnd = () => {
    if (isDragging) {
      audio.seek(firstVenueId, dragValue);
      setIsDragging(false);
    }
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    dispatch({
      type: 'ADD_PLAYLIST',
      payload: {
        id: `pl-${Date.now()}`,
        name: newPlaylistName.trim(),
        description: '',
        trackIds: currentTrackId ? [currentTrackId] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
      },
    });
    setNewPlaylistName('');
    setShowNewPlaylist(false);
  };

  const addToPlaylist = (playlistId: string) => {
    const tid = addToPlaylistTrackId || currentTrackId;
    if (!tid) return;
    const pl = playlists.find(p => p.id === playlistId);
    if (pl?.trackIds.includes(tid)) {
      dispatch({ type: 'REMOVE_TRACK_FROM_PLAYLIST', payload: { playlistId, trackId: tid } });
    } else {
      dispatch({ type: 'ADD_TRACK_TO_PLAYLIST', payload: { playlistId, trackId: tid } });
    }
  };

  return (
    <div
      className="fixed bottom-0 left-64 right-0 z-50"
      onMouseMove={(e) => isDragging && updateSeekPosition(e)}
      onMouseUp={handleSeekEnd}
      onMouseLeave={handleSeekEnd}
    >
      {/* ─── Track Detail Panel ─── */}
      {panelView === 'detail' && npInfo && (
        <div className="glass border-t border-x border-border/60 rounded-t-2xl mx-4 p-0 animate-slide-up overflow-hidden">
          <div className="flex">
            {/* Large Album Art */}
            <div className="w-52 h-52 shrink-0 relative">
              {albumImage ? (
                <img src={albumImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                  <Waves className="w-16 h-16 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/90" />
            </div>

            {/* Track Info */}
            <div className="flex-1 p-5 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-[0.2em] mb-1.5">Now Playing</p>
                  <h2 className="text-xl font-bold truncate text-foreground">{trackName}</h2>
                  <p className="text-sm text-muted-foreground/70 mt-0.5">{artistName || 'Unknown Artist'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={toggleFavorite}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isFavorited ? 'bg-red-500/20 text-red-400 scale-110' : 'hover:bg-muted text-muted-foreground'}`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => { setAddToPlaylistTrackId(currentTrackId); togglePanel('playlists'); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    title="Add to playlist"
                  >
                    <ListMusic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="p-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <Tag className="w-3 h-3" /> Genre
                  </div>
                  <p className="text-xs font-medium capitalize">{trackGenre}</p>
                </div>
                <div className="p-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mb-0.5">
                    <Clock className="w-3 h-3" /> Duration
                  </div>
                  <p className="text-xs font-medium text-foreground/80">{formatTime(trackDuration)}</p>
                </div>
                <div className="p-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mb-0.5">
                    <Globe className="w-3 h-3" /> Source
                  </div>
                  <p className="text-xs font-medium text-foreground/80">{trackSource || 'Unknown'}</p>
                </div>
                <div className="p-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mb-0.5">
                    <Music className="w-3 h-3" /> Venue
                  </div>
                  <p className="text-xs font-medium truncate text-foreground/80">{firstVenue?.name || 'Unknown'}</p>
                </div>
              </div>

              {/* Favorites count */}
              <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {favorites.length} favorites
                </span>
                <span className="flex items-center gap-1">
                  <ListMusic className="w-3 h-3" /> {playlists.length} playlists
                </span>
                {isFavorited && (
                  <span className="text-red-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" /> In your favorites
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Streams Panel ─── */}
      {panelView === 'streams' && (
        <div className="glass border-t border-x border-border/60 rounded-t-2xl mx-4 p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              Active Streams ({playingCount})
            </h3>
            <Button variant="ghost" size="sm" onClick={stopAll} className="text-destructive hover:text-destructive">
              <StopCircle className="w-4 h-4 mr-1" /> Stop All
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {playingEntries.map(([venueId, ps]) => {
              const venue = venues.find((v) => v.id === venueId);
              const np = audio.nowPlaying[venueId];
              const npTrackId = np ? `${np.source}-${np.trackName}-${np.artistName}`.replace(/\s+/g, '-').toLowerCase() : '';
              const npIsFav = favorites.some(f => f.trackId === npTrackId);
              return (
                <div key={venueId} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                  {np?.albumImage ? (
                    <img src={np.albumImage} alt="" className="w-8 h-8 rounded shrink-0 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                      <Waves className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{np?.trackName || 'Loading...'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {np?.artistName || venue?.name || 'Unknown'} • {np?.genre || venue?.configuration?.preferredGenres[0] || 'ambient'}
                      {np?.source && <span className="text-primary/70"> • via {np.source}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!np) return;
                      const fav: FavoriteTrack = {
                        id: `fav-${Date.now()}`, trackId: npTrackId, trackName: np.trackName,
                        artistName: np.artistName, genre: np.genre, source: np.source,
                        albumImage: np.albumImage, audioUrl: '', favoritedAt: new Date().toISOString(),
                      };
                      dispatch({ type: 'TOGGLE_FAVORITE', payload: fav });
                    }}
                    className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer ${npIsFav ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${npIsFav ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => audio.previousTrack(venueId)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted cursor-pointer">
                      <SkipBack className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => audio.nextTrack(venueId)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted cursor-pointer">
                      <SkipForward className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-28">
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                    <input
                      type="range" min={0} max={100} value={ps.volume}
                      onChange={(e) => changeVolume(venueId, Number(e.target.value))}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground w-7 text-right">{ps.volume}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Playlists Panel ─── */}
      {panelView === 'playlists' && (
        <div className="glass border-t border-x border-border/60 rounded-t-2xl mx-4 p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              Playlists
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNewPlaylist(!showNewPlaylist)}>
              <Plus className="w-4 h-4 mr-1" /> New Playlist
            </Button>
          </div>

          {/* Create new playlist */}
          {showNewPlaylist && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
              <Input
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0"
                autoFocus
              />
              <button onClick={createPlaylist} className="w-7 h-7 rounded flex items-center justify-center bg-primary text-primary-foreground cursor-pointer shrink-0">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowNewPlaylist(false); setNewPlaylistName(''); }} className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Favorites section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium">Favorites ({favorites.length})</span>
            </div>
            {favorites.length === 0 ? (
              <p className="text-[10px] text-muted-foreground pl-5">No favorites yet. Click the heart icon to add tracks.</p>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {favorites.slice(0, 5).map(fav => (
                  <div key={fav.id} className="flex items-center gap-2 pl-5 py-1">
                    {fav.albumImage ? (
                      <img src={fav.albumImage} alt="" className="w-5 h-5 rounded shrink-0 object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                        <Music className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <span className="text-[10px] truncate flex-1">{fav.trackName}</span>
                    <span className="text-[10px] text-muted-foreground">{fav.source}</span>
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: fav })}
                      className="w-5 h-5 flex items-center justify-center text-red-400 cursor-pointer"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                ))}
                {favorites.length > 5 && (
                  <p className="text-[10px] text-muted-foreground pl-5">+{favorites.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          {/* Playlists list */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListMusic className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">Custom Playlists ({playlists.length})</span>
            </div>
            {playlists.length === 0 ? (
              <p className="text-[10px] text-muted-foreground pl-5">No playlists yet. Create one to organize your tracks.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {playlists.map(pl => {
                  const hasTrack = currentTrackId && pl.trackIds.includes(currentTrackId);
                  return (
                    <div key={pl.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center shrink-0">
                        <ListMusic className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{pl.name}</p>
                        <p className="text-[10px] text-muted-foreground">{pl.trackIds.length} tracks</p>
                      </div>
                      {currentTrackId && (
                        <button
                          onClick={() => addToPlaylist(pl.id)}
                          className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors ${hasTrack ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                        >
                          {hasTrack ? (
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Added</span>
                          ) : (
                            <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Add</span>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => dispatch({ type: 'DELETE_PLAYLIST', payload: pl.id })}
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Bar ─── */}
      <div className="glass border-t border-border/60">
        {/* ─── Seek / Progress Bar ─── */}
        <div
          ref={progressRef}
          className="relative h-1 hover:h-2 transition-all cursor-pointer group mx-5"
          onMouseDown={handleSeekStart}
        >
          <div className="absolute inset-0 bg-foreground/[0.06] rounded-full" />
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-[width] duration-150 shadow-sm shadow-violet-500/20"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-violet-500/40 transition-opacity ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ left: `${Math.min(progress, 100)}%` }}
          />
          {isDragging && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-card border border-border text-[10px] font-mono text-foreground shadow-xl whitespace-nowrap"
              style={{ left: `${Math.min((dragValue / trackDuration) * 100, 100)}%` }}
            >
              {formatTime(dragValue)}
            </div>
          )}
        </div>

        <div className="px-5 py-2">
        <div className="flex items-center gap-4">
          {/* Track info — click opens detail panel */}
          <button
            onClick={() => togglePanel('detail')}
            className="flex items-center gap-3 w-60 min-w-0 cursor-pointer text-left shrink-0"
          >
            {albumImage ? (
              <img src={albumImage} alt="" className="w-12 h-12 rounded-xl shrink-0 object-cover shadow-lg shadow-black/40" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Waves className="w-5 h-5 text-white/80" />}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {playingCount === 1 ? trackName : `${playingCount} venues playing`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {playingCount === 1
                  ? (artistName
                    ? `${artistName}${trackSource ? ` • via ${trackSource}` : ''}`
                    : `${firstVenue?.name} • ${trackGenre}`)
                  : playingEntries.map(([id]) => venues.find(v => v.id === id)?.name).filter(Boolean).join(', ')}
              </p>
            </div>
          </button>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${isFavorited ? 'text-red-400 scale-110' : 'text-muted-foreground hover:text-red-400'}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Center: Playback Controls */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => audio.previousTrack(firstVenueId)} title="Previous track">
                <SkipBack className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="w-10 h-10 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background shadow-lg shadow-foreground/10 hover:shadow-foreground/20 hover:scale-105 active:scale-95"
                onClick={() => toggleVenuePlayback(firstVenueId)}
                title={firstPs.isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : firstPs.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => audio.nextTrack(firstVenueId)} title="Next track">
                <SkipForward className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(trackDuration)}</span>
            </div>
          </div>

          {/* Right: Actions + Volume + Stop */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Playlist button */}
            <button
              onClick={() => togglePanel('playlists')}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${panelView === 'playlists' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Playlists"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Streams button */}
            <button
              onClick={() => togglePanel('streams')}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${panelView === 'streams' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Active streams"
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Mini Visualizer — only animate when audio is actually playing */}
            <div className="flex gap-[3px] items-end h-6 mx-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[3px] bg-gradient-to-t from-violet-500 to-violet-300 rounded-full ${npInfo?.isPlaying ? 'eq-bar' : ''}`}
                  style={{
                    ...(npInfo?.isPlaying
                      ? { animationDelay: `${i * 0.1}s`, animationDuration: `${0.4 + ((i * 7 + 2) % 5) * 0.12}s` }
                      : {}),
                    height: `${20 + ((i * 11 + 3) % 7) * 11}%`,
                  }}
                />
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-1.5 w-28">
              <Volume2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
              <input
                type="range" min={0} max={100} value={firstPs.volume}
                onChange={(e) => changeVolume(firstVenueId, Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Expand/collapse */}
            <button
              onClick={() => togglePanel(panelView === 'detail' ? 'none' : 'detail')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              title={panelView !== 'none' ? 'Collapse' : 'Expand'}
            >
              {panelView !== 'none' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={stopAll} title="Stop all">
              <StopCircle className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
