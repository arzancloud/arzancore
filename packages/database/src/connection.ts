import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = ReturnType<typeof createDatabase>;

/**
 * Создание подключения к базе данных
 * Поддерживает как стандартный PostgreSQL, так и Neon Serverless
 */
export function createDatabase(connectionString: string, options?: {
  useNeon?: boolean;
  maxConnections?: number;
}) {
  const { useNeon = false, maxConnections = 10 } = options || {};

  if (useNeon) {
    // Neon Serverless (для edge functions)
    const sql = neon(connectionString);
    return drizzleNeon({ client: sql, schema });
  }

  // Стандартный PostgreSQL
  const client = postgres(connectionString, {
    max: maxConnections,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

// Singleton instance (если нужен глобальный доступ)
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const useNeon = connectionString.includes('neon.tech');
    dbInstance = createDatabase(connectionString, { useNeon });
  }

  return dbInstance;
}

export function closeDatabase(): void {
  // При необходимости закрытия соединения
  dbInstance = null;
}
