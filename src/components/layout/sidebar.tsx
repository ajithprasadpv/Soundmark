'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
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
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/venues', label: 'Venues', icon: MapPin },
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

  const handleLogout = () => {
    localStorage.removeItem('ambience_token');
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/[0.06] bg-gradient-to-b from-[#0c0c14] to-[#08080e] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0c0c14] shadow-sm shadow-emerald-400/30" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">
            Ambience AI
          </h1>
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.15em]">Music Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-violet-500/15 to-purple-500/10 text-white shadow-sm shadow-violet-500/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              )}
            >
              <item.icon className={cn('w-[18px] h-[18px] transition-colors', isActive ? 'text-violet-400' : 'group-hover:text-foreground')} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        <div className="pt-4 mt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 px-3 mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400/70">Admin</span>
          </div>
          {adminItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/15 to-purple-500/10 text-white shadow-sm shadow-violet-500/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                )}
              >
                <item.icon className={cn('w-[18px] h-[18px] transition-colors', isActive ? 'text-violet-400' : 'group-hover:text-foreground')} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Now Playing Mini */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="bg-gradient-to-r from-violet-500/[0.08] to-purple-600/[0.06] rounded-xl p-3 border border-violet-500/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Music className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white/90">Now Streaming</p>
              <p className="text-[10px] text-muted-foreground/70">AI-curated music</p>
            </div>
            <div className="flex gap-[3px] items-end h-4">
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

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-violet-500/20">
            {state.user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white/90">{state.user?.name || 'User'}</p>
            <p className="text-[11px] text-muted-foreground/60 truncate">{state.user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/[0.04] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
