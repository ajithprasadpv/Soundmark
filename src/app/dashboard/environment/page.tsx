'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/lib/store';
import {
  Thermometer, Droplets, Sun, Cloud, Users, Eye,
  CloudRain, CloudSun, Gauge,
} from 'lucide-react';

const weatherIcons: Record<string, React.ElementType> = {
  clear: Sun,
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  'partly cloudy': CloudSun,
};

export default function EnvironmentPage() {
  const { state } = useAppState();
  const { venues, environmentData } = state;

  const venuesWithEnv = venues.filter(v => environmentData[v.id]);

  return (
    <div className="animate-slide-up">
      <Header title="Environment" description="Real-time environmental sensor data from your venues" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {venuesWithEnv.map(venue => {
          const env = environmentData[venue.id];
          const WeatherIcon = weatherIcons[env.weatherCondition] || Cloud;

          return (
            <Card key={venue.id} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{venue.name}</CardTitle>
                  <Badge variant={venue.status === 'active' ? 'success' : 'outline'}>{venue.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{venue.venueType} • {venue.city}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weather */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <WeatherIcon className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{env.temperature}°C</p>
                    <p className="text-xs text-muted-foreground capitalize">{env.weatherCondition}</p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Humidity</span>
                    </div>
                    <p className="text-lg font-semibold">{env.humidity}%</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${env.humidity}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sun className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">Light</span>
                    </div>
                    <p className="text-lg font-semibold">{env.ambientLight}%</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${env.ambientLight}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Crowd</span>
                    </div>
                    <p className="text-lg font-semibold">{env.crowdDensity}%</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${env.crowdDensity}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-muted-foreground">Temp</span>
                    </div>
                    <p className="text-lg font-semibold">{env.temperature}°C</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${(env.temperature / 40) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* AI Adaptation Note */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Adaptation</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {env.crowdDensity > 60
                      ? 'High crowd density detected — increasing energy and tempo'
                      : env.crowdDensity > 30
                      ? 'Moderate crowd — maintaining balanced ambience'
                      : 'Low crowd density — playing calm, ambient tracks'}
                  </p>
                </div>

                <div className="text-[10px] text-muted-foreground text-right">
                  Last updated: {new Date(env.timestamp).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {venuesWithEnv.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No environment data available</p>
          <p className="text-sm mt-1">Connect sensors to start collecting data</p>
        </div>
      )}
    </div>
  );
}
