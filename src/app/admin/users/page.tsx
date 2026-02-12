'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Filter, X, ChevronRight,
  Building2, Crown, Shield, Clock,
  CheckCircle2, XCircle, AlertTriangle,
  LayoutGrid, List, MapPin, Calendar,
  Activity, UserCheck, UserX,
} from 'lucide-react';
import { mockAdminUsers, AdminUserProfile } from '@/lib/mock-data';
import type { PlanType, UserRole, UserStatus, SubscriptionStatus } from '@/types';

// ─── Badge Components ──────────────────────────────────────────────

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

function StatusBadge({ status }: { status: UserStatus }) {
  const config: Record<UserStatus, { label: string; className: string; dot: string }> = {
    active: { label: 'Active', className: 'text-emerald-400', dot: 'bg-emerald-400' },
    inactive: { label: 'Inactive', className: 'text-muted-foreground', dot: 'bg-muted-foreground' },
    suspended: { label: 'Suspended', className: 'text-red-400', dot: 'bg-red-400' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Partial<Record<UserRole, string>> = {
    owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    staff: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    super_admin: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${styles[role] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {role.replace('_', ' ')}
    </span>
  );
}

function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const config: Record<SubscriptionStatus, { label: string; icon: React.ElementType; className: string }> = {
    active: { label: 'Active', icon: CheckCircle2, className: 'text-emerald-400' },
    trial: { label: 'Trial', icon: Clock, className: 'text-amber-400' },
    cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-red-400' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${c.className}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Detail Slide-Over Panel ───────────────────────────────────────

function UserDetailPanel({
  user,
  onClose,
  onToggleStatus,
}: {
  user: AdminUserProfile;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
}) {
  const isSuspended = user.status === 'suspended';
  const canToggle = user.status === 'active' || user.status === 'suspended';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border/60 shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`User profile: ${user.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <h2 className="text-base font-semibold text-foreground">User Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar + Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-violet-500/20 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{user.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Organization</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.organizationName}</p>
                <p className="text-xs text-muted-foreground">ID: {user.organizationId}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Subscription</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Plan</p>
                <PlanBadge plan={user.planType} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <SubscriptionBadge status={user.subscriptionStatus} />
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Usage</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user.venueCount} venue{user.venueCount !== 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground">Active locations</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Timeline</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.lastActive).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {canToggle && (
          <div className="px-6 py-4 border-t border-border/60 shrink-0">
            <button
              onClick={() => onToggleStatus(user.id)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isSuspended
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
              }`}
            >
              {isSuspended ? (
                <><UserCheck className="w-4 h-4" /> Reactivate Account</>
              ) : (
                <><UserX className="w-4 h-4" /> Suspend Account</>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') ?? 'all';

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>(
    initialFilter === 'suspended' ? 'suspended' : 'all'
  );
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);
  const [users, setUsers] = useState<AdminUserProfile[]>(mockAdminUsers);

  const handleToggleStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== id) return u;
        const next: UserStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: next };
      })
    );
    // Keep selected user in sync
    setSelectedUser(prev => {
      if (!prev || prev.id !== id) return prev;
      const next: UserStatus = prev.status === 'active' ? 'suspended' : 'active';
      return { ...prev, status: next };
    });
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        search.trim() === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.organizationName.toLowerCase().includes(search.toLowerCase());

      const matchesPlan = planFilter === 'all' || u.planType === planFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesPlan && matchesStatus && matchesRole;
    });
  }, [users, search, planFilter, statusFilter, roleFilter]);

  const hasActiveFilters = search || planFilter !== 'all' || statusFilter !== 'all' || roleFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setPlanFilter('all');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''} shown
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name, email, or organization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value as PlanType | 'all')}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
            aria-label="Filter by plan"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as UserStatus | 'all')}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscription</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venues</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
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
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-foreground font-medium truncate max-w-[140px]">{user.organizationName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <PlanBadge plan={user.planType} />
                    </td>
                    <td className="px-5 py-4">
                      <SubscriptionBadge status={user.subscriptionStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-foreground font-medium">{user.venueCount}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {(user.status === 'active' || user.status === 'suspended') && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'suspended'
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-red-400 hover:bg-red-500/10'
                            }`}
                            title={user.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}
                            aria-label={user.status === 'suspended' ? `Reactivate ${user.name}` : `Suspend ${user.name}`}
                          >
                            {user.status === 'suspended' ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors cursor-pointer"
                          title="View profile details"
                          aria-label={`View details for ${user.name}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden divide-y divide-border/40">
            {filtered.map(user => (
              <div
                key={user.id}
                className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <RoleBadge role={user.role} />
                    <PlanBadge plan={user.planType} />
                    <StatusBadge status={user.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{user.organizationName} · {user.venueCount} venues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
