'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { AudioPlayerBar } from '@/components/layout/audio-player-bar';
import { SidebarProvider, useSidebar } from '@/components/sidebar-context';
import { useAppState } from '@/lib/store';

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
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
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
