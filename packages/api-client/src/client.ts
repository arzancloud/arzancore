/**
 * Arzan API Client
 * Типизированный клиент для работы с Core API
 */

import { ApiError, NetworkError } from './errors';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  User,
  UpdateUserRequest,
  Portal,
  CreatePortalRequest,
  UpdatePortalRequest,
  PortalMember,
  InviteMemberRequest,
  AvailableModule,
  ModulePlan,
  PortalModule,
  ActivateModuleRequest,
  AccessCheckRequest,
  AccessCheckResponse,
  Employee,
  CreateEmployeeRequest,
  Department,
  CreateDepartmentRequest,
  Role,
  CreateRoleRequest,
  Subscription,
  Invoice,
  PaymentMethod,
  PaginatedResponse,
  PaginationParams,
} from './types';

export interface ApiClientConfig {
  /** Base URL of the Core API */
  baseUrl: string;
  /** Access token (JWT) */
  accessToken?: string;
  /** Refresh token for auto-refresh */
  refreshToken?: string;
  /** Current portal ID */
  portalId?: string;
  /** Callback when tokens are refreshed */
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => void;
  /** Callback when authentication fails */
  onAuthError?: (error: ApiError) => void;
  /** Request timeout in ms */
  timeout?: number;
}

export class ApiClient {
  private config: ApiClientConfig;
  private refreshPromise: Promise<AuthResponse> | null = null;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  // ===== Configuration =====

  setAccessToken(token: string) {
    this.config.accessToken = token;
  }

  setRefreshToken(token: string) {
    this.config.refreshToken = token;
  }

  setPortalId(portalId: string) {
    this.config.portalId = portalId;
  }

  getPortalId(): string | undefined {
    return this.config.portalId;
  }

