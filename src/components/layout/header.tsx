'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex items-center justify-between pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="text-[13px] text-muted-foreground/60 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input placeholder="Search..." className="pl-9 w-64 bg-white/[0.04] border-white/[0.06] rounded-xl focus:bg-white/[0.06] focus:border-violet-500/30 transition-all" />
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/[0.04]">
          <Bell className="w-5 h-5 text-muted-foreground/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full shadow-sm shadow-violet-500/50" />
        </Button>
      </div>
    </header>
  );
}
