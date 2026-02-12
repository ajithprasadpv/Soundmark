'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/lib/store';
import {
  User, Building2, CreditCard, Shield, Bell, Key,
  Save, Crown, Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { state } = useAppState();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
  });

  // State for notification toggles (was previously static)
  const [notifications, setNotifications] = useState([
    { id: 'playback', label: 'Playback Alerts', desc: 'Get notified when playback starts or stops', enabled: true },
    { id: 'environment', label: 'Environment Changes', desc: 'Alerts for significant environment changes', enabled: true },
    { id: 'weekly', label: 'Weekly Reports', desc: 'Receive weekly analytics summaries', enabled: false },
    { id: 'system', label: 'System Updates', desc: 'Platform updates and maintenance notices', enabled: true },
    { id: 'billing', label: 'Billing Alerts', desc: 'Subscription and payment notifications', enabled: true },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const plans = [
    { name: 'Starter', price: '$49', features: ['Up to 5 venues', '1,000 API calls/hr', 'Basic analytics', 'Email support'], current: false },
    { name: 'Professional', price: '$149', features: ['Up to 25 venues', '5,000 API calls/hr', 'Advanced analytics', 'Priority support', 'Custom genres'], current: true },
    { name: 'Enterprise', price: 'Custom', features: ['Unlimited venues', 'Unlimited API calls', 'Full analytics suite', '24/7 support', 'Custom AI models', 'SLA guarantee'], current: false },
  ];

  return (
    <div className="animate-slide-up">
      <Header title="Settings" description="Manage your account and platform preferences" />

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="w-full sm:w-56 shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0" aria-label="Settings sections">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-current={activeTab === tab.id ? 'true' : undefined}
              >
                <tab.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white text-2xl font-bold" aria-hidden="true">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{state.user?.role} • {state.user?.status}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-name" className="text-sm font-medium">Full Name</label>
                  <Input id="settings-name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="settings-email" className="text-sm font-medium">Email</label>
                  <Input id="settings-email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} autoComplete="email" />
                </div>

                <Button onClick={handleSave} className="mt-4">
                  {saved ? <><Check className="w-4 h-4 mr-2" aria-hidden="true" /> Saved!</> : <><Save className="w-4 h-4 mr-2" aria-hidden="true" /> Save Changes</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="settings-org-name" className="text-sm font-medium">Organization Name</label>
                  <Input id="settings-org-name" defaultValue="Luxe Hospitality Group" autoComplete="organization" />
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Crown className="w-5 h-5 text-warning" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Professional Plan</p>
                    <p className="text-xs text-muted-foreground">Up to 25 venues • 5,000 API calls/hr</p>
                  </div>
                  <Badge variant="success" className="ml-auto">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Total Venues</p>
                    <p className="text-xl font-bold mt-1">5</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Team Members</p>
                    <p className="text-xl font-bold mt-1">8</p>
                  </div>
                </div>
                <Button onClick={handleSave}>
                  {saved ? <><Check className="w-4 h-4 mr-2" aria-hidden="true" /> Saved!</> : <><Save className="w-4 h-4 mr-2" aria-hidden="true" /> Save Changes</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Choose the plan that fits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map(plan => (
                      <div
                        key={plan.name}
                        className={`p-4 rounded-xl border ${plan.current ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{plan.name}</h4>
                          {plan.current && <Badge variant="default">Current</Badge>}
                        </div>
                        <p className="text-2xl font-bold mb-3">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                        <ul className="space-y-1.5">
                          {plan.features.map(f => (
                            <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-success" aria-hidden="true" /> {f}
                            </li>
                          ))}
                        </ul>
                        <Button variant={plan.current ? 'outline' : 'default'} size="sm" className="w-full mt-4">
                          {plan.current ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="sec-current-pw" className="text-sm font-medium">Current Password</label>
                  <Input id="sec-current-pw" type="password" placeholder="Enter current password" autoComplete="current-password" />
                </div>
                <div>
                  <label htmlFor="sec-new-pw" className="text-sm font-medium">New Password</label>
                  <Input id="sec-new-pw" type="password" placeholder="Min 8 chars, 1 upper, 1 number, 1 special" autoComplete="new-password" />
                </div>
                <div>
                  <label htmlFor="sec-confirm-pw" className="text-sm font-medium">Confirm New Password</label>
                  <Input id="sec-confirm-pw" type="password" placeholder="Confirm new password" autoComplete="new-password" />
                </div>

                <div className="p-4 rounded-xl bg-muted/50 mt-4">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Enable 2FA</Button>
                  </div>
                </div>

                <Button onClick={handleSave}>
                  {saved ? <><Check className="w-4 h-4 mr-2" aria-hidden="true" /> Saved!</> : <><Save className="w-4 h-4 mr-2" aria-hidden="true" /> Update Password</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" role="group" aria-label="Notification preferences">
                  {notifications.map(notif => (
                    <div key={notif.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-medium" id={`notif-label-${notif.id}`}>{notif.label}</p>
                        <p className="text-xs text-muted-foreground" id={`notif-desc-${notif.id}`}>{notif.desc}</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={notif.enabled}
                        aria-labelledby={`notif-label-${notif.id}`}
                        aria-describedby={`notif-desc-${notif.id}`}
                        onClick={() => toggleNotification(notif.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${notif.enabled ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notif.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
