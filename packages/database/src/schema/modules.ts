import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  decimal,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { portals } from './portals';

/**
 * Доступные продукты/модули в системе
 * CRM, AI+MSG, Shop, Booking, Med, Rent, Build и т.д.
 */
export const availableModules = pgTable('available_modules', {
  id: varchar('id', { length: 50 }).primaryKey(), // 'crm', 'ai-messenger', 'shop', etc.

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),

  // Категория
  category: varchar('category', { length: 50 }).notNull(), // 'product', 'addon', 'integration'

  // Иконка и изображения
  icon: varchar('icon', { length: 100 }),
  logo: text('logo'),
  screenshots: jsonb('screenshots').$type<string[]>(),

  // Это базовый продукт (можно выбрать при создании портала)?
  isBaseProduct: boolean('is_base_product').default(false),

  // Зависимости от других модулей
  dependencies: jsonb('dependencies').$type<string[]>(),

  // Фичи модуля (для отображения)
  features: jsonb('features').$type<
    Array<{
      title: string;
      description: string;
      icon?: string;
    }>
  >(),

  // Порядок отображения
  sortOrder: integer('sort_order').default(0),

  // Статус
  isActive: boolean('is_active').default(true),
  isBeta: boolean('is_beta').default(false),
  isComingSoon: boolean('is_coming_soon').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Тарифные планы для модулей
 */
export const modulePlans = pgTable(
  'module_plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id, { onDelete: 'cascade' }),

    // Название плана
    name: varchar('name', { length: 100 }).notNull(), // 'Starter', 'Pro', 'Enterprise'
    description: text('description'),

    // Цены
    priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }).notNull(),
    priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Stripe Price IDs
    stripePriceIdMonthly: varchar('stripe_price_id_monthly', { length: 255 }),
    stripePriceIdYearly: varchar('stripe_price_id_yearly', { length: 255 }),

    // Лимиты базового плана
    limits: jsonb('limits').$type<{
      users?: number;
      storage_gb?: number;
      // Специфичные для модуля лимиты
      [key: string]: number | undefined;
    }>(),

    // Включённые фичи
    features: jsonb('features').$type<string[]>(),

    // Популярный?
    isPopular: boolean('is_popular').default(false),

    // Порядок отображения
    sortOrder: integer('sort_order').default(0),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    moduleIdIdx: index('module_plans_module_id_idx').on(table.moduleId),
  })
);

/**
 * Add-ons для модулей (каналы, диалоги, хранилище и т.д.)
 */
export const moduleAddons = pgTable(
  'module_addons',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id, { onDelete: 'cascade' }),

    // Тип add-on
    addonType: varchar('addon_type', { length: 50 }).notNull(), // 'channel', 'dialogs', 'storage', 'user', 'agent', etc.

    // Название
    name: varchar('name', { length: 255 }).notNull(), // '+1 Канал', '+1000 диалогов'
    description: text('description'),

    // Цены
    priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }).notNull(),
    priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Stripe Price IDs
    stripePriceIdMonthly: varchar('stripe_price_id_monthly', { length: 255 }),
    stripePriceIdYearly: varchar('stripe_price_id_yearly', { length: 255 }),

    // Что добавляет
    unit: varchar('unit', { length: 50 }).notNull(), // 'channel', 'pack_1000', 'gb', 'user', 'agent'
    unitAmount: integer('unit_amount').notNull(), // 1, 1000, 5, 1

    // Можно ли купить несколько?
    isStackable: boolean('is_stackable').default(true),
    maxQuantity: integer('max_quantity'), // NULL = безлимит

    // Порядок отображения
    sortOrder: integer('sort_order').default(0),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    moduleIdIdx: index('module_addons_module_id_idx').on(table.moduleId),
    addonTypeIdx: index('module_addons_addon_type_idx').on(table.addonType),
  })
);

/**
 * Подключенные модули к порталу
 */
export const portalModules = pgTable(
  'portal_modules',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id, { onDelete: 'restrict' }),

    planId: uuid('plan_id').references(() => modulePlans.id),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, trial, suspended, canceled

    // Настройки модуля для этого портала
    settings: jsonb('settings').$type<Record<string, unknown>>(),

    // Trial период
    trialEndsAt: timestamp('trial_ends_at'),

    // Даты
    activatedAt: timestamp('activated_at').defaultNow(),
    suspendedAt: timestamp('suspended_at'),
    canceledAt: timestamp('canceled_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalModuleIdx: uniqueIndex('portal_modules_portal_module_idx').on(
      table.portalId,
      table.moduleId
    ),
    portalIdIdx: index('portal_modules_portal_id_idx').on(table.portalId),
    moduleIdIdx: index('portal_modules_module_id_idx').on(table.moduleId),
    statusIdx: index('portal_modules_status_idx').on(table.status),
  })
);

/**
 * Купленные add-ons портала
 */
export const portalAddons = pgTable(
  'portal_addons',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id),

    addonId: uuid('addon_id')
      .notNull()
      .references(() => moduleAddons.id, { onDelete: 'restrict' }),

    // Количество (если stackable)
    quantity: integer('quantity').default(1).notNull(),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, canceled

    // Stripe subscription item (если отдельный)
    stripeSubscriptionItemId: varchar('stripe_subscription_item_id', {
      length: 255,
    }),

    activatedAt: timestamp('activated_at').defaultNow(),
    canceledAt: timestamp('canceled_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalModuleIdx: index('portal_addons_portal_module_idx').on(
      table.portalId,
      table.moduleId
    ),
    portalAddonIdx: index('portal_addons_portal_addon_idx').on(
      table.portalId,
      table.addonId
    ),
  })
);

/**
 * Рассчитанные лимиты портала (план + addons)
 */
export const portalLimits = pgTable(
  'portal_limits',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id),

    // Текущие лимиты (план + addons)
    limits: jsonb('limits')
      .$type<{
        [key: string]: number;
      }>()
      .notNull(),

    // Текущее использование
    usage: jsonb('usage')
      .$type<{
        [key: string]: number;
      }>()
      .notNull(),

    // Период использования
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalModuleIdx: uniqueIndex('portal_limits_portal_module_idx').on(
      table.portalId,
      table.moduleId
    ),
  })
);

// Types
export type AvailableModule = typeof availableModules.$inferSelect;
export type ModulePlan = typeof modulePlans.$inferSelect;
export type ModuleAddon = typeof moduleAddons.$inferSelect;
export type PortalModule = typeof portalModules.$inferSelect;
export type NewPortalModule = typeof portalModules.$inferInsert;
export type PortalAddon = typeof portalAddons.$inferSelect;
export type PortalLimits = typeof portalLimits.$inferSelect;
