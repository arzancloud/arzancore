import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Порталы (тенанты)
 * Каждый портал - отдельный инстанс продукта/продуктов
 */
export const portals = pgTable(
  'portals',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Владелец
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    // Идентификация
    name: varchar('name', { length: 255 }).notNull(),
    subdomain: varchar('subdomain', { length: 63 }).notNull().unique(),
    customDomain: varchar('custom_domain', { length: 255 }),
    logo: text('logo'),
    favicon: text('favicon'),

    // Настройки
    settings: jsonb('settings').$type<{
      timezone?: string;
      locale?: string;
      dateFormat?: string;
      currency?: string;
      theme?: 'light' | 'dark' | 'system';
      primaryColor?: string;
    }>(),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, trial, suspended, deleted
    trialEndsAt: timestamp('trial_ends_at'),
    suspendedAt: timestamp('suspended_at'),
    suspendReason: text('suspend_reason'),

    // Метаданные
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index('portals_owner_id_idx').on(table.ownerId),
    subdomainIdx: uniqueIndex('portals_subdomain_idx').on(table.subdomain),
    customDomainIdx: index('portals_custom_domain_idx').on(table.customDomain),
    statusIdx: index('portals_status_idx').on(table.status),
  })
);

/**
 * Участники портала
 * Связь между пользователями и порталами (многие-ко-многим)
 */
export const portalMembers = pgTable(
  'portal_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Роль в портале
    role: varchar('role', { length: 50 }).default('member'), // owner, admin, member
    customRoleId: uuid('custom_role_id'), // Ссылка на кастомную роль (если есть)

    // Статус участника
    status: varchar('status', { length: 20 }).default('active'), // active, invited, suspended
    invitedBy: uuid('invited_by').references(() => users.id),
    invitedAt: timestamp('invited_at'),
    joinedAt: timestamp('joined_at'),

    // Настройки участника
    settings: jsonb('settings').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalUserIdx: uniqueIndex('portal_members_portal_user_idx').on(
      table.portalId,
      table.userId
    ),
    portalIdIdx: index('portal_members_portal_id_idx').on(table.portalId),
    userIdIdx: index('portal_members_user_id_idx').on(table.userId),
  })
);

/**
 * Приглашения в портал
 */
export const portalInvitations = pgTable(
  'portal_invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('member'),
    customRoleId: uuid('custom_role_id'),

    token: varchar('token', { length: 255 }).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),

    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),

    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    acceptedBy: uuid('accepted_by').references(() => users.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalEmailIdx: uniqueIndex('portal_invitations_portal_email_idx').on(
      table.portalId,
      table.email
    ),
    tokenHashIdx: index('portal_invitations_token_hash_idx').on(table.tokenHash),
  })
);

/**
 * Настройки портала (расширенные)
 */
export const portalSettings = pgTable('portal_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id')
    .notNull()
    .unique()
    .references(() => portals.id, { onDelete: 'cascade' }),

  // Брендинг
  branding: jsonb('branding').$type<{
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }>(),

  // Региональные настройки
  regional: jsonb('regional').$type<{
    timezone?: string;
    locale?: string;
    dateFormat?: string;
    timeFormat?: string;
    currency?: string;
    firstDayOfWeek?: number;
  }>(),

  // Уведомления
  notifications: jsonb('notifications').$type<{
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    smsEnabled?: boolean;
    digestFrequency?: 'realtime' | 'daily' | 'weekly';
  }>(),

  // Безопасность
  security: jsonb('security').$type<{
    twoFactorRequired?: boolean;
    sessionTimeout?: number;
    ipWhitelist?: string[];
    passwordPolicy?: {
      minLength?: number;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    };
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type Portal = typeof portals.$inferSelect;
export type NewPortal = typeof portals.$inferInsert;
export type PortalMember = typeof portalMembers.$inferSelect;
export type NewPortalMember = typeof portalMembers.$inferInsert;
export type PortalInvitation = typeof portalInvitations.$inferSelect;
export type PortalSettings = typeof portalSettings.$inferSelect;
