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
import { users } from './users';
import { portals } from './portals';

/**
 * Уведомления
 * Для всех модулей платформы
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Получатель
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Тип уведомления
    type: varchar('type', { length: 50 }).notNull(), // info, success, warning, error, task, deal, message, etc.
    category: varchar('category', { length: 50 }), // crm, ai-messenger, stock, system, etc.

    // Содержимое
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message'),

    // Ссылка на объект
    moduleId: varchar('module_id', { length: 50 }), // crm, ai-messenger, etc.
    entityType: varchar('entity_type', { length: 50 }), // deal, contact, message, task, etc.
    entityId: uuid('entity_id'),
    entityUrl: text('entity_url'), // Прямая ссылка

    // Дополнительные данные
    data: jsonb('data').$type<Record<string, unknown>>(),

    // Отправитель (если есть)
    senderId: uuid('sender_id').references(() => users.id),

    // Статус
    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at'),

    // Приоритет
    priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent

    // Срок действия (после которого уведомление скрывается)
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalUserIdx: index('notifications_portal_user_idx').on(
      table.portalId,
      table.userId
    ),
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    typeIdx: index('notifications_type_idx').on(table.type),
    categoryIdx: index('notifications_category_idx').on(table.category),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  })
);

/**
 * Настройки уведомлений пользователя
 */
export const notificationSettings = pgTable(
  'notification_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Настройки по каналам
    channels: jsonb('channels').$type<{
      inApp: boolean;
      email: boolean;
      push: boolean;
      sms: boolean;
      telegram: boolean;
      whatsapp: boolean;
    }>(),

    // Настройки по категориям
    categories: jsonb('categories').$type<{
      [category: string]: {
        enabled: boolean;
        channels: string[];
      };
    }>(),

    // Тихие часы
    quietHours: jsonb('quiet_hours').$type<{
      enabled: boolean;
      start: string; // "22:00"
      end: string; // "08:00"
      timezone: string;
      exceptUrgent: boolean;
    }>(),

    // Дайджест
    digest: jsonb('digest').$type<{
      enabled: boolean;
      frequency: 'daily' | 'weekly';
      time: string; // "09:00"
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalUserIdx: index('notification_settings_portal_user_idx').on(
      table.portalId,
      table.userId
    ),
  })
);

/**
 * Лог активности
 * Для аудита и истории действий
 */
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Кто совершил действие
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    userEmail: varchar('user_email', { length: 255 }), // Сохраняем на случай удаления пользователя
    userName: varchar('user_name', { length: 255 }),

    // Модуль и действие
    moduleId: varchar('module_id', { length: 50 }), // crm, ai-messenger, stock, system
    action: varchar('action', { length: 50 }).notNull(), // create, update, delete, view, export, login, etc.

    // Объект действия
    entityType: varchar('entity_type', { length: 50 }), // deal, contact, product, user, etc.
    entityId: uuid('entity_id'),
    entityName: varchar('entity_name', { length: 255 }), // Название для отображения

    // Описание
    description: text('description'),

    // Изменения (для update)
    changes: jsonb('changes').$type<{
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
      fields?: string[]; // Какие поля изменились
    }>(),

    // Дополнительные данные
    metadata: jsonb('metadata').$type<{
      ip?: string;
      userAgent?: string;
      location?: string;
      duration?: number; // Длительность действия в мс
      [key: string]: unknown;
    }>(),

    // Уровень важности
    level: varchar('level', { length: 20 }).default('info'), // debug, info, warning, error

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('activity_logs_portal_id_idx').on(table.portalId),
    userIdIdx: index('activity_logs_user_id_idx').on(table.userId),
    moduleIdIdx: index('activity_logs_module_id_idx').on(table.moduleId),
    actionIdx: index('activity_logs_action_idx').on(table.action),
    entityIdx: index('activity_logs_entity_idx').on(
      table.entityType,
      table.entityId
    ),
    createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
  })
);

/**
 * Общие настройки портала (ключ-значение)
 */
