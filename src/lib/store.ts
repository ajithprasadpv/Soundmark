'use client';

import { createContext, useContext } from 'react';
import { User, Venue, PlaybackState, EnvironmentData, Schedule, AnalyticsData, MusicTrack, MusicCategory, CustomerMusicMapping, MusicSource, FavoriteTrack, Playlist } from '@/types';

export interface AppState {
  user: User | null;
  venues: Venue[];
  playbackStates: Record<string, PlaybackState>;
  environmentData: Record<string, EnvironmentData>;
  schedules: Schedule[];
  analytics: AnalyticsData | null;
  musicLibrary: MusicTrack[];
  musicCategories: MusicCategory[];
  customerMappings: CustomerMusicMapping[];
  musicSources: MusicSource[];
  favorites: FavoriteTrack[];
  playlists: Playlist[];
  isAuthenticated: boolean;
}

export const initialState: AppState = {
  user: null,
  venues: [],
  playbackStates: {},
  environmentData: {},
  schedules: [],
  analytics: null,
  musicLibrary: [],
  musicCategories: [],
  customerMappings: [],
  musicSources: [],
  favorites: [],
  playlists: [],
  isAuthenticated: false,
};

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_VENUES'; payload: Venue[] }
  | { type: 'ADD_VENUE'; payload: Venue }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'DELETE_VENUE'; payload: string }
  | { type: 'SET_PLAYBACK'; payload: { venueId: string; state: PlaybackState } }
  | { type: 'SET_ENVIRONMENT'; payload: Record<string, EnvironmentData> }
  | { type: 'SET_SCHEDULES'; payload: Schedule[] }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  | { type: 'SET_MUSIC_LIBRARY'; payload: MusicTrack[] }
  | { type: 'ADD_MUSIC_TRACK'; payload: MusicTrack }
  | { type: 'UPDATE_MUSIC_TRACK'; payload: MusicTrack }
  | { type: 'DELETE_MUSIC_TRACK'; payload: string }
  | { type: 'SET_MUSIC_CATEGORIES'; payload: MusicCategory[] }
  | { type: 'SET_CUSTOMER_MAPPINGS'; payload: CustomerMusicMapping[] }
  | { type: 'UPDATE_CUSTOMER_MAPPING'; payload: CustomerMusicMapping }
  | { type: 'SET_MUSIC_SOURCES'; payload: MusicSource[] }
  | { type: 'UPDATE_MUSIC_SOURCE'; payload: MusicSource }
  | { type: 'DELETE_MUSIC_SOURCE'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: FavoriteTrack }
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'ADD_PLAYLIST'; payload: Playlist }
  | { type: 'UPDATE_PLAYLIST'; payload: Playlist }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; trackId: string } }
  | { type: 'REMOVE_TRACK_FROM_PLAYLIST'; payload: { playlistId: string; trackId: string } }
  | { type: 'LOGOUT' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_VENUES':
      return { ...state, venues: action.payload };
    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };
    case 'UPDATE_VENUE':
      return { ...state, venues: state.venues.map(v => v.id === action.payload.id ? action.payload : v) };
    case 'DELETE_VENUE':
      return { ...state, venues: state.venues.filter(v => v.id !== action.payload) };
    case 'SET_PLAYBACK':
      return { ...state, playbackStates: { ...state.playbackStates, [action.payload.venueId]: action.payload.state } };
    case 'SET_ENVIRONMENT':
      return { ...state, environmentData: action.payload };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return { ...state, schedules: state.schedules.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter(s => s.id !== action.payload) };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'SET_MUSIC_LIBRARY':
      return { ...state, musicLibrary: action.payload };
    case 'ADD_MUSIC_TRACK':
      return { ...state, musicLibrary: [...state.musicLibrary, action.payload] };
    case 'UPDATE_MUSIC_TRACK':
      return { ...state, musicLibrary: state.musicLibrary.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_MUSIC_TRACK':
      return { ...state, musicLibrary: state.musicLibrary.filter(t => t.id !== action.payload) };
    case 'SET_MUSIC_CATEGORIES':
      return { ...state, musicCategories: action.payload };
    case 'SET_CUSTOMER_MAPPINGS':
      return { ...state, customerMappings: action.payload };
    case 'UPDATE_CUSTOMER_MAPPING':
      return { ...state, customerMappings: state.customerMappings.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'SET_MUSIC_SOURCES':
      return { ...state, musicSources: action.payload };
    case 'UPDATE_MUSIC_SOURCE':
      return { ...state, musicSources: state.musicSources.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_MUSIC_SOURCE':
      return { ...state, musicSources: state.musicSources.filter(s => s.id !== action.payload) };
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.find(f => f.trackId === action.payload.trackId);
      return { ...state, favorites: exists ? state.favorites.filter(f => f.trackId !== action.payload.trackId) : [...state.favorites, action.payload] };
    }
    case 'SET_PLAYLISTS':
      return { ...state, playlists: action.payload };
    case 'ADD_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    case 'UPDATE_PLAYLIST':
      return { ...state, playlists: state.playlists.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PLAYLIST':
      return { ...state, playlists: state.playlists.filter(p => p.id !== action.payload) };
    case 'ADD_TRACK_TO_PLAYLIST':
      return { ...state, playlists: state.playlists.map(p => p.id === action.payload.playlistId ? { ...p, trackIds: [...p.trackIds, action.payload.trackId], updatedAt: new Date().toISOString() } : p) };
    case 'REMOVE_TRACK_FROM_PLAYLIST':
      return { ...state, playlists: state.playlists.map(p => p.id === action.payload.playlistId ? { ...p, trackIds: p.trackIds.filter(t => t !== action.payload.trackId), updatedAt: new Date().toISOString() } : p) };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => null });

export function useAppState() {
  return useContext(AppContext);
}
