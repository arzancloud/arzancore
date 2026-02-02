import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Пользователи платформы
 * Один пользователь может иметь несколько порталов
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Основные данные
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    name: varchar('name', { length: 255 }),
    surname: varchar('surname', { length: 255 }),
    avatar: text('avatar'),

    // Аутентификация
    passwordHash: text('password_hash'),
    emailVerified: boolean('email_verified').default(false),
    phoneVerified: boolean('phone_verified').default(false),

    // 2FA
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    twoFactorSecret: text('two_factor_secret'),
    backupCodes: jsonb('backup_codes').$type<string[]>(),

    // WebAuthn
    webauthnCredentials: jsonb('webauthn_credentials').$type<
      Array<{
        id: string;
        publicKey: string;
        counter: number;
        deviceType: string;
        createdAt: string;
      }>
    >(),

    // Настройки
    locale: varchar('locale', { length: 10 }).default('ru'),
    timezone: varchar('timezone', { length: 50 }).default('Asia/Almaty'),
    settings: jsonb('settings').$type<Record<string, unknown>>(),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, suspended, deleted
    suspendedAt: timestamp('suspended_at'),
    suspendReason: text('suspend_reason'),

    // Метаданные
    lastLoginAt: timestamp('last_login_at'),
    lastLoginIp: varchar('last_login_ip', { length: 45 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    phoneIdx: index('users_phone_idx').on(table.phone),
    statusIdx: index('users_status_idx').on(table.status),
  })
);

/**
 * Сессии пользователей
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Токен сессии
    token: varchar('token', { length: 255 }).notNull().unique(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),

    // Информация о устройстве
    userAgent: text('user_agent'),
    ip: varchar('ip', { length: 45 }),
    deviceType: varchar('device_type', { length: 50 }),
    deviceName: varchar('device_name', { length: 255 }),

    // Текущий портал (если выбран)
    currentPortalId: uuid('current_portal_id'),

    // Время жизни
    expiresAt: timestamp('expires_at').notNull(),
    lastActivityAt: timestamp('last_activity_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    tokenHashIdx: index('sessions_token_hash_idx').on(table.tokenHash),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  })
);

/**
 * OAuth аккаунты (Google, etc.)
 */
export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    provider: varchar('provider', { length: 50 }).notNull(), // google, github, etc.
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),

    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at'),

    profile: jsonb('profile').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('oauth_accounts_user_id_idx').on(table.userId),
    providerIdx: index('oauth_accounts_provider_idx').on(
      table.provider,
      table.providerAccountId
    ),
  })
);

/**
 * Верификационные токены (email, phone, password reset)
 */
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 50 }).notNull(), // email_verification, phone_verification, password_reset
    token: varchar('token', { length: 255 }).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),

    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tokenHashIdx: index('verification_tokens_token_hash_idx').on(
      table.tokenHash
    ),
    userTypeIdx: index('verification_tokens_user_type_idx').on(
      table.userId,
      table.type
    ),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
