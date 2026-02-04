import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { portals } from './portals';

/**
 * Отделы компании
 * Иерархическая структура с поддержкой вложенности
 */
export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Название и описание
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    code: varchar('code', { length: 50 }), // Код отдела (например, "IT", "HR")

    // Иерархия (для вложенных отделов)
    parentId: uuid('parent_id'),
    path: text('path'), // Materialized path: "parent_id/child_id/grandchild_id"
    level: integer('level').default(0), // Уровень вложенности

    // Руководитель отдела
    managerId: uuid('manager_id'),

    // Настройки
    settings: jsonb('settings').$type<{
      color?: string;
      icon?: string;
      isHidden?: boolean;
    }>(),

    // Порядок отображения
    sortOrder: integer('sort_order').default(0),

    // Статус
    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('departments_portal_id_idx').on(table.portalId),
    parentIdIdx: index('departments_parent_id_idx').on(table.parentId),
    pathIdx: index('departments_path_idx').on(table.path),
    codeIdx: index('departments_code_idx').on(table.portalId, table.code),
  })
);

/**
 * Сотрудники
 * Связь пользователя с порталом как сотрудника
 */
export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Связь с пользователем (может быть NULL для внешних сотрудников)
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

    // Отдел
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),

    // Личные данные (дублируем из users для гибкости)
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }),
    middleName: varchar('middle_name', { length: 255 }),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    avatar: text('avatar'),

    // Рабочая информация
    position: varchar('position', { length: 255 }), // Должность
    employeeNumber: varchar('employee_number', { length: 50 }), // Табельный номер
    hireDate: timestamp('hire_date'),
    fireDate: timestamp('fire_date'),
    birthDate: timestamp('birth_date'),

    // Контактная информация
    workPhone: varchar('work_phone', { length: 20 }),
    workEmail: varchar('work_email', { length: 255 }),
    internalNumber: varchar('internal_number', { length: 20 }), // Внутренний номер

    // Дополнительная информация
    bio: text('bio'),
    skills: jsonb('skills').$type<string[]>(),

    // Документы
    documents: jsonb('documents').$type<
      Array<{
        type: string; // passport, contract, etc.
        number: string;
        issuedAt?: string;
        expiresAt?: string;
        fileUrl?: string;
      }>
    >(),

    // Настройки
    settings: jsonb('settings').$type<Record<string, unknown>>(),

    // Тип занятости
    employmentType: varchar('employment_type', { length: 50 }).default('full_time'), // full_time, part_time, contract, intern

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, vacation, sick_leave, fired, suspended

    // Метаданные
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('employees_portal_id_idx').on(table.portalId),
    userIdIdx: index('employees_user_id_idx').on(table.userId),
    departmentIdIdx: index('employees_department_id_idx').on(table.departmentId),
    statusIdx: index('employees_status_idx').on(table.status),
    portalUserIdx: uniqueIndex('employees_portal_user_idx').on(
      table.portalId,
      table.userId
    ),
    employeeNumberIdx: index('employees_employee_number_idx').on(
      table.portalId,
      table.employeeNumber
    ),
  })
);

/**
 * Роли в портале
 * Кастомные роли с настраиваемыми правами
 */
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Название и описание
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    code: varchar('code', { length: 50 }), // Код роли (admin, manager, etc.)

    // Права доступа (разбиты по модулям)
    permissions: jsonb('permissions').$type<{
      // Общие права
      portal?: ('read' | 'write' | 'admin')[];
      settings?: ('read' | 'write')[];
      employees?: ('read' | 'write' | 'delete' | 'admin')[];
      roles?: ('read' | 'write' | 'delete')[];

      // Права по модулям
      crm?: ('read' | 'write' | 'delete' | 'admin')[];
      'ai-messenger'?: ('read' | 'write' | 'delete' | 'admin')[];
      stock?: ('read' | 'write' | 'delete' | 'admin')[];
      med?: ('read' | 'write' | 'delete' | 'admin')[];
      booking?: ('read' | 'write' | 'delete' | 'admin')[];
      shop?: ('read' | 'write' | 'delete' | 'admin')[];
      build?: ('read' | 'write' | 'delete' | 'admin')[];

      // Дополнительные модульные права
      [key: string]: string[] | undefined;
    }>(),

    // Это системная роль?
    isSystem: boolean('is_system').default(false), // owner, admin - системные, нельзя удалить

    // Приоритет (для определения главной роли)
    priority: integer('priority').default(0),

    // Цвет для отображения
    color: varchar('color', { length: 20 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('roles_portal_id_idx').on(table.portalId),
    codeIdx: uniqueIndex('roles_portal_code_idx').on(table.portalId, table.code),
    isSystemIdx: index('roles_is_system_idx').on(table.isSystem),
  })
);

/**
 * Связь пользователей и ролей
 * Один пользователь может иметь несколько ролей в портале
 */
export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    // Кто назначил
    assignedBy: uuid('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at').defaultNow(),

    // Срок действия (опционально)
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalUserRoleIdx: uniqueIndex('user_roles_portal_user_role_idx').on(
      table.portalId,
      table.userId,
      table.roleId
    ),
    userIdIdx: index('user_roles_user_id_idx').on(table.userId),
    roleIdIdx: index('user_roles_role_id_idx').on(table.roleId),
  })
);

/**
 * Права доступа (гранулярные)
 * Для более детальной настройки прав конкретного пользователя
 */
export const userPermissions = pgTable(
  'user_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Модуль
    moduleId: varchar('module_id', { length: 50 }), // NULL = общие права портала

    // Ресурс (например, конкретная воронка, склад и т.д.)
    resourceType: varchar('resource_type', { length: 50 }), // pipeline, warehouse, etc.
    resourceId: uuid('resource_id'),

    // Права
    permissions: jsonb('permissions').$type<string[]>().notNull(), // ['read', 'write', 'delete']

    // Кто выдал
    grantedBy: uuid('granted_by').references(() => users.id),
    grantedAt: timestamp('granted_at').defaultNow(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalUserIdx: index('user_permissions_portal_user_idx').on(
      table.portalId,
      table.userId
    ),
    resourceIdx: index('user_permissions_resource_idx').on(
      table.resourceType,
      table.resourceId
    ),
  })
);

// Types
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
