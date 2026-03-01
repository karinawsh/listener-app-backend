import { afterAll, afterEach } from 'vitest';
import prisma from '../lib/prisma.js';

afterEach(async () => {
  // Clearing out the database tables before each test
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.error('Error truncating tables:', error);
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
