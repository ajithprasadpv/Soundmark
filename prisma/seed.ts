import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth-legacy';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org-1' },
    update: {},
    create: {
      id: 'demo-org-1',
      name: 'Demo Organization',
      ownerId: '1',
      planType: 'professional',
      status: 'active',
    },
  });

  console.log('✅ Created demo organization');

  // Create admin user (email/password)
  const adminPasswordHash = await hashPassword('Admin@123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@soundmark.app' },
    update: {},
    create: {
      id: '1',
      email: 'admin@soundmark.app',
      name: 'Ajith Prasad',
      role: 'owner',
      status: 'active',
      organizationId: demoOrg.id,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user');

  // Create admin subscription
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      planType: 'professional',
      status: 'active',
      billingAmount: 149,
      billingCycle: 'monthly',
      nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: 'card',
    },
  });

  console.log('✅ Created admin subscription');

  // Create super admin user
  const superAdminPasswordHash = await hashPassword('Admin@123');
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@soundmark.app' },
    update: {},
    create: {
      id: 'sa-1',
      email: 'superadmin@soundmark.app',
      name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created super admin user');

  // Create super admin subscription
  await prisma.subscription.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      planType: 'enterprise',
      status: 'active',
      billingAmount: 0,
      billingCycle: 'monthly',
      paymentMethod: 'invoice',
    },
  });

  console.log('✅ Created super admin subscription');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
