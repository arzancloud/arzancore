/**
 * Типы для API клиента
 */

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  surname?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User types
export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  surname?: string;
  avatar?: string;
  emailVerified: boolean;
  locale: string;
  timezone: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  surname?: string;
  phone?: string;
  avatar?: string;
  locale?: string;
  timezone?: string;
}

// Portal types
export interface Portal {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  logo?: string;
  status: 'active' | 'trial' | 'suspended' | 'deleted';
  settings?: PortalSettings;
  trialEndsAt?: string;
  createdAt: string;
}

export interface PortalSettings {
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
}

export interface CreatePortalRequest {
  name: string;
  subdomain: string;
  settings?: PortalSettings;
}

export interface UpdatePortalRequest {
  name?: string;
  logo?: string;
  settings?: PortalSettings;
}

// Portal Member types
export interface PortalMember {
  id: string;
  userId: string;
  portalId: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'suspended';
  user?: User;
  joinedAt?: string;
}

export interface InviteMemberRequest {
  email: string;
  role?: 'admin' | 'member';
}

// Module types
export interface AvailableModule {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  category: 'product' | 'addon' | 'integration';
  icon?: string;
  logo?: string;
  isBaseProduct: boolean;
  features?: ModuleFeature[];
  isActive: boolean;
  isBeta: boolean;
  isComingSoon: boolean;
}

export interface ModuleFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ModulePlan {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  limits?: Record<string, number>;
  features?: string[];
  isPopular: boolean;
}

export interface PortalModule {
  id: string;
  portalId: string;
  moduleId: string;
  planId?: string;
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  trialEndsAt?: string;
  activatedAt?: string;
}

export interface ActivateModuleRequest {
  moduleId: string;
  planId: string;
}

// Access check types
export interface AccessCheckRequest {
  portalId: string;
  moduleId: string;
}

export interface AccessCheckResponse {
  allowed: boolean;
  reason?: string;
  code?: string;
  context?: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
    portal: {
      id: string;
      name: string;
      subdomain: string;
      status: string;
    };
    employee?: {
      id: string;
      position?: string;
      departmentId?: string;
    };
    role: {
      code: string;
      permissions: Record<string, string[]>;
    };
    module: {
      id: string;
      status: string;
      planId?: string;
    };
    limits: Record<string, number>;
    usage: Record<string, number>;
  };
}

// Employee types
export interface Employee {
  id: string;
  portalId: string;
  userId?: string;
  departmentId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  status: 'active' | 'vacation' | 'sick_leave' | 'fired' | 'suspended';
  hireDate?: string;
  avatar?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  departmentId?: string;
  hireDate?: string;
}

// Department types
export interface Department {
  id: string;
  portalId: string;
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  level: number;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

// Role types
export interface Role {
  id: string;
  portalId: string;
  name: string;
  description?: string;
  code?: string;
  permissions: Record<string, string[]>;
  isSystem: boolean;
  color?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  code?: string;
  permissions: Record<string, string[]>;
  color?: string;
}

// Subscription types
export interface Subscription {
  id: string;
  portalId: string;
  moduleId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  billingInterval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Billing types
export interface Invoice {
  id: string;
  portalId: string;
  number?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  currency: string;
  periodStart?: string;
  periodEnd?: string;
  paidAt?: string;
  invoicePdf?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