export const portalConfig = pgTable(
  'portal_config',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Ключ настройки (с namespace для модулей)
    key: varchar('key', { length: 255 }).notNull(), // "crm.pipeline_default", "ai.model_default"

    // Значение
    value: jsonb('value'),

    // Тип значения (для валидации)
    valueType: varchar('value_type', { length: 20 }).default('string'), // string, number, boolean, json

    // Описание
    description: text('description'),

    // Можно ли изменять через UI
    isEditable: boolean('is_editable').default(true),

    // Кто изменил последний раз
    updatedBy: uuid('updated_by').references(() => users.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalKeyIdx: index('portal_config_portal_key_idx').on(
      table.portalId,
      table.key
    ),
  })
);

/**
 * Файлы и вложения
 * Централизованное хранение информации о файлах
 */
export const files = pgTable(
  'files',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Кто загрузил
    uploadedBy: uuid('uploaded_by').references(() => users.id),

    // Информация о файле
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }),
    mimeType: varchar('mime_type', { length: 100 }),
    size: varchar('size', { length: 20 }), // Размер в байтах (строка для больших файлов)

    // Хранилище
    storageProvider: varchar('storage_provider', { length: 20 }).default('s3'), // s3, gcs, local
    storagePath: text('storage_path').notNull(), // Путь в хранилище
    publicUrl: text('public_url'), // Публичный URL (если есть)

    // Привязка к объекту
    moduleId: varchar('module_id', { length: 50 }),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),

    // Метаданные
    metadata: jsonb('metadata').$type<{
      width?: number;
      height?: number;
      duration?: number; // Для видео/аудио
      thumbnailUrl?: string;
      [key: string]: unknown;
    }>(),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, deleted, processing

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('files_portal_id_idx').on(table.portalId),
    uploadedByIdx: index('files_uploaded_by_idx').on(table.uploadedBy),
    entityIdx: index('files_entity_idx').on(table.entityType, table.entityId),
    statusIdx: index('files_status_idx').on(table.status),
  })
);

/**
 * Webhook конфигурации
 * Для интеграций с внешними системами
 */
export const webhooks = pgTable(
  'webhooks',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Название и описание
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // URL webhook
    url: text('url').notNull(),

    // Секретный ключ для подписи
    secret: varchar('secret', { length: 255 }),

    // События, на которые подписан
    events: jsonb('events').$type<string[]>().notNull(), // ['deal.created', 'contact.updated', etc.]

    // Модуль
    moduleId: varchar('module_id', { length: 50 }), // NULL = все модули

    // Заголовки для запроса
    headers: jsonb('headers').$type<Record<string, string>>(),

    // Статус
    isActive: boolean('is_active').default(true),

    // Статистика
    lastTriggeredAt: timestamp('last_triggered_at'),
    successCount: varchar('success_count', { length: 20 }).default('0'),
    failureCount: varchar('failure_count', { length: 20 }).default('0'),

    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('webhooks_portal_id_idx').on(table.portalId),
    isActiveIdx: index('webhooks_is_active_idx').on(table.isActive),
  })
);

/**
 * Логи webhook вызовов
 */
export const webhookLogs = pgTable(
  'webhook_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    webhookId: uuid('webhook_id')
      .notNull()
      .references(() => webhooks.id, { onDelete: 'cascade' }),

    // Событие
    event: varchar('event', { length: 100 }).notNull(),

    // Запрос
    requestBody: jsonb('request_body'),
    requestHeaders: jsonb('request_headers'),

    // Ответ
    responseStatus: varchar('response_status', { length: 10 }),
    responseBody: text('response_body'),
    responseTime: varchar('response_time', { length: 20 }), // Время ответа в мс

    // Статус
    status: varchar('status', { length: 20 }).notNull(), // success, failed, timeout

    // Ошибка
    errorMessage: text('error_message'),

    // Попытки
    attempt: varchar('attempt', { length: 10 }).default('1'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    webhookIdIdx: index('webhook_logs_webhook_id_idx').on(table.webhookId),
    statusIdx: index('webhook_logs_status_idx').on(table.status),
    createdAtIdx: index('webhook_logs_created_at_idx').on(table.createdAt),
  })
);

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type PortalConfig = typeof portalConfig.$inferSelect;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
