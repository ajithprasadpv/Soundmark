'use client';

import { useReducer, useEffect, ReactNode } from 'react';
import { AppContext, appReducer, initialState } from '@/lib/store';
import { mockUser, mockVenues, mockPlaybackStates, mockEnvironmentData, mockSchedules, mockAnalytics } from '@/lib/mock-data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('ambience_token');
    if (token) {
      dispatch({ type: 'SET_USER', payload: mockUser });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_VENUES', payload: mockVenues });
      dispatch({ type: 'SET_SCHEDULES', payload: mockSchedules });
      dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
      dispatch({ type: 'SET_ENVIRONMENT', payload: mockEnvironmentData });
      Object.entries(mockPlaybackStates).forEach(([venueId, playback]) => {
        dispatch({ type: 'SET_PLAYBACK', payload: { venueId, state: playback } });
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
