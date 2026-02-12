'use client';

import Link from 'next/link';
import {
  Users, Crown, TrendingUp, AlertTriangle,
  ArrowRight, Building2, CheckCircle2, XCircle, Clock,
  DollarSign, Receipt,
} from 'lucide-react';
import { mockAdminUsers } from '@/lib/mock-data';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-border/60 bg-card p-6 flex items-start gap-4 hover:border-border transition-colors group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {href && (
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminOverviewPage() {
  const total = mockAdminUsers.length;
  const active = mockAdminUsers.filter(u => u.status === 'active').length;
  const suspended = mockAdminUsers.filter(u => u.status === 'suspended').length;
  const inactive = mockAdminUsers.filter(u => u.status === 'inactive').length;

  const activeSubscriptions = mockAdminUsers.filter(u => u.subscriptionStatus === 'active').length;
  const trialSubscriptions = mockAdminUsers.filter(u => u.subscriptionStatus === 'trial').length;
  const cancelledSubscriptions = mockAdminUsers.filter(u => u.subscriptionStatus === 'cancelled').length;

  const starterCount = mockAdminUsers.filter(u => u.planType === 'starter').length;
  const professionalCount = mockAdminUsers.filter(u => u.planType === 'professional').length;
  const enterpriseCount = mockAdminUsers.filter(u => u.planType === 'enterprise').length;

  // Unique orgs
  const uniqueOrgs = new Set(mockAdminUsers.map(u => u.organizationId)).size;

  // Revenue
  const totalMRR = mockAdminUsers
    .filter(u => u.role === 'owner' && u.subscriptionStatus !== 'cancelled')
    .reduce((sum, u) => sum + (u.billingCycle === 'monthly' ? u.billingAmount : Math.round(u.billingAmount / 12)), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time summary of all registered users and subscription health across the Soundmark platform.
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={total}
          subtitle={`${active} active · ${suspended + inactive} inactive/suspended`}
          icon={Users}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
          href="/admin/users"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          subtitle={`${trialSubscriptions} on trial · ${cancelledSubscriptions} cancelled`}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Organizations"
          value={uniqueOrgs}
          subtitle="Unique client organizations"
          icon={Building2}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/10"
        />
        <StatCard
          title="Suspended / Inactive"
          value={suspended + inactive}
          subtitle={`${suspended} suspended · ${inactive} inactive`}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          href="/admin/users"
        />
      </div>

      {/* Plan Distribution + Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Plan Distribution</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Users across subscription tiers</p>
            </div>
            <Crown className="w-5 h-5 text-amber-400/70" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Enterprise', count: enterpriseCount, color: 'bg-violet-500', textColor: 'text-violet-400' },
              { label: 'Professional', count: professionalCount, color: 'bg-sky-500', textColor: 'text-sky-400' },
              { label: 'Starter', count: starterCount, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${textColor}`}>{label}</span>
                  <span className="text-muted-foreground">{count} user{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Subscription Status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Current billing state by user</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400/70" />
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Active',
                count: activeSubscriptions,
                icon: CheckCircle2,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                label: 'Trial',
                count: trialSubscriptions,
                icon: Clock,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                label: 'Cancelled',
                count: cancelledSubscriptions,
                icon: XCircle,
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
            ].map(({ label, count, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Manage User Profiles</p>
              <p className="text-xs text-muted-foreground">View, search, filter and manage all platform users</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-violet-400 transition-colors shrink-0" />
          </Link>
          <Link
            href="/admin/subscriptions"
            className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Manage Subscriptions</p>
              <p className="text-xs text-muted-foreground">Billing, plans, revenue — ${totalMRR.toLocaleString()}/mo MRR</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors shrink-0" />
          </Link>
          <Link
            href="/admin/users?filter=suspended"
            className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Review Suspended Accounts</p>
              <p className="text-xs text-muted-foreground">{suspended} suspended account{suspended !== 1 ? 's' : ''} require attention</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-amber-400 transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
