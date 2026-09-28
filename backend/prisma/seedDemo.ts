import { PrismaClient, FreshnessState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemo() {
  console.log('🐟 Starting Safe Idempotent PondFish Demo/Integration Seed...');

  // 1. Settings (Store & Truck configuration)
  const storeSetting = await prisma.setting.upsert({
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

  const truckSetting = await prisma.setting.upsert({
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
  console.log('⚙️ Settings verified:', storeSetting.key, truckSetting.key);

  // 2. Admin User (Preserve existing or seed default admin)
  const existingAdmin = await prisma.admin.findUnique({ where: { email: 'admin@pondfish.com' } });
  let admin = existingAdmin;
  if (!admin) {
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    admin = await prisma.admin.create({
      data: {
        email: 'admin@pondfish.com',
        passwordHash: adminPassword,
        name: 'Super Admin',
        isSuperAdmin: true,
      },
    });
    console.log('👤 Admin user created:', admin.email);
  } else {
    console.log('👤 Existing Admin detected and preserved:', admin.email);
  }

  // 3. Worker User (Preserve existing worker STEVANSON PAMISHETTY / 9347615308 or seed default 9876543210)
  const existingWorker = await prisma.worker.findFirst({
    where: { OR: [{ mobileNumber: '9347615308' }, { mobileNumber: '9876543210' }] },
  });
  let worker = existingWorker;
  if (!worker) {
    const workerPassword = await bcrypt.hash('Worker@123456', 12);
    worker = await prisma.worker.create({
      data: {
        mobileNumber: '9347615308',
        passwordHash: workerPassword,
        name: 'STEVANSON PAMISHETTY',
        active: true,
      },
    });
    console.log('👷 Worker user created:', worker.mobileNumber);
  } else {
    console.log('👷 Existing Worker detected and preserved:', worker.name, `(${worker.mobileNumber})`);
  }

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
  console.log('🏷️ Categories verified:', liveCategory.name, freshCutCategory.name);

  // 5. Fish Catalogue
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
      onlineBookable: false,
      freshnessState: FreshnessState.GREEN,
    },
  });
  console.log('🐟 Fish items verified:', rohu.name, catla.name, prawns.name);

  // 6. Demo Inventory Batch (Idempotent: Check batchCode first)
  const demoBatchCode = 'BATCH-ROHU-DEMO-001';
  let demoBatch = await prisma.inventoryBatch.findFirst({
    where: { fishId: rohu.id, batchCode: demoBatchCode },
  });

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 48);

  if (!demoBatch) {
    demoBatch = await prisma.inventoryBatch.create({
      data: {
        fishId: rohu.id,
        batchCode: demoBatchCode,
        receivedQty: 100.0,
        physicalQty: 100.0,
        reservedQty: 0.0,
        availableQty: 100.0,
        expiryAt: expiryDate,
      },
    });
    console.log('📦 Demo Inventory Batch created:', demoBatch.batchCode);
  } else {
    console.log('📦 Demo Inventory Batch verified:', demoBatch.batchCode, `(Available: ${demoBatch.availableQty} kg)`);
  }

  // 7. Inventory Ledger (Idempotent: Check referenceId)
  const ledgerRef = 'DEMO_SEED_ROHU_001';
  const existingLedger = await prisma.inventoryLedger.findFirst({
    where: { referenceId: ledgerRef },
  });

  if (!existingLedger) {
    await prisma.inventoryLedger.create({
      data: {
        fishId: rohu.id,
        batchId: demoBatch.id,
        changeType: 'RECEIVING',
        quantityChange: 100.0,
        resultingQty: 100.0,
        referenceId: ledgerRef,
      },
    });
    console.log('📜 Demo Inventory Ledger created for batch:', demoBatch.batchCode);
  } else {
    console.log('📜 Demo Inventory Ledger verified for batch:', demoBatch.batchCode);
  }

  // 8. Demo Customer (Idempotent: mobileNumber 9000000001)
  const demoCustomer = await prisma.customer.upsert({
    where: { mobileNumber: '9000000001' },
    update: {
      name: 'PONDFISH DEMO CUSTOMER',
    },
    create: {
      mobileNumber: '9000000001',
      name: 'PONDFISH DEMO CUSTOMER',
      area: 'Water Town',
    },
  });
  console.log('📱 Demo Customer verified:', demoCustomer.name, `(${demoCustomer.mobileNumber})`);

  // 9. Active Discounts
  const discount = await prisma.discount.upsert({
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
  console.log('🏷️ Demo Discount verified:', discount.discountCode);

  // 10. Subscription Plans
  const planStandard = await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Gold Fish Plan',
      price: 3000.0,
      creditAmount: 3500.0,
      weeklyQtyLimitKg: 5.0,
      validityDays: 30,
      active: true,
    },
  });
  console.log('💳 Subscription plan verified:', planStandard.title);

  console.log('✨ PondFish Demo/Integration Seed Completed Successfully!');
}

seedDemo()
  .catch((e) => {
    console.error('❌ Demo Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
