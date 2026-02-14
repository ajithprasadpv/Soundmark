'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Search, Filter, Crown, Building2, 
  CheckCircle2, XCircle, Clock, AlertTriangle,
  UserCheck, UserX, Edit, Trash2, Plus,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  googleId: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    planType: string;
  } | null;
  subscription: {
    id: string;
    planType: string;
    status: string;
    billingAmount: number;
    billingCycle: string;
    nextRenewal: string | null;
  } | null;
}

export default function AdminUsersDBPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingSubscription, setEditingSubscription] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    planType: 'starter',
    status: 'trial',
    billingAmount: 0,
    billingCycle: 'monthly',
  });

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('filter', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, search]);

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          updates: { status: newStatus },
        }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const updateSubscription = async () => {
    if (!selectedUser) return;
    
    setEditingSubscription(true);
    try {
      await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          updates: subscriptionForm,
        }),
      });
      await fetchUsers();
      setEditingSubscription(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setEditingSubscription(false);
    }
  };

  const openEditSubscription = (user: User) => {
    setSelectedUser(user);
    if (user.subscription) {
      setSubscriptionForm({
        planType: user.subscription.planType,
        status: user.subscription.status,
        billingAmount: user.subscription.billingAmount,
        billingCycle: user.subscription.billingCycle,
      });
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const activeSubscriptions = users.filter(u => u.subscription?.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user accounts and subscriptions from the database
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{suspendedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subs</CardTitle>
            <Crown className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading users...</p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscription</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{user.name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.googleId && (
                          <span className="text-[10px] text-violet-400">Google OAuth</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        user.status === 'active' ? 'text-emerald-400' :
                        user.status === 'suspended' ? 'text-red-400' :
                        'text-muted-foreground'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-emerald-400' :
                          user.status === 'suspended' ? 'bg-red-400' :
                          'bg-muted-foreground'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.organization ? (
                        <div>
                          <p className="text-sm text-foreground">{user.organization.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.organization.planType}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No org</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <Badge variant="outline" className="capitalize">
                          {user.subscription.planType}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <div className="flex items-center gap-1">
                          {user.subscription.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {user.subscription.status === 'trial' && <Clock className="w-3 h-3 text-amber-400" />}
                          {user.subscription.status === 'cancelled' && <XCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-xs capitalize">{user.subscription.status}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditSubscription(user)}
                          className="h-7 px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {user.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            className="h-7 px-2 text-red-400 hover:text-red-400"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        )}
                        {user.status === 'suspended' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="h-7 px-2 text-emerald-400 hover:text-emerald-400"
                          >
                            <UserCheck className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Subscription Modal */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Subscription: {selectedUser.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Plan Type</label>
                  <select
                    value={subscriptionForm.planType}
                    onChange={e => setSubscriptionForm({ ...subscriptionForm, planType: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-lg border border-border/60 bg-background text-sm"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={subscriptionForm.status}
                    onChange={e => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-lg border border-border/60 bg-background text-sm"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Billing Amount ($)</label>
                  <input
                    type="number"
                    value={subscriptionForm.billingAmount}
                    onChange={e => setSubscriptionForm({ ...subscriptionForm, billingAmount: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 h-10 px-3 rounded-lg border border-border/60 bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Billing Cycle</label>
                  <select
                    value={subscriptionForm.billingCycle}
                    onChange={e => setSubscriptionForm({ ...subscriptionForm, billingCycle: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-lg border border-border/60 bg-background text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={updateSubscription}
                    disabled={editingSubscription}
                    className="flex-1"
                  >
                    {editingSubscription ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    disabled={editingSubscription}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
