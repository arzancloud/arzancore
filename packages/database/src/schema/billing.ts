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
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { portals } from './portals';
import { availableModules, modulePlans } from './modules';

/**
 * Подписки портала
 */
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id),

    planId: uuid('plan_id')
      .notNull()
      .references(() => modulePlans.id),

    // Stripe данные
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    stripePriceId: varchar('stripe_price_id', { length: 255 }),

    // Статус
    status: varchar('status', { length: 20 }).notNull(), // active, canceled, past_due, trialing, paused

    // Интервал оплаты
    billingInterval: varchar('billing_interval', { length: 20 }).notNull(), // monthly, yearly

    // Текущий период
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),

    // Отмена
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    canceledAt: timestamp('canceled_at'),
    cancelReason: text('cancel_reason'),

    // Trial
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),

    // Метаданные
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('subscriptions_portal_id_idx').on(table.portalId),
    moduleIdIdx: index('subscriptions_module_id_idx').on(table.moduleId),
    stripeSubIdx: index('subscriptions_stripe_sub_idx').on(
      table.stripeSubscriptionId
    ),
    statusIdx: index('subscriptions_status_idx').on(table.status),
  })
);

/**
 * Способы оплаты
 */
export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Stripe данные
    stripePaymentMethodId: varchar('stripe_payment_method_id', {
      length: 255,
    }).notNull(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),

    // Тип
    type: varchar('type', { length: 20 }).notNull(), // card, bank_transfer

    // Данные карты (маскированные)
    card: jsonb('card').$type<{
      brand: string; // visa, mastercard
      last4: string;
      expMonth: number;
      expYear: number;
    }>(),

    // Дефолтный способ?
    isDefault: boolean('is_default').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('payment_methods_portal_id_idx').on(table.portalId),
  })
);

/**
 * Инвойсы
 */
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),

    // Stripe данные
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),

    // Номер инвойса
    number: varchar('number', { length: 100 }),

    // Суммы
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0'),
    amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Статус
    status: varchar('status', { length: 20 }).notNull(), // draft, open, paid, void, uncollectible

    // Даты
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    dueDate: timestamp('due_date'),
    paidAt: timestamp('paid_at'),

    // Детали
    lines: jsonb('lines').$type<
      Array<{
        description: string;
        quantity: number;
        unitAmount: number;
        amount: number;
      }>
    >(),

    // PDF
    invoicePdf: text('invoice_pdf'),
    hostedInvoiceUrl: text('hosted_invoice_url'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('invoices_portal_id_idx').on(table.portalId),
    stripeInvoiceIdx: index('invoices_stripe_invoice_idx').on(
      table.stripeInvoiceId
    ),
    statusIdx: index('invoices_status_idx').on(table.status),
  })
);

/**
 * Платежи
 */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    invoiceId: uuid('invoice_id').references(() => invoices.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),

    // Stripe данные
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeChargeId: varchar('stripe_charge_id', { length: 255 }),

    // Сумма
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Статус
    status: varchar('status', { length: 20 }).notNull(), // succeeded, pending, failed, refunded

    // Способ оплаты
    paymentMethodId: uuid('payment_method_id').references(
      () => paymentMethods.id
    ),
    paymentMethodType: varchar('payment_method_type', { length: 20 }),

    // Ошибка (если есть)
    failureCode: varchar('failure_code', { length: 100 }),
    failureMessage: text('failure_message'),

    // Возврат
    refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }),
    refundedAt: timestamp('refunded_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('payments_portal_id_idx').on(table.portalId),
    stripePaymentIdx: index('payments_stripe_payment_idx').on(
      table.stripePaymentIntentId
    ),
    statusIdx: index('payments_status_idx').on(table.status),
  })
);

/**
 * Использование (для usage-based billing)
 */
export const usageRecords = pgTable(
  'usage_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    moduleId: varchar('module_id', { length: 50 })
      .notNull()
      .references(() => availableModules.id),

    // Метрика
    metric: varchar('metric', { length: 50 }).notNull(), // 'dialogs', 'storage_bytes', 'api_calls', etc.

    // Значение
    value: integer('value').notNull(),

    // Период
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),

    // Отправлено в Stripe?
    reportedToStripe: boolean('reported_to_stripe').default(false),
    stripeUsageRecordId: varchar('stripe_usage_record_id', { length: 255 }),

    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  },
  (table) => ({
    portalModuleIdx: index('usage_records_portal_module_idx').on(
      table.portalId,
      table.moduleId
    ),
    metricIdx: index('usage_records_metric_idx').on(table.metric),
    periodIdx: index('usage_records_period_idx').on(
      table.periodStart,
      table.periodEnd
    ),
  })
);

/**
 * Промокоды
 */
export const promoCodes = pgTable(
  'promo_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: varchar('code', { length: 50 }).notNull().unique(),

    // Тип скидки
    discountType: varchar('discount_type', { length: 20 }).notNull(), // percent, fixed
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Применимость
    applicableModules: jsonb('applicable_modules').$type<string[]>(), // NULL = все модули
    applicablePlans: jsonb('applicable_plans').$type<string[]>(), // NULL = все планы

    // Ограничения
    maxRedemptions: integer('max_redemptions'),
    currentRedemptions: integer('current_redemptions').default(0),
    maxRedemptionsPerPortal: integer('max_redemptions_per_portal').default(1),

    // Срок действия
    validFrom: timestamp('valid_from'),
    validUntil: timestamp('valid_until'),

    // Длительность скидки (в месяцах, NULL = навсегда)
    durationMonths: integer('duration_months'),

    // Stripe данные
    stripeCouponId: varchar('stripe_coupon_id', { length: 255 }),

    isActive: boolean('is_active').default(true),

    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index('promo_codes_code_idx').on(table.code),
    isActiveIdx: index('promo_codes_is_active_idx').on(table.isActive),
  })
);

/**
 * Использование промокодов
 */
export const promoCodeRedemptions = pgTable(
  'promo_code_redemptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    promoCodeId: uuid('promo_code_id')
      .notNull()
      .references(() => promoCodes.id, { onDelete: 'restrict' }),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),

    discountApplied: decimal('discount_applied', { precision: 10, scale: 2 }),

    redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  (table) => ({
    promoCodeIdx: index('promo_code_redemptions_promo_code_idx').on(
      table.promoCodeId
    ),
    portalIdx: index('promo_code_redemptions_portal_idx').on(table.portalId),
  })
);

// Types
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
