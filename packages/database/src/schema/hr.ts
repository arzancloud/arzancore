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
  time,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { portals } from './portals';
import { employees, departments } from './company';

/**
 * Настройки зарплаты сотрудника
 */
export const salarySettings = pgTable(
  'salary_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    // Базовая зарплата
    baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('KZT'),

    // Тип начисления
    salaryType: varchar('salary_type', { length: 20 }).default('monthly'), // monthly, hourly, daily

    // Бонусы
    bonusPercent: decimal('bonus_percent', { precision: 5, scale: 2 }).default('0'),
    bonusFixed: decimal('bonus_fixed', { precision: 12, scale: 2 }).default('0'),

    // Формула бонуса (если сложная)
    bonusFormula: jsonb('bonus_formula').$type<{
      type: 'percent_of_sales' | 'percent_of_deals' | 'fixed' | 'kpi_based' | 'custom';
      value?: number;
      conditions?: Array<{
        metric: string;
        operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
        value: number;
        bonus: number;
      }>;
    }>(),

    // Налоговые настройки
    taxSettings: jsonb('tax_settings').$type<{
      pensionPercent?: number; // ОПВ (Казахстан)
      socialTaxPercent?: number; // Социальный налог
      incomeTaxPercent?: number; // ИПН
      medicalPercent?: number; // ОСМС
      isContractor?: boolean; // ИП/самозанятый
    }>(),

    // Надбавки
    allowances: jsonb('allowances').$type<
      Array<{
        name: string;
        amount: number;
        type: 'fixed' | 'percent';
        isRecurring: boolean;
      }>
    >(),

    // Действует с/по
    effectiveFrom: timestamp('effective_from').notNull(),
    effectiveTo: timestamp('effective_to'),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('salary_settings_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('salary_settings_employee_id_idx').on(table.employeeId),
    effectiveIdx: index('salary_settings_effective_idx').on(
      table.effectiveFrom,
      table.effectiveTo
    ),
  })
);

/**
 * Расчёты зарплаты (история)
 */
export const salaryCalculations = pgTable(
  'salary_calculations',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    // Период
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    periodType: varchar('period_type', { length: 20 }).default('monthly'), // monthly, biweekly, weekly

    // Суммы
    baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).notNull(),
    bonus: decimal('bonus', { precision: 12, scale: 2 }).default('0'),
    allowances: decimal('allowances', { precision: 12, scale: 2 }).default('0'),
    deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0'),
    taxes: decimal('taxes', { precision: 12, scale: 2 }).default('0'),
    netSalary: decimal('net_salary', { precision: 12, scale: 2 }).notNull(),

    currency: varchar('currency', { length: 3 }).default('KZT'),

    // Детализация
    breakdown: jsonb('breakdown').$type<{
      workDays: number;
      workedDays: number;
      overtimeHours?: number;
      sickDays?: number;
      vacationDays?: number;

      bonusDetails?: Array<{
        name: string;
        amount: number;
        reason?: string;
      }>;

      deductionDetails?: Array<{
        name: string;
        amount: number;
        reason?: string;
      }>;

      taxDetails?: {
        pension?: number;
        socialTax?: number;
        incomeTax?: number;
        medical?: number;
      };
    }>(),

    // Статус
    status: varchar('status', { length: 20 }).default('draft'), // draft, approved, paid

    // Кто рассчитал/утвердил
    calculatedBy: uuid('calculated_by').references(() => users.id),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at'),
    paidAt: timestamp('paid_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('salary_calculations_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('salary_calculations_employee_id_idx').on(
      table.employeeId
    ),
    periodIdx: index('salary_calculations_period_idx').on(
      table.periodStart,
      table.periodEnd
    ),
    statusIdx: index('salary_calculations_status_idx').on(table.status),
  })
);

/**
 * KPI метрики (определения)
 */
