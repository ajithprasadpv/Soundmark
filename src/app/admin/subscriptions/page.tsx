'use client';

import { useState, useMemo } from 'react';
import {
  Search, Filter, X, ChevronRight,
  Crown, DollarSign, CreditCard, Receipt,
  CheckCircle2, XCircle, Clock, TrendingUp,
  Building2, MapPin, Monitor, Headphones,
  ArrowUpRight, ArrowDownRight, Banknote, FileText,
  Phone, Calendar,
} from 'lucide-react';
import { mockAdminUsers, AdminUserProfile } from '@/lib/mock-data';
import type { PlanType, SubscriptionStatus } from '@/types';

function PlanBadge({ plan }: { plan: PlanType }) {
  const styles: Record<PlanType, string> = {
    enterprise: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    professional: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    starter: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${styles[plan]}`}>
      {plan === 'enterprise' && <Crown className="w-2.5 h-2.5 mr-1" />}
      {plan}
    </span>
  );
}

function SubStatusBadge({ status }: { status: SubscriptionStatus }) {
  const config: Record<SubscriptionStatus, { label: string; icon: React.ElementType; className: string; bg: string }> = {
    active: { label: 'Active', icon: CheckCircle2, className: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    trial: { label: 'Trial', icon: Clock, className: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.bg} ${c.className}`}>
      <c.icon className="w-2.5 h-2.5" />
      {c.label}
    </span>
  );
}

function PaymentBadge({ method }: { method: 'card' | 'bank_transfer' | 'invoice' }) {
  const config = {
    card: { label: 'Card', icon: CreditCard, className: 'text-sky-400' },
    bank_transfer: { label: 'Bank', icon: Banknote, className: 'text-emerald-400' },
    invoice: { label: 'Invoice', icon: FileText, className: 'text-amber-400' },
  };
  const c = config[method];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${c.className}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);

  // Only show owners (one per org) for subscription view
  const orgOwners = useMemo(() => {
    const seen = new Set<string>();
    return mockAdminUsers.filter(u => {
      if (u.role !== 'owner') return false;
      if (seen.has(u.organizationId)) return false;
      seen.add(u.organizationId);
      return true;
    });
  }, []);

  const filtered = useMemo(() => {
    return orgOwners.filter(u => {
      const matchesSearch =
        search.trim() === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.organizationName.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === 'all' || u.planType === planFilter;
      const matchesStatus = statusFilter === 'all' || u.subscriptionStatus === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [orgOwners, search, planFilter, statusFilter]);

  const hasActiveFilters = search || planFilter !== 'all' || statusFilter !== 'all';

  // Revenue stats
  const totalMRR = orgOwners.reduce((sum, u) => {
    if (u.subscriptionStatus === 'cancelled') return sum;
    if (u.billingCycle === 'monthly') return sum + u.billingAmount;
    return sum + Math.round(u.billingAmount / 12);
  }, 0);

  const totalARR = totalMRR * 12;
  const activeCount = orgOwners.filter(u => u.subscriptionStatus === 'active').length;
  const trialCount = orgOwners.filter(u => u.subscriptionStatus === 'trial').length;
  const cancelledCount = orgOwners.filter(u => u.subscriptionStatus === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage billing, plans, and subscription status for all organizations.
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalMRR.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annual Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalARR.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Subs</p>
              <p className="text-2xl font-bold text-foreground">{activeCount} <span className="text-sm text-muted-foreground font-normal">+ {trialCount} trial</span></p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-foreground">{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by organization, name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value as PlanType | 'all')}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as SubscriptionStatus | 'all')}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setPlanFilter('all'); setStatusFilter('all'); }}
              className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Subscriptions Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No subscriptions found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billing</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venues</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer group"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-violet-400" />
                        </div>
                        <p className="font-medium text-foreground truncate max-w-[180px]">{user.organizationName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <PlanBadge plan={user.planType} />
                    </td>
                    <td className="px-5 py-4">
                      <SubStatusBadge status={user.subscriptionStatus} />
                    </td>
                    <td className="px-5 py-4">
                      {user.billingAmount > 0 ? (
                        <div>
                          <p className="text-sm font-semibold text-foreground">${user.billingAmount.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">/{user.billingCycle === 'monthly' ? 'month' : 'year'}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge method={user.paymentMethod} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-foreground">{user.venueCount}</span>
                    </td>
                    <td className="px-5 py-4">
                      {user.nextRenewal ? (
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.nextRenewal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-border/40">
            {filtered.map(user => (
              <div
                key={user.id}
                className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{user.organizationName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.name} · {user.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <PlanBadge plan={user.planType} />
                    <SubStatusBadge status={user.subscriptionStatus} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {user.billingAmount > 0 && <span className="font-semibold text-foreground">${user.billingAmount}/{user.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                    <span>{user.venueCount} venues</span>
                    <PaymentBadge method={user.paymentMethod} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Slide-Over */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border/60 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
              <h2 className="text-base font-semibold text-foreground">Subscription Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Org + Owner */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-violet-500/20 shrink-0">
                  {selectedUser.organizationName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">{selectedUser.organizationName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedUser.name} · {selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedUser.phone}</p>
                  )}
                </div>
              </div>

              {/* Plan & Status */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Plan & Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <PlanBadge plan={selectedUser.planType} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <SubStatusBadge status={selectedUser.subscriptionStatus} />
                  </div>
                </div>
                {selectedUser.trialEndsAt && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                    <p className="text-xs font-medium text-amber-400">
                      Trial ends {new Date(selectedUser.trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Billing */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Billing</p>
                {selectedUser.billingAmount > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">${selectedUser.billingAmount.toLocaleString()}<span className="text-sm text-muted-foreground font-normal">/{selectedUser.billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedUser.paymentMethod === 'card' ? 'Credit Card' : selectedUser.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Invoice Billing'}
                        </p>
                      </div>
                    </div>
                    {selectedUser.nextRenewal && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Next Renewal</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(selectedUser.nextRenewal).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No active billing</p>
                )}
              </div>

              {/* Usage */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Usage</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2.5 rounded-lg bg-background/50">
                    <MapPin className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedUser.venueCount}</p>
                    <p className="text-[10px] text-muted-foreground">Venues</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-background/50">
                    <Monitor className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedUser.deviceCount}</p>
                    <p className="text-[10px] text-muted-foreground">Devices</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-background/50">
                    <Headphones className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedUser.totalPlayHours.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Play Hrs</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Timeline</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Subscribed Since</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
