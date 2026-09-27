import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Provisioning PondFish Initial Admin Account...');

  const adminPassword = await bcrypt.hash('Admin@123456', 12);
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

main()
  .catch((e) => {
    console.error('❌ Admin Provisioning Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
