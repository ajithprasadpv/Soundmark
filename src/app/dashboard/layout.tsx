'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { AudioPlayerBar } from '@/components/layout/audio-player-bar';
import { SidebarProvider, useSidebar } from '@/components/sidebar-context';
import { useAppState } from '@/lib/store';
import { mockUser, mockVenues, mockPlaybackStates, mockEnvironmentData, mockSchedules, mockAnalytics, mockMusicLibrary, mockMusicCategories, mockCustomerMappings, mockMusicSources } from '@/lib/mock-data';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile, hydrated } = useSidebar();

  // Before hydration: use CSS media query (ml-0 on mobile, ml-64 on lg+)
  // After hydration: use JS state for interactive behavior
  const mainMargin = hydrated
    ? (isMobile ? 'ml-0' : isCollapsed ? 'ml-[72px]' : 'ml-64')
    : 'ml-0 lg:ml-64';

  return (
    <div className="min-h-screen noise-bg">
      <Sidebar />
      <main className={`${mainMargin} transition-all duration-300 p-4 sm:p-6 lg:p-8 pb-28`}>
        {children}
      </main>
      <AudioPlayerBar />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  useEffect(() => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'SET_USER', payload: mockUser });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({ type: 'SET_VENUES', payload: mockVenues });
      dispatch({ type: 'SET_SCHEDULES', payload: mockSchedules });
      dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
      dispatch({ type: 'SET_ENVIRONMENT', payload: mockEnvironmentData });
      dispatch({ type: 'SET_MUSIC_LIBRARY', payload: mockMusicLibrary });
      dispatch({ type: 'SET_MUSIC_CATEGORIES', payload: mockMusicCategories });
      dispatch({ type: 'SET_CUSTOMER_MAPPINGS', payload: mockCustomerMappings });
      dispatch({ type: 'SET_MUSIC_SOURCES', payload: mockMusicSources });
      Object.entries(mockPlaybackStates).forEach(([venueId, playback]) => {
        dispatch({ type: 'SET_PLAYBACK', payload: { venueId, state: playback } });
      });
    }
  }, [state.isAuthenticated, router, dispatch]);

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
