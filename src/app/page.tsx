'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Waves, ArrowRight, Music, MapPin, BarChart3, Zap,
  Shield, Clock, Brain, Headphones, Building2, Star,
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Generation', desc: 'Advanced neural networks create unique, context-aware music in real-time' },
  { icon: MapPin, title: 'Multi-Venue Management', desc: 'Control music across all your locations from a single dashboard' },
  { icon: Zap, title: 'Real-Time Adaptation', desc: 'Music adapts to crowd density, time of day, and environmental conditions' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Comprehensive insights into playback patterns and customer engagement' },
  { icon: Clock, title: 'Smart Scheduling', desc: 'Automated day-part scheduling for seamless music transitions' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2, GDPR, and CCPA compliant with end-to-end encryption' },
];

const stats = [
  { value: '100K+', label: 'Venues Supported' },
  { value: '<3s', label: 'Generation Latency' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'AI Music Generation' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Soundmark
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Headphones className="w-4 h-4" />
            AI-Powered Ambient Music Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            The Sound of{' '}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate real-time, context-aware ambient music for your commercial venues.
            Powered by advanced AI that adapts to your environment, crowd, and brand.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 h-13 shadow-lg shadow-primary/30">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base px-8 h-13">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Audio Visualizer */}
          <div className="mt-16 flex items-end justify-center gap-1 h-20">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-primary to-purple-400 rounded-full eq-bar opacity-60"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.5 + ((i * 7 + 3) % 11) * 0.08}s`,
                  height: `${15 + ((i * 13 + 5) % 17) * 5}%`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Perfect Ambience
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete platform for generating, managing, and optimizing ambient music across all your venues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Every Venue</h2>
            <p className="text-muted-foreground">From intimate cafes to grand hotel lobbies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🍽️', name: 'Restaurants', desc: 'Elegant dining ambience' },
              { icon: '☕', name: 'Cafes', desc: 'Warm, inviting atmosphere' },
              { icon: '🏨', name: 'Hotels', desc: 'Luxury lobby soundscapes' },
              { icon: '🛍️', name: 'Retail', desc: 'Brand-aligned music' },
              { icon: '🧖', name: 'Spas', desc: 'Relaxation & wellness' },
              { icon: '💪', name: 'Gyms', desc: 'Energy-driven beats' },
              { icon: '🍸', name: 'Bars & Lounges', desc: 'Night-time vibes' },
              { icon: '🏢', name: 'Offices', desc: 'Focus & productivity' },
            ].map(venue => (
              <div key={venue.name} className="p-5 rounded-xl border border-border/50 bg-card/30 text-center hover:border-primary/30 transition-colors">
                <div className="text-3xl mb-2">{venue.icon}</div>
                <p className="font-medium text-sm">{venue.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{venue.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Venue?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of venues already using AI-powered ambient music to enhance their customer experience.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-base px-8 shadow-lg shadow-primary/30">
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">No credit card required • 14-day free trial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Soundmark
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Soundmark. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Privacy</span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
            <span className="hover:text-foreground cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
