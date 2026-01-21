import { DataSource } from 'typeorm';
import { Receipt, ReceiptStatus, PaymentMethod } from '../modules/receipts/entities/receipt.entity';
import { User } from '../modules/auth/entities/user.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { parseLocalDate } from '../modules/common/utils/date.util';

/**
 * Seed script to generate test data for the application
 *
 * Usage:
 *   npm run seed
 *   or
 *   ts-node -r tsconfig-paths/register src/scripts/seed.ts
 */

const categories = [
  'GROCERY',
  'HEALTH',
  'EDUCATION',
  'ENTERTAINMENT',
  'TRANSPORTATION',
  'UTILITIES',
  'RESTAURANT',
  'SHOPPING',
  'OTHER',
];

const stores = [
  'Walmart',
  'Costco',
  'Target',
  'Whole Foods',
  'CVS Pharmacy',
  'Starbucks',
  "McDonald's",
  'Shell',
  'Home Depot',
  'Best Buy',
  'Amazon',
  "Trader Joe's",
];

const paymentMethods = [PaymentMethod.CARD, PaymentMethod.CASH, PaymentMethod.OTHER];

interface ReceiptSeedData {
  storeName: string;
  receiptDate: string;
  category: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  total: number;
}

function generateRandomDate(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateReceiptData(count: number, startDate: Date, endDate: Date): ReceiptSeedData[] {
  const receipts: ReceiptSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const subtotal = getRandomNumber(10, 200);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    receipts.push({
      storeName: getRandomElement(stores),
      receiptDate: generateRandomDate(startDate, endDate).toISOString().split('T')[0],
      category: getRandomElement(categories),
      paymentMethod: getRandomElement(paymentMethods),
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  }

  return receipts;
}

/**
 * Generate receipts that belong to the same original receipt (same store, date, and time)
 * This simulates receipts that were split by category from one receipt image
 */
function generateGroupedReceipts(
  storeName: string,
  receiptDate: string,
  baseTime: Date,
  categoryTotals: { category: string; total: number }[],
): ReceiptSeedData[] {
  const receipts: ReceiptSeedData[] = [];
  let subtotalSum = 0;

  categoryTotals.forEach((cat, index) => {
    const subtotal = cat.total * 0.925; // Approximate subtotal (before tax)
    const tax = cat.total - subtotal;
    subtotalSum += subtotal;

    receipts.push({
      storeName,
      receiptDate,
      category: cat.category,
      paymentMethod: PaymentMethod.CARD, // Same payment method for grouped receipts
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(cat.total * 100) / 100,
    });
  });

  return receipts;
}

async function seed() {
  console.log('🌱 Starting seed process...');

  // Get database connection
  // Use DATABASE_URL from environment (set in docker-compose.dev.yml)
  // If not available, construct from individual env vars
  const databaseUrl = process.env.DATABASE_URL;

  let dataSourceConfig: any;

  if (databaseUrl) {
    // Use DATABASE_URL if provided (preferred method)
    console.log(`📡 Connecting using DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
    dataSourceConfig = {
      type: 'postgres',
      url: databaseUrl,
      entities: [Receipt, User, RefreshToken],
      synchronize: false,
    };
  } else {
    // Fallback: Construct from individual env vars
    // In Docker, host should be 'postgres' (service name), otherwise 'localhost'
    const dbHost = process.env.DB_HOST || 'postgres'; // Default to 'postgres' for Docker
    const dbPort = parseInt(process.env.DB_PORT || '5432');
    const dbUser = process.env.DB_USER || process.env.POSTGRES_USER || 'alinina';
    const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres';
    const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || 'receipts_db';

    console.log(`📡 Connecting to: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

    dataSourceConfig = {
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
      database: dbName,
      entities: [Receipt, User, RefreshToken],
      synchronize: false,
    };
  }

  const dataSource = new DataSource(dataSourceConfig);

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const receiptRepository = dataSource.getRepository(Receipt);
    const userRepository = dataSource.getRepository(User);

    // Find or create a test user with your Google email
    const testUserEmail = 'alibrave8867@gmail.com';
    let testUser = await userRepository.findOne({ where: { email: testUserEmail } });

    if (!testUser) {
      console.log(`👤 Creating test user: ${testUserEmail}...`);
      testUser = userRepository.create({
        email: testUserEmail,
        name: 'Ali Brave',
        googleId: null, // Will be set automatically when you login with Google
      });
      testUser = await userRepository.save(testUser);
      console.log(`✅ Test user created: ${testUser.id}`);
      console.log(`📧 Email: ${testUser.email}`);
    } else {
      console.log(`✅ Using existing test user: ${testUser.id}`);
      console.log(`📧 Email: ${testUser.email}`);
      // Update name if needed
      if (testUser.name !== 'Ali Brave') {
        testUser.name = 'Ali Brave';
        await userRepository.save(testUser);
      }
    }

    // Clear existing receipts for test user
    const existingCount = await receiptRepository.count({ where: { userId: testUser.id } });
    if (existingCount > 0) {
      console.log(`🗑️  Deleting ${existingCount} existing receipts...`);
      await receiptRepository.delete({ userId: testUser.id });
      console.log('✅ Existing receipts deleted');
    }

    // Generate date range: last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    console.log(
      `📅 Generating receipts from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    );

    // Generate 50 random receipts
    const randomReceipts = generateReceiptData(50, startDate, endDate);

    // Generate 5 grouped receipts (simulating multi-category receipts)
    const groupedReceipts: ReceiptSeedData[] = [];
    const today = new Date();

    // Group 1: Walmart - Grocery + Health
    const group1Date = generateRandomDate(startDate, endDate).toISOString().split('T')[0];
    const group1Time = new Date(group1Date);
    groupedReceipts.push(
      ...generateGroupedReceipts('Walmart', group1Date, group1Time, [
        { category: 'GROCERY', total: 85.5 },
        { category: 'HEALTH', total: 24.3 },
      ]),
    );

    // Group 2: Costco - Grocery + Shopping
    const group2Date = generateRandomDate(startDate, endDate).toISOString().split('T')[0];
    const group2Time = new Date(group2Date);
    groupedReceipts.push(
      ...generateGroupedReceipts('Costco', group2Date, group2Time, [
        { category: 'GROCERY', total: 120.0 },
        { category: 'SHOPPING', total: 45.5 },
      ]),
    );

    // Group 3: Target - Shopping + Entertainment
    const group3Date = generateRandomDate(startDate, endDate).toISOString().split('T')[0];
    const group3Time = new Date(group3Date);
    groupedReceipts.push(
      ...generateGroupedReceipts('Target', group3Date, group3Time, [
        { category: 'SHOPPING', total: 65.75 },
        { category: 'ENTERTAINMENT', total: 29.99 },
      ]),
    );

    // Group 4: Whole Foods - Grocery + Restaurant
    const group4Date = generateRandomDate(startDate, endDate).toISOString().split('T')[0];
    const group4Time = new Date(group4Date);
    groupedReceipts.push(
      ...generateGroupedReceipts('Whole Foods', group4Date, group4Time, [
        { category: 'GROCERY', total: 95.2 },
        { category: 'RESTAURANT', total: 18.5 },
      ]),
    );

    // Group 5: CVS - Health + Other
    const group5Date = generateRandomDate(startDate, endDate).toISOString().split('T')[0];
    const group5Time = new Date(group5Date);
    groupedReceipts.push(
      ...generateGroupedReceipts('CVS Pharmacy', group5Date, group5Time, [
        { category: 'HEALTH', total: 42.15 },
        { category: 'OTHER', total: 12.3 },
      ]),
    );

    // Combine all receipts
    const allReceipts = [...randomReceipts, ...groupedReceipts];

    console.log(`📝 Creating ${allReceipts.length} receipts...`);

    // Create receipts in batches to simulate grouped receipts having same createdAt
    const receiptEntities: Receipt[] = [];
    let currentGroupTime = new Date();

    for (let i = 0; i < allReceipts.length; i++) {
      const receiptData = allReceipts[i];

      // Check if this receipt is part of a group (same store + date as previous)
      const isGrouped =
        i > 0 &&
        receiptData.storeName === allReceipts[i - 1].storeName &&
        receiptData.receiptDate === allReceipts[i - 1].receiptDate;

      if (!isGrouped) {
        // New group - set new time
        currentGroupTime = new Date();
      }

      const receipt = receiptRepository.create({
        userId: testUser.id,
        storeName: receiptData.storeName,
        receiptDate: parseLocalDate(receiptData.receiptDate),
        category: receiptData.category,
        paymentMethod: receiptData.paymentMethod,
        subtotal: receiptData.subtotal,
        tax: receiptData.tax,
        total: receiptData.total,
        status: ReceiptStatus.COMPLETED,
        needsReview: false,
      });

      receiptEntities.push(receipt);
    }

    // Save all receipts
    // For grouped receipts, we need to set createdAt manually to be within 2 seconds
    const savedReceipts: Receipt[] = [];
    let groupStartTime = new Date();

    for (let i = 0; i < receiptEntities.length; i++) {
      const receipt = receiptEntities[i];

      // Check if this receipt is part of a group
      const isGrouped =
        i > 0 &&
        receipt.storeName === receiptEntities[i - 1].storeName &&
        receipt.receiptDate.getTime() === receiptEntities[i - 1].receiptDate.getTime();

      if (!isGrouped) {
        groupStartTime = new Date();
      }

      // Set createdAt to be within 2 seconds of group start
      const createdAt = new Date(groupStartTime.getTime() + (i % 3) * 500); // 0ms, 500ms, 1000ms
      receipt.createdAt = createdAt;
      receipt.updatedAt = createdAt;

      const saved = await receiptRepository.save(receipt);
      savedReceipts.push(saved);
    }

    console.log(`✅ Successfully created ${savedReceipts.length} receipts`);

    // Print summary
    const categoryCounts = new Map<string, number>();
    const storeCounts = new Map<string, number>();
    let totalSpent = 0;

    savedReceipts.forEach(receipt => {
      totalSpent += Number(receipt.total);

      if (receipt.category) {
        categoryCounts.set(receipt.category, (categoryCounts.get(receipt.category) || 0) + 1);
      }

      storeCounts.set(receipt.storeName, (storeCounts.get(receipt.storeName) || 0) + 1);
    });

    console.log('\n📊 Summary:');
    console.log(`   Total Receipts: ${savedReceipts.length}`);
    console.log(`   Total Spent: $${totalSpent.toFixed(2)}`);
    console.log(`   Average per Receipt: $${(totalSpent / savedReceipts.length).toFixed(2)}`);
    console.log('\n📦 By Category:');
    Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    console.log('\n🏪 By Store:');
    Array.from(storeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([store, count]) => {
        console.log(`   ${store}: ${count}`);
      });

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed process finished');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seed process failed:', error);
      process.exit(1);
    });
}

export { seed };
