import { PrismaClient, FreshnessState, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PondFish Database Seeding...');

  // 1. Settings (Store & Truck configuration)
  await prisma.setting.upsert({
    where: { key: 'store_info' },
    update: {},
    create: {
      key: 'store_info',
      value: JSON.stringify({
        name: 'PondFish Main Store',
        address: '123 Fresh Lake Road, Water Town, AP',
        phone: '+91 9876543210',
        operatingHours: '06:00 AM - 09:00 PM',
      }),
    },
  });

  await prisma.setting.upsert({
    where: { key: 'truck_info' },
    update: {},
    create: {
      key: 'truck_info',
      value: JSON.stringify({
        truckNumber: 'AP-39-TF-1001',
        driverName: 'Ramesh Kumar',
        coverageArea: 'Water Town & Surrounding 15km',
      }),
    },
  });

  // 2. Admin User
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
  console.log('👤 Admin user seeded:', admin.email);

  // 3. Worker User
  const workerPassword = await bcrypt.hash('Worker@123456', 12);
  const worker = await prisma.worker.upsert({
    where: { email: 'worker@pondfish.com' },
    update: {},
    create: {
      email: 'worker@pondfish.com',
      passwordHash: workerPassword,
      name: 'Store Worker - Raju',
      active: true,
    },
  });
  console.log('👷 Worker user seeded:', worker.email);

  // 4. Categories
  const liveCategory = await prisma.category.upsert({
    where: { slug: 'live-pond-fish' },
    update: {},
    create: {
      name: 'Live Pond Fish',
      slug: 'live-pond-fish',
      displayOrder: 1,
      active: true,
    },
  });

  const freshCutCategory = await prisma.category.upsert({
    where: { slug: 'fresh-cut-fish' },
    update: {},
    create: {
      name: 'Fresh Cut Fish',
      slug: 'fresh-cut-fish',
      displayOrder: 2,
      active: true,
    },
  });
  console.log('🏷️ Categories seeded:', liveCategory.name, freshCutCategory.name);

  // 5. Fish Items
  const rohu = await prisma.fish.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      categoryId: liveCategory.id,
      name: 'Fresh Live Rohu (Carps)',
      description: 'Sweet freshwater live pond Rohu fish.',
      unitPrice: 240.0,
      physicalAvailable: true,
      onlineBookable: true,
      freshnessState: FreshnessState.GREEN,
    },
  });

  const catla = await prisma.fish.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      categoryId: liveCategory.id,
      name: 'Premium Live Catla',
      description: 'Big size live pond Catla fish.',
      unitPrice: 280.0,
      physicalAvailable: true,
      onlineBookable: true,
      freshnessState: FreshnessState.GREEN,
    },
  });

  const prawns = await prisma.fish.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      categoryId: freshCutCategory.id,
      name: 'Freshwater Prawns (Large)',
      description: 'Cleaned and deshelled fresh prawns.',
      unitPrice: 550.0,
      physicalAvailable: true,
      onlineBookable: false, // Physical store availability only
      freshnessState: FreshnessState.GREEN,
    },
  });
  console.log('🐟 Fish items seeded:', rohu.name, catla.name, prawns.name);

  // 6. Inventory Batches
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 48);

  const rohuBatch = await prisma.inventoryBatch.create({
    data: {
      fishId: rohu.id,
      batchCode: 'BATCH-ROHU-001',
      receivedQty: 100.0,
      physicalQty: 100.0,
      reservedQty: 0.0,
      availableQty: 100.0,
      expiryAt: expiryDate,
    },
  });

  await prisma.inventoryLedger.create({
    data: {
      fishId: rohu.id,
      batchId: rohuBatch.id,
      changeType: 'RECEIVING',
      quantityChange: 100.0,
      resultingQty: 100.0,
      referenceId: 'INITIAL_SEED',
    },
  });
  console.log('📦 Inventory batch seeded for Rohu:', rohuBatch.batchCode);

  // 7. Active Discounts
  await prisma.discount.upsert({
    where: { discountCode: 'FRESH10' },
    update: {},
    create: {
      fishId: rohu.id,
      discountCode: 'FRESH10',
      discountPercent: 10.0,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      active: true,
    },
  });

  // 8. Subscription Plans
  const planStandard = await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Gold Fish Plan',
      price: 3000.0,
      creditAmount: 3500.0, // Pay 3000 get 3500
      weeklyQtyLimitKg: 5.0,
      validityDays: 30,
      active: true,
    },
  });
  console.log('💳 Subscription plan seeded:', planStandard.title);

  console.log('✅ PondFish Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
