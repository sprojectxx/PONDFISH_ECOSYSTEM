import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * SECURE FIRST-ADMIN PROVISIONING SCRIPT
 *
 * In Production (NODE_ENV=production):
 *   Requires ADMIN_INITIAL_PASSWORD environment variable. Fails closed if missing.
 *
 * In Development (NODE_ENV!=production):
 *   Uses ADMIN_INITIAL_PASSWORD if defined, or dev fallback password.
 */

const prisma = new PrismaClient();

export async function seedAdmin() {
  console.log('👤 Provisioning PondFish Initial Admin Account...');

  const isProduction = process.env.NODE_ENV === 'production';
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (isProduction && (!initialPassword || initialPassword.trim().length === 0)) {
    throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: ADMIN_INITIAL_PASSWORD environment variable is missing for production seeding.');
  }

  const rawPassword = initialPassword || 'Admin@123456';
  const adminPassword = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@pondfish.com' },
    update: {},
    create: {
      email: 'admin@pondfish.com',
      passwordHash: adminPassword,
      name: 'Super Admin',
      isSuperAdmin: true,
    },
  });

  console.log(`✅ Admin account provisioned: ${admin.email}`);
}

if (require.main === module) {
  seedAdmin()
    .catch((e) => {
      console.error('❌ Admin Provisioning Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
