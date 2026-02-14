import { prisma } from './db';

export async function checkSubscriptionAccess(userId: string): Promise<{
  hasAccess: boolean;
  subscription: any;
  reason?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return { hasAccess: false, subscription: null, reason: 'User not found' };
    }

    // Super admin always has access
    if (user.role === 'super_admin') {
      return { hasAccess: true, subscription: user.subscription };
    }

    // Check if user has a subscription
    if (!user.subscription) {
      return { hasAccess: false, subscription: null, reason: 'No subscription' };
    }

    // Allow trial and active subscriptions
    if (user.subscription.status === 'trial' || user.subscription.status === 'active') {
      return { hasAccess: true, subscription: user.subscription };
    }

    // Cancelled subscriptions don't have access
    return { hasAccess: false, subscription: user.subscription, reason: 'Subscription cancelled' };
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return { hasAccess: false, subscription: null, reason: 'Error checking access' };
  }
}

export async function requireSuperAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin:', error);
    return false;
  }
}

export function getPlanLimits(planType: string) {
  const limits: Record<string, { venues: number; devices: number; users: number }> = {
    starter: { venues: 5, devices: 5, users: 3 },
    professional: { venues: 20, devices: 30, users: 10 },
    enterprise: { venues: -1, devices: -1, users: -1 }, // unlimited
  };

  return limits[planType] || limits.starter;
}

export function canAccessFeature(planType: string, feature: string): boolean {
  const featureAccess: Record<string, string[]> = {
    starter: ['basic_music', 'basic_scheduling'],
    professional: ['basic_music', 'basic_scheduling', 'advanced_analytics', 'custom_playlists', 's3_upload'],
    enterprise: ['basic_music', 'basic_scheduling', 'advanced_analytics', 'custom_playlists', 's3_upload', 'api_access', 'white_label'],
  };

  const allowedFeatures = featureAccess[planType] || [];
  return allowedFeatures.includes(feature);
}
