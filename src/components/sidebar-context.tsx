'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SidebarContextType {
  isOpen: boolean;        // mobile drawer open (toggled by hamburger)
  isCollapsed: boolean;   // desktop icon-only mode
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  hydrated: boolean;      // true after first client render
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isCollapsed: false,
  setIsOpen: () => {},
  toggleOpen: () => {},
  toggleCollapsed: () => {},
  isMobile: false,
  hydrated: false,
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setIsCollapsed(false);
      }
    };

    checkMobile();
    setHydrated(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleCollapsed = useCallback(() => setIsCollapsed(prev => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, setIsOpen, toggleOpen, toggleCollapsed, isMobile, hydrated }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
