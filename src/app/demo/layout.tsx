'use client';

import { Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Demo Banner */}
      <div className="sticky top-0 z-50 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">Demo Mode</p>
              <p className="text-xs text-amber-400/70">
                You're viewing a read-only demo. Sign up for full access to all features.
              </p>
            </div>
          </div>
          <Link href="/auth/signin">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30">
              Sign Up Now
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Content */}
      {children}
    </div>
  );
}
