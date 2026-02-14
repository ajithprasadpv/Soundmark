'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
import { useTheme } from '@/components/theme-provider';
import { useSidebar } from '@/components/sidebar-context';
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Calendar,
  Thermometer,
  Settings,
  LogOut,
  Music,
  Waves,
  Library,
  Users,
  Shield,
  Radio,
  FileText,
  Tv,
  Sun,
  Moon,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/venues', label: 'Venues', icon: MapPin },
  { href: '/dashboard/copyrighted-music', label: 'Copyrighted Music', icon: Shield },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/schedules', label: 'Schedules', icon: Calendar },
  { href: '/dashboard/environment', label: 'Environment', icon: Thermometer },
  { href: '/dashboard/proof-of-play', label: 'Proof of Play', icon: FileText },
  { href: '/dashboard/devices', label: 'Devices', icon: Tv },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/dashboard/music-library', label: 'Music Library', icon: Library },
  { href: '/dashboard/music-sources', label: 'Music Sources', icon: Radio },
  { href: '/dashboard/customer-mapping', label: 'Customer Mapping', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, isCollapsed, setIsOpen, toggleCollapsed, isMobile, hydrated } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem('soundmark_token');
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Before hydration: use pure CSS to handle responsiveness
  // After hydration: use JS state for interactive behavior
  //
  // CSS approach for first paint:
  //   - Below lg (1024px): sidebar is hidden off-screen via -translate-x-full
  //   - Above lg: sidebar is visible at w-64
  //
  // JS approach after hydration:
  //   - isMobile + isOpen controls the mobile drawer
  //   - isCollapsed controls the desktop icon-only mode

  const sidebarClasses = hydrated
    ? cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border/60 bg-gradient-to-b from-card to-background flex flex-col transition-all duration-300',
        // Width
        isMobile ? 'w-64' : isCollapsed ? 'w-[72px]' : 'w-64',
        // Visibility
        isMobile && !isOpen && '-translate-x-full',
        isMobile && isOpen && 'translate-x-0',
      )
    : // Pre-hydration: CSS-only responsive — hidden on mobile, visible on desktop
      'fixed left-0 top-0 z-40 h-screen border-r border-border/60 bg-gradient-to-b from-card to-background flex flex-col transition-all duration-300 w-64 -translate-x-full lg:translate-x-0';

  const showLabels = hydrated ? (!isCollapsed || isMobile) : true;
  const isIconOnly = hydrated ? (isCollapsed && !isMobile) : false;

  return (
    <>
      <aside
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border/60">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card shadow-sm shadow-emerald-400/30" />
          </div>
          {showLabels && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold gradient-text">Soundmark</h1>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.15em]">Music Platform</p>
            </div>
          )}
          {/* Mobile close button — only rendered after hydration on mobile */}
          {hydrated && isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {/* Desktop collapse toggle */}
          {hydrated && !isMobile && (
            <button
              onClick={toggleCollapsed}
              className={cn(
                'p-2 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                isCollapsed ? 'mx-auto mt-1' : 'ml-auto'
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={isIconOnly ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group',
                  isIconOnly && 'justify-center px-2',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/15 to-purple-500/10 text-foreground shadow-sm shadow-violet-500/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors', isActive ? 'text-violet-400' : 'group-hover:text-foreground')} />
                {showLabels && (
                  <>
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {/* Admin Section */}
          <div className="pt-4 mt-4 border-t border-border/60">
            <div className={cn('flex items-center gap-2 px-3 mb-2', isIconOnly && 'justify-center px-2')}>
              <Shield className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              {showLabels && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400/70">Admin</span>
              )}
            </div>
            {adminItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  title={isIconOnly ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group',
                    isIconOnly && 'justify-center px-2',
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/15 to-purple-500/10 text-foreground shadow-sm shadow-violet-500/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors', isActive ? 'text-violet-400' : 'group-hover:text-foreground')} />
                  {showLabels && (
                    <>
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Now Playing Mini */}
        {showLabels && (
          <div className="px-3 py-3 border-t border-border/60">
            <div className="bg-gradient-to-r from-violet-500/[0.08] to-purple-600/[0.06] rounded-xl p-3 border border-violet-500/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-foreground/90">Now Streaming</p>
                  <p className="text-[10px] text-muted-foreground/70">AI-curated music</p>
                </div>
                <div className="flex gap-[3px] items-end h-4" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-gradient-to-t from-violet-500 to-violet-300 rounded-full eq-bar"
                      style={{ animationDelay: `${i * 0.15}s`, height: '40%' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed: mini music icon */}
        {isIconOnly && (
          <div className="px-3 py-3 border-t border-border/60 flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center" aria-label="Music is streaming">
              <Music className="w-4 h-4 text-violet-400" />
            </div>
          </div>
        )}

        {/* Theme Toggle + User */}
        <div className="px-3 py-3 border-t border-border/60">
          <div className={cn('flex items-center gap-3', isIconOnly && 'flex-col gap-2')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-violet-500/20 shrink-0" aria-hidden="true">
              {state.user?.name?.charAt(0) || 'A'}
            </div>
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground/90">{state.user?.name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground/60 truncate">{state.user?.email || ''}</p>
              </div>
            )}
            <div className={cn('flex', isIconOnly ? 'flex-col gap-1' : 'flex-row gap-0')}>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {hydrated && isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
