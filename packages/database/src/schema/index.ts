// Users & Auth
export {
  users,
  sessions,
  oauthAccounts,
  verificationTokens,
  type User,
  type NewUser,
  type Session,
  type NewSession,
  type OAuthAccount,
  type VerificationToken,
} from './users';

// Portals (Tenants)
export {
  portals,
  portalMembers,
  portalInvitations,
  portalSettings,
  type Portal,
  type NewPortal,
  type PortalMember,
  type NewPortalMember,
  type PortalInvitation,
  type PortalSettings,
} from './portals';

// Modules & Products
export {
  availableModules,
  modulePlans,
  moduleAddons,
  portalModules,
  portalAddons,
  portalLimits,
  type AvailableModule,
  type ModulePlan,
  type ModuleAddon,
  type PortalModule,
  type NewPortalModule,
  type PortalAddon,
  type PortalLimits,
} from './modules';

// Billing
export {
  subscriptions,
  paymentMethods,
  invoices,
  payments,
  usageRecords,
  promoCodes,
  promoCodeRedemptions,
  type Subscription,
  type NewSubscription,
  type PaymentMethod,
  type Invoice,
  type Payment,
  type UsageRecord,
  type PromoCode,
} from './billing';

// Company Structure
export {
  departments,
  employees,
  roles,
  userRoles,
  userPermissions,
  type Department,
  type NewDepartment,
  type Employee,
  type NewEmployee,
  type Role,
  type NewRole,
  type UserRole,
  type NewUserRole,
  type UserPermission,
  type NewUserPermission,
} from './company';

// HR (Salary, KPI, Schedules)
export {
  salarySettings,
  salaryCalculations,
  kpiMetrics,
  employeeKpiTargets,
  workSchedules,
  employeeSchedules,
  workTimeLogs,
  leaveRequests,
  type SalarySettings,
  type NewSalarySettings,
  type SalaryCalculation,
  type NewSalaryCalculation,
  type KpiMetric,
  type NewKpiMetric,
  type EmployeeKpiTarget,
  type NewEmployeeKpiTarget,
  type WorkSchedule,
  type NewWorkSchedule,
  type EmployeeSchedule,
  type WorkTimeLog,
  type NewWorkTimeLog,
  type LeaveRequest,
  type NewLeaveRequest,
} from './hr';

// Common (Notifications, Activity Logs, Files)
export {
  notifications,
  notificationSettings,
  activityLogs,
  portalConfig,
  files,
  webhooks,
  webhookLogs,
  type Notification,
  type NewNotification,
  type NotificationSettings,
  type ActivityLog,
  type NewActivityLog,
  type PortalConfig,
  type File,
  type NewFile,
  type Webhook,
  type NewWebhook,
  type WebhookLog,
} from './common';