  // ===== HTTP Methods =====

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | undefined>;
      headers?: Record<string, string>;
      skipAuth?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<T> {
    const { body, params, headers = {}, skipAuth = false, retry = true } = options;

    // Build URL with query params
    let url = `${this.config.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (!skipAuth && this.config.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    if (this.config.portalId) {
      requestHeaders['X-Portal-Id'] = this.config.portalId;
    }

    // Make request
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 - try to refresh token
      if (response.status === 401 && retry && this.config.refreshToken) {
        await this.refreshTokens();
        return this.request<T>(method, path, { ...options, retry: false });
      }

      // Parse response
      let responseBody: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const error = ApiError.fromResponse(response, responseBody);
        if (response.status === 401) {
          this.config.onAuthError?.(error);
        }
        throw error;
      }

      return responseBody as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }
      throw new NetworkError('Unknown error');
    }
  }

  private get<T>(path: string, params?: Record<string, string | number | undefined>) {
    return this.request<T>('GET', path, { params });
  }

  private post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, { body });
  }

  private patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, { body });
  }

  private put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, { body });
  }

  private delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }

  // ===== Auth =====

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('POST', '/api/auth/login', {
      body: data,
      skipAuth: true,
    });
    this.config.accessToken = response.tokens.accessToken;
    this.config.refreshToken = response.tokens.refreshToken;
    this.config.onTokenRefresh?.(response.tokens);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('POST', '/api/auth/register', {
      body: data,
      skipAuth: true,
    });
    this.config.accessToken = response.tokens.accessToken;
    this.config.refreshToken = response.tokens.refreshToken;
    this.config.onTokenRefresh?.(response.tokens);
    return response;
  }

  async refreshTokens(): Promise<AuthResponse> {
    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.request<AuthResponse>('POST', '/api/auth/refresh', {
      body: { refreshToken: this.config.refreshToken },
      skipAuth: true,
      retry: false,
    });

    try {
      const response = await this.refreshPromise;
      this.config.accessToken = response.tokens.accessToken;
      this.config.refreshToken = response.tokens.refreshToken;
      this.config.onTokenRefresh?.(response.tokens);
      return response;
    } finally {
      this.refreshPromise = null;
    }
  }

  async logout(): Promise<void> {
    await this.post('/api/auth/logout');
    this.config.accessToken = undefined;
    this.config.refreshToken = undefined;
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/auth/me');
  }

  // ===== User Profile =====

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return this.patch<User>('/api/users/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.post('/api/users/change-password', { currentPassword, newPassword });
  }

  // ===== Portals =====

  async getPortals(): Promise<Portal[]> {
    return this.get<Portal[]>('/api/portals');
  }

  async getPortal(portalId: string): Promise<Portal> {
    return this.get<Portal>(`/api/portals/${portalId}`);
  }

  async createPortal(data: CreatePortalRequest): Promise<Portal> {
    return this.post<Portal>('/api/portals', data);
  }

  async updatePortal(portalId: string, data: UpdatePortalRequest): Promise<Portal> {
    return this.patch<Portal>(`/api/portals/${portalId}`, data);
  }

  async deletePortal(portalId: string): Promise<void> {
    await this.delete(`/api/portals/${portalId}`);
  }

  // ===== Portal Members =====

  async getPortalMembers(portalId: string): Promise<PortalMember[]> {
    return this.get<PortalMember[]>(`/api/portals/${portalId}/members`);
  }

  async inviteMember(portalId: string, data: InviteMemberRequest): Promise<PortalMember> {
    return this.post<PortalMember>(`/api/portals/${portalId}/invite`, data);
  }

  async removeMember(portalId: string, memberId: string): Promise<void> {
    await this.delete(`/api/portals/${portalId}/members/${memberId}`);
  }

  async updateMemberRole(portalId: string, memberId: string, role: string): Promise<PortalMember> {
    return this.patch<PortalMember>(`/api/portals/${portalId}/members/${memberId}`, { role });
  }

  // ===== Modules =====

  async getAvailableModules(): Promise<AvailableModule[]> {
    return this.get<AvailableModule[]>('/api/modules');
  }

  async getModulePlans(moduleId: string): Promise<ModulePlan[]> {
    return this.get<ModulePlan[]>(`/api/modules/${moduleId}/plans`);
  }

  async getPortalModules(portalId: string): Promise<PortalModule[]> {
    return this.get<PortalModule[]>(`/api/portals/${portalId}/modules`);
  }

  async activateModule(portalId: string, data: ActivateModuleRequest): Promise<PortalModule> {
    return this.post<PortalModule>(`/api/portals/${portalId}/modules`, data);
  }

  async deactivateModule(portalId: string, moduleId: string): Promise<void> {
    await this.delete(`/api/portals/${portalId}/modules/${moduleId}`);
  }

  // ===== Access Check =====

  async checkAccess(data: AccessCheckRequest): Promise<AccessCheckResponse> {
    return this.post<AccessCheckResponse>('/api/access/check', data);
  }

  // ===== Employees =====

  async getEmployees(params?: PaginationParams): Promise<PaginatedResponse<Employee>> {
    return this.get<PaginatedResponse<Employee>>('/api/employees', params as any);
  }

  async getEmployee(employeeId: string): Promise<Employee> {
    return this.get<Employee>(`/api/employees/${employeeId}`);
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    return this.post<Employee>('/api/employees', data);
  }

  async updateEmployee(employeeId: string, data: Partial<CreateEmployeeRequest>): Promise<Employee> {
    return this.patch<Employee>(`/api/employees/${employeeId}`, data);
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    await this.delete(`/api/employees/${employeeId}`);
  }

  // ===== Departments =====

  async getDepartments(): Promise<Department[]> {
    return this.get<Department[]>('/api/departments');
  }

  async getDepartment(departmentId: string): Promise<Department> {
    return this.get<Department>(`/api/departments/${departmentId}`);
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    return this.post<Department>('/api/departments', data);
  }

  async updateDepartment(departmentId: string, data: Partial<CreateDepartmentRequest>): Promise<Department> {
    return this.patch<Department>(`/api/departments/${departmentId}`, data);
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    await this.delete(`/api/departments/${departmentId}`);
  }

  // ===== Roles =====

  async getRoles(): Promise<Role[]> {
    return this.get<Role[]>('/api/roles');
  }

  async getRole(roleId: string): Promise<Role> {
    return this.get<Role>(`/api/roles/${roleId}`);
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.post<Role>('/api/roles', data);
  }

  async updateRole(roleId: string, data: Partial<CreateRoleRequest>): Promise<Role> {
    return this.patch<Role>(`/api/roles/${roleId}`, data);
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.delete(`/api/roles/${roleId}`);
  }

  // ===== Subscriptions =====

  async getSubscriptions(portalId: string): Promise<Subscription[]> {
    return this.get<Subscription[]>(`/api/portals/${portalId}/subscriptions`);
  }

  async cancelSubscription(portalId: string, subscriptionId: string): Promise<Subscription> {
    return this.post<Subscription>(`/api/portals/${portalId}/subscriptions/${subscriptionId}/cancel`);
  }

  // ===== Invoices =====

  async getInvoices(portalId: string, params?: PaginationParams): Promise<PaginatedResponse<Invoice>> {
    return this.get<PaginatedResponse<Invoice>>(`/api/portals/${portalId}/invoices`, params as any);
  }

  async getInvoice(portalId: string, invoiceId: string): Promise<Invoice> {
    return this.get<Invoice>(`/api/portals/${portalId}/invoices/${invoiceId}`);
  }

  // ===== Payment Methods =====

  async getPaymentMethods(portalId: string): Promise<PaymentMethod[]> {
    return this.get<PaymentMethod[]>(`/api/portals/${portalId}/payment-methods`);
  }

  async setDefaultPaymentMethod(portalId: string, paymentMethodId: string): Promise<PaymentMethod> {
    return this.post<PaymentMethod>(`/api/portals/${portalId}/payment-methods/${paymentMethodId}/default`);
  }

  async deletePaymentMethod(portalId: string, paymentMethodId: string): Promise<void> {
    await this.delete(`/api/portals/${portalId}/payment-methods/${paymentMethodId}`);
  }
}

/**
 * Создание экземпляра API клиента
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
