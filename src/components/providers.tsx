'use client';

import { useReducer, useEffect, ReactNode } from 'react';
import { AppContext, appReducer, initialState } from '@/lib/store';
import { mockUser } from '@/lib/mock-data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('soundmark_token');
    if (token) {
      dispatch({ type: 'SET_USER', payload: mockUser });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
