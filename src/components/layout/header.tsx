'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/sidebar-context';

export function Header({ title, description }: { title: string; description?: string }) {
  const { isMobile, toggleOpen } = useSidebar();

  return (
    <header className="flex items-center justify-between pb-6 sm:pb-8 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger menu */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl hover:bg-foreground/[0.04]"
            onClick={toggleOpen}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">{title}</h1>
          {description && <p className="text-xs sm:text-[13px] text-muted-foreground/60 mt-1 truncate">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" aria-hidden="true" />
          <label className="sr-only" htmlFor="header-search">Search</label>
          <Input
            id="header-search"
            placeholder="Search..."
            className="pl-9 w-48 lg:w-64 bg-foreground/[0.04] border-border rounded-xl focus:bg-foreground/[0.06] focus:border-violet-500/30 transition-all"
          />
        </div>
        {/* Mobile search icon */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden relative rounded-xl hover:bg-foreground/[0.04]"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-muted-foreground/70" />
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-foreground/[0.04]" aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full shadow-sm shadow-violet-500/50" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
