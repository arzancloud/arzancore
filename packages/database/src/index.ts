// Database connection
export {
  createDatabase,
  getDatabase,
  closeDatabase,
  type Database,
} from './connection';

// Re-export all schema
export * from './schema';

// Re-export drizzle utilities that are commonly needed
export { eq, and, or, not, isNull, isNotNull, inArray, notInArray, sql } from 'drizzle-orm';
export { desc, asc } from 'drizzle-orm';