export const kpiMetrics = pgTable(
  'kpi_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Название и описание
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    code: varchar('code', { length: 50 }), // deals_count, revenue, etc.

    // Категория
    category: varchar('category', { length: 50 }), // sales, support, hr, etc.

    // Тип метрики
    metricType: varchar('metric_type', { length: 20 }).notNull(), // number, currency, percent, time

    // Модуль, к которому относится (для автоматического расчёта)
    moduleId: varchar('module_id', { length: 50 }), // crm, ai-messenger, etc.

    // Формула расчёта (если автоматическая)
    calculationFormula: jsonb('calculation_formula').$type<{
      type: 'manual' | 'auto';
      source?: string; // deals, contacts, messages, etc.
      aggregation?: 'count' | 'sum' | 'avg';
      field?: string; // amount, price, etc.
      filters?: Record<string, unknown>;
    }>(),

    // Единица измерения
    unit: varchar('unit', { length: 50 }), // шт, ₸, %, часы

    // Цель по умолчанию
    defaultTarget: decimal('default_target', { precision: 12, scale: 2 }),

    // Направление (больше = лучше или меньше = лучше)
    direction: varchar('direction', { length: 10 }).default('up'), // up, down

    // Веса для общего рейтинга
    weight: decimal('weight', { precision: 5, scale: 2 }).default('1'),

    // Порядок отображения
    sortOrder: integer('sort_order').default(0),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('kpi_metrics_portal_id_idx').on(table.portalId),
    codeIdx: uniqueIndex('kpi_metrics_portal_code_idx').on(
      table.portalId,
      table.code
    ),
    categoryIdx: index('kpi_metrics_category_idx').on(table.category),
    moduleIdIdx: index('kpi_metrics_module_id_idx').on(table.moduleId),
  })
);

/**
 * KPI цели для сотрудников
 */
export const employeeKpiTargets = pgTable(
  'employee_kpi_targets',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    metricId: uuid('metric_id')
      .notNull()
      .references(() => kpiMetrics.id, { onDelete: 'cascade' }),

    // Период
    periodType: varchar('period_type', { length: 20 }).notNull(), // monthly, quarterly, yearly
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),

    // Цель
    targetValue: decimal('target_value', { precision: 12, scale: 2 }).notNull(),

    // Текущее значение (обновляется автоматически или вручную)
    currentValue: decimal('current_value', { precision: 12, scale: 2 }).default('0'),

    // Процент выполнения
    progressPercent: decimal('progress_percent', { precision: 5, scale: 2 }).default('0'),

    // Статус
    status: varchar('status', { length: 20 }).default('active'), // active, completed, failed

    // Комментарии
    notes: text('notes'),

    // Последнее обновление значения
    lastCalculatedAt: timestamp('last_calculated_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('employee_kpi_targets_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('employee_kpi_targets_employee_id_idx').on(
      table.employeeId
    ),
    metricIdIdx: index('employee_kpi_targets_metric_id_idx').on(table.metricId),
    periodIdx: index('employee_kpi_targets_period_idx').on(
      table.periodStart,
      table.periodEnd
    ),
    uniqueTargetIdx: uniqueIndex('employee_kpi_targets_unique_idx').on(
      table.employeeId,
      table.metricId,
      table.periodStart
    ),
  })
);

/**
 * Рабочие графики
 */
export const workSchedules = pgTable(
  'work_schedules',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    // Название графика
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // Тип графика
    scheduleType: varchar('schedule_type', { length: 20 }).default('weekly'), // weekly, shift, flexible

    // Часовой пояс
    timezone: varchar('timezone', { length: 50 }).default('Asia/Almaty'),

    // Рабочие часы по дням недели
    weeklySchedule: jsonb('weekly_schedule').$type<{
      monday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      tuesday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      wednesday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      thursday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      friday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      saturday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
      sunday?: { start: string; end: string; breakStart?: string; breakEnd?: string };
    }>(),

    // Для сменных графиков
    shiftPattern: jsonb('shift_pattern').$type<{
      workDays: number;
      offDays: number;
      shifts: Array<{
        name: string;
        start: string;
        end: string;
      }>;
    }>(),

    // Норма часов в месяц
    monthlyHoursTarget: integer('monthly_hours_target'),

    // Это график по умолчанию?
    isDefault: boolean('is_default').default(false),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('work_schedules_portal_id_idx').on(table.portalId),
    isDefaultIdx: index('work_schedules_is_default_idx').on(
      table.portalId,
      table.isDefault
    ),
  })
);

