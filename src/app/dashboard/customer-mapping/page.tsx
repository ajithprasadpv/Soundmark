'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAppState } from '@/lib/store';
import { CustomerMusicMapping, LicenseType, PlanType } from '@/types';
import {
  Users, Crown, Shield, Lock, Unlock, Edit, Save, X,
  Building2, Music, MapPin, Check, ChevronRight, Search,
  Star, Gem, Award,
} from 'lucide-react';

const allGenres = ['jazz', 'lounge', 'ambient', 'electronic', 'deep house', 'chill', 'classical', 'acoustic', 'folk', 'indie', 'soul', 'bossa nova', 'nature', 'meditation'];

const planConfig: Record<PlanType, { label: string; icon: React.ElementType; color: string; bg: string; border: string; defaultLicense: LicenseType[]; maxVenues: number }> = {
  starter: { label: 'Starter', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', defaultLicense: ['copyright-free'], maxVenues: 5 },
  professional: { label: 'Professional', icon: Gem, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', defaultLicense: ['copyright-free', 'copyrighted'], maxVenues: 25 },
  enterprise: { label: 'Enterprise', icon: Award, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', defaultLicense: ['copyright-free', 'copyrighted'], maxVenues: 999 },
};

export default function CustomerMappingPage() {
  const { state, dispatch } = useAppState();
  const { customerMappings, musicLibrary } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | PlanType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CustomerMusicMapping | null>(null);

  const filtered = customerMappings.filter(m => {
    if (filterPlan !== 'all' && m.planType !== filterPlan) return false;
    if (searchQuery) {
      return m.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const startEdit = (mapping: CustomerMusicMapping) => {
    setEditingId(mapping.id);
    setEditForm({ ...mapping });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      dispatch({ type: 'UPDATE_CUSTOMER_MAPPING', payload: { ...editForm, updatedAt: new Date().toISOString() } });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const toggleLicense = (license: LicenseType) => {
    if (!editForm) return;
    const current = editForm.allowedLicenseTypes;
    setEditForm({
      ...editForm,
      allowedLicenseTypes: current.includes(license)
        ? current.filter(l => l !== license)
        : [...current, license],
    });
  };

  const toggleGenre = (genre: string) => {
    if (!editForm) return;
    const current = editForm.allowedGenres;
    setEditForm({
      ...editForm,
      allowedGenres: current.includes(genre)
        ? current.filter(g => g !== genre)
        : [...current, genre],
    });
  };

  const getAccessibleTrackCount = (mapping: CustomerMusicMapping) => {
    return musicLibrary.filter(t =>
      mapping.allowedLicenseTypes.includes(t.licenseType) &&
      mapping.allowedGenres.includes(t.genre) &&
      t.allowedPlans.includes(mapping.planType) &&
      t.status === 'active'
    ).length;
  };

  const planCounts = {
    starter: customerMappings.filter(m => m.planType === 'starter').length,
    professional: customerMappings.filter(m => m.planType === 'professional').length,
    enterprise: customerMappings.filter(m => m.planType === 'enterprise').length,
  };

  return (
    <div className="animate-slide-up">
      <Header title="Customer Mapping" description="Map customer subscriptions to music access levels" />

      {/* Plan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(['starter', 'professional', 'enterprise'] as PlanType[]).map(plan => {
          const cfg = planConfig[plan];
          const Icon = cfg.icon;
          return (
            <Card key={plan} className={`hover:${cfg.border} transition-colors`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground">{planCounts[plan]} customers</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Music Access</span>
                    <div className="flex gap-1">
                      {cfg.defaultLicense.map(l => (
                        <Badge key={l} variant={l === 'copyright-free' ? 'success' : 'warning'} className="text-[9px]">
                          {l === 'copyright-free' ? 'Free' : 'Licensed'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Venues</span>
                    <span className="font-medium">{cfg.maxVenues === 999 ? 'Unlimited' : cfg.maxVenues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Tracks</span>
                    <span className="font-medium">
                      {musicLibrary.filter(t => t.allowedPlans.includes(plan) && t.status === 'active').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-64 bg-muted border-0" />
        </div>
        <Select value={filterPlan} onChange={e => setFilterPlan(e.target.value as 'all' | PlanType)} className="w-44">
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} customers</span>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {filtered.map(mapping => {
          const cfg = planConfig[mapping.planType];
          const Icon = cfg.icon;
          const isEditing = editingId === mapping.id;
          const form = isEditing ? editForm! : mapping;
          const trackCount = getAccessibleTrackCount(mapping);

          return (
            <Card key={mapping.id} className={`transition-all ${isEditing ? 'border-primary/50 ring-1 ring-primary/20' : 'hover:border-border/80'}`}>
              <CardContent className="p-5">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Building2 className={`w-6 h-6 ${cfg.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{mapping.organizationName}</h3>
                        <Badge className={`${cfg.bg} ${cfg.color} text-[10px]`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                        <Badge variant={mapping.subscriptionStatus === 'active' ? 'success' : mapping.subscriptionStatus === 'trial' ? 'warning' : 'destructive'}>
                          {mapping.subscriptionStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {trackCount} accessible tracks • {mapping.maxConcurrentVenues === 999 ? 'Unlimited' : mapping.maxConcurrentVenues} venues max
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                        <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1" /> Save</Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => startEdit(mapping)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit Access
                      </Button>
                    )}
                  </div>
                </div>

                {/* License Types */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">License Access</p>
                  <div className="flex gap-2">
                    {(['copyright-free', 'copyrighted'] as LicenseType[]).map(license => {
                      const isAllowed = form.allowedLicenseTypes.includes(license);
                      return (
                        <button
                          key={license}
                          disabled={!isEditing}
                          onClick={() => isEditing && toggleLicense(license)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            isAllowed
                              ? license === 'copyright-free'
                                ? 'bg-success/10 border-success/30 text-success'
                                : 'bg-warning/10 border-warning/30 text-warning'
                              : 'bg-muted/50 border-border text-muted-foreground'
                          } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          {license === 'copyright-free' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {license === 'copyright-free' ? 'Copyright-Free' : 'Copyrighted'}
                          {isAllowed && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Allowed Genres */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Allowed Genres ({form.allowedGenres.length}/{allGenres.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allGenres.map(genre => {
                      const isAllowed = form.allowedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          disabled={!isEditing}
                          onClick={() => isEditing && toggleGenre(genre)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            isAllowed
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'bg-muted text-muted-foreground border border-transparent'
                          } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Max Venues (editable) */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Max Concurrent Venues</label>
                        <Input
                          type="number"
                          value={editForm!.maxConcurrentVenues}
                          onChange={e => setEditForm({ ...editForm!, maxConcurrentVenues: Number(e.target.value) })}
                          className="w-32 mt-1"
                          min={1}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          Tracks accessible after save: <strong className="text-foreground">
                            {musicLibrary.filter(t =>
                              editForm!.allowedLicenseTypes.includes(t.licenseType) &&
                              editForm!.allowedGenres.includes(t.genre) &&
                              t.allowedPlans.includes(editForm!.planType) &&
                              t.status === 'active'
                            ).length}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No customers found</p>
        </div>
      )}
    </div>
  );
}
