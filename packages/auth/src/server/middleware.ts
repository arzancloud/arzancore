/**
 * Middleware для авторизации в модулях
 * Используется всеми продуктами платформы (CRM, AI Messenger, Stock, etc.)
 */

export interface ModuleAuthConfig {
  /** URL core-api */
  coreApiUrl: string;
  /** ID модуля (crm, ai-messenger, stock, etc.) */
  moduleId: string;
  /** Callback при успешной авторизации */
  onSuccess?: (context: AuthContext) => void | Promise<void>;
  /** Callback при ошибке авторизации */
  onAccessDenied?: (reason: string, code: string) => void | Response | Promise<void | Response>;
  /** Кэшировать результат проверки (секунды) */
  cacheTtl?: number;
}

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name?: string;
    surname?: string;
    avatar?: string;
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
}

export interface AccessCheckResponse {
  allowed: boolean;
  reason?: string;
  code?: string;
  context?: AuthContext;
}

/**
 * Проверка доступа через core-api
 */
export async function checkAccess(
  config: ModuleAuthConfig,
  token: string,
  portalId: string
): Promise<AccessCheckResponse> {
  try {
    const response = await fetch(`${config.coreApiUrl}/api/access/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Portal-Id': portalId,
      },
      body: JSON.stringify({
        portalId,
        moduleId: config.moduleId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { allowed: false, reason: 'Invalid or expired token', code: 'INVALID_TOKEN' };
      }
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        return {
          allowed: false,
          reason: data.reason || 'Access denied',
          code: data.code || 'ACCESS_DENIED'
        };
      }
      return { allowed: false, reason: 'Core API error', code: 'CORE_API_ERROR' };
    }

    const data = await response.json();
    return {
      allowed: data.allowed,
      reason: data.reason,
      code: data.code,
      context: data.context,
    };
  } catch (error) {
    console.error('Access check error:', error);
    return { allowed: false, reason: 'Failed to connect to core API', code: 'CONNECTION_ERROR' };
  }
}

/**
 * Создание middleware для Hono
 */
export function createHonoAuthMiddleware(config: ModuleAuthConfig) {
  return async (c: any, next: () => Promise<void>) => {
    // Получаем токен из заголовка
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = config.onAccessDenied?.('No authorization token provided', 'NO_TOKEN');
      if (response instanceof Response) return response;
      return c.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, 401);
    }

    const token = authHeader.substring(7);

    // Получаем portalId из заголовка или query
    const portalId = c.req.header('X-Portal-Id') || c.req.query('portalId');
    if (!portalId) {
      const response = config.onAccessDenied?.('No portal ID provided', 'NO_PORTAL');
      if (response instanceof Response) return response;
      return c.json({ error: 'Portal ID required', code: 'NO_PORTAL' }, 400);
    }

    // Проверяем доступ
    const result = await checkAccess(config, token, portalId);

    if (!result.allowed) {
      const response = config.onAccessDenied?.(result.reason || 'Access denied', result.code || 'ACCESS_DENIED');
      if (response instanceof Response) return response;
      return c.json({
        error: result.reason || 'Access denied',
        code: result.code || 'ACCESS_DENIED'
      }, 403);
    }

    // Добавляем контекст в request
    c.set('auth', result.context);
    c.set('user', result.context?.user);
    c.set('portal', result.context?.portal);
    c.set('employee', result.context?.employee);
    c.set('role', result.context?.role);
    c.set('limits', result.context?.limits);
    c.set('usage', result.context?.usage);

    // Вызываем callback
    await config.onSuccess?.(result.context!);

    await next();
  };
}

/**
 * Создание middleware для Express
 */
export function createExpressAuthMiddleware(config: ModuleAuthConfig) {
  return async (req: any, res: any, next: () => void) => {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', code: 'NO_TOKEN' });
    }

    const token = authHeader.substring(7);

    // Получаем portalId из заголовка или query
    const portalId = req.headers['x-portal-id'] || req.query.portalId;
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID required', code: 'NO_PORTAL' });
    }

    // Проверяем доступ
    const result = await checkAccess(config, token, portalId);

    if (!result.allowed) {
      return res.status(403).json({
        error: result.reason || 'Access denied',
        code: result.code || 'ACCESS_DENIED'
      });
    }

    // Добавляем контекст в request
    req.auth = result.context;
    req.user = result.context?.user;
    req.portal = result.context?.portal;
    req.employee = result.context?.employee;
    req.role = result.context?.role;
    req.limits = result.context?.limits;
    req.usage = result.context?.usage;

    // Вызываем callback
    await config.onSuccess?.(result.context!);

    next();
  };
}

/**
 * Helper: Проверка разрешения
 */
export function hasPermission(
  context: AuthContext,
  module: string,
  permission: string
): boolean {
  const permissions = context.role.permissions[module];
  if (!permissions) return false;
  return permissions.includes(permission) || permissions.includes('admin');
}

/**
 * Helper: Проверка лимита
 */
export function checkLimit(
  context: AuthContext,
  metric: string
): { allowed: boolean; current: number; limit: number; remaining: number } {
  const limit = context.limits[metric] ?? Infinity;
  const current = context.usage[metric] ?? 0;
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
}

/**
 * Helper: Middleware для проверки конкретного разрешения
 */
export function requirePermission(module: string, permission: string) {
  return async (c: any, next: () => Promise<void>) => {
    const context = c.get('auth') as AuthContext;
    if (!context) {
      return c.json({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }, 401);
    }

    if (!hasPermission(context, module, permission)) {
      return c.json({
        error: `Permission denied: ${module}.${permission}`,
        code: 'PERMISSION_DENIED'
      }, 403);
    }

    await next();
  };
}

/**
 * Helper: Middleware для проверки лимита
 */
export function requireLimit(metric: string) {
  return async (c: any, next: () => Promise<void>) => {
    const context = c.get('auth') as AuthContext;
    if (!context) {
      return c.json({ error: 'Not authenticated', code: 'NOT_AUTHENTICATED' }, 401);
    }

    const check = checkLimit(context, metric);
    if (!check.allowed) {
      return c.json({
        error: `Limit exceeded: ${metric}`,
        code: 'LIMIT_EXCEEDED',
        current: check.current,
        limit: check.limit,
      }, 429);
    }

    await next();
  };
}