/**
 * Привязка графика к сотруднику
 */
export const employeeSchedules = pgTable(
  'employee_schedules',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => workSchedules.id, { onDelete: 'cascade' }),

    // Действует с/по
    effectiveFrom: timestamp('effective_from').notNull(),
    effectiveTo: timestamp('effective_to'),

    // Кастомные настройки для этого сотрудника
    customSettings: jsonb('custom_settings').$type<{
      // Переопределение рабочих часов
      overrides?: Record<string, { start: string; end: string }>;
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('employee_schedules_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('employee_schedules_employee_id_idx').on(
      table.employeeId
    ),
    scheduleIdIdx: index('employee_schedules_schedule_id_idx').on(
      table.scheduleId
    ),
  })
);

/**
 * Учёт рабочего времени
 */
export const workTimeLogs = pgTable(
  'work_time_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    // Дата
    date: timestamp('date').notNull(),

    // Время прихода/ухода
    clockIn: timestamp('clock_in'),
    clockOut: timestamp('clock_out'),

    // Перерывы
    breaks: jsonb('breaks').$type<
      Array<{
        start: string;
        end: string;
        type?: 'lunch' | 'short' | 'other';
      }>
    >(),

    // Отработано часов
    workedHours: decimal('worked_hours', { precision: 5, scale: 2 }),
    overtimeHours: decimal('overtime_hours', { precision: 5, scale: 2 }).default('0'),

    // Тип дня
    dayType: varchar('day_type', { length: 20 }).default('work'), // work, day_off, vacation, sick, holiday

    // Комментарии
    notes: text('notes'),

    // Источник данных
    source: varchar('source', { length: 20 }).default('manual'), // manual, auto, import

    // Утверждено?
    isApproved: boolean('is_approved').default(false),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('work_time_logs_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('work_time_logs_employee_id_idx').on(table.employeeId),
    dateIdx: index('work_time_logs_date_idx').on(table.date),
    employeeDateIdx: uniqueIndex('work_time_logs_employee_date_idx').on(
      table.employeeId,
      table.date
    ),
  })
);

/**
 * Заявки на отпуск/больничный
 */
export const leaveRequests = pgTable(
  'leave_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    portalId: uuid('portal_id')
      .notNull()
      .references(() => portals.id, { onDelete: 'cascade' }),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

    // Тип отпуска
    leaveType: varchar('leave_type', { length: 20 }).notNull(), // vacation, sick, personal, maternity, unpaid

    // Даты
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    totalDays: integer('total_days').notNull(),

    // Причина
    reason: text('reason'),

    // Документы (больничный лист и т.д.)
    documents: jsonb('documents').$type<
      Array<{
        name: string;
        url: string;
        type?: string;
      }>
    >(),

    // Статус
    status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected, canceled

    // Кто обработал
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at'),
    reviewComment: text('review_comment'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    portalIdIdx: index('leave_requests_portal_id_idx').on(table.portalId),
    employeeIdIdx: index('leave_requests_employee_id_idx').on(table.employeeId),
    statusIdx: index('leave_requests_status_idx').on(table.status),
    dateIdx: index('leave_requests_date_idx').on(table.startDate, table.endDate),
  })
);

// Types
export type SalarySettings = typeof salarySettings.$inferSelect;
export type NewSalarySettings = typeof salarySettings.$inferInsert;
export type SalaryCalculation = typeof salaryCalculations.$inferSelect;
export type NewSalaryCalculation = typeof salaryCalculations.$inferInsert;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type NewKpiMetric = typeof kpiMetrics.$inferInsert;
export type EmployeeKpiTarget = typeof employeeKpiTargets.$inferSelect;
export type NewEmployeeKpiTarget = typeof employeeKpiTargets.$inferInsert;
export type WorkSchedule = typeof workSchedules.$inferSelect;
export type NewWorkSchedule = typeof workSchedules.$inferInsert;
export type EmployeeSchedule = typeof employeeSchedules.$inferSelect;
export type WorkTimeLog = typeof workTimeLogs.$inferSelect;
export type NewWorkTimeLog = typeof workTimeLogs.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
