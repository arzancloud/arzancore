import type { ComponentType, ReactNode } from 'react';

/**
 * Определение роута модуля
 */
export interface ModuleRoute {
  path: string;
  component: ComponentType<any>;
  exact?: boolean;
  layout?: ComponentType<{ children: ReactNode }>;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    permissions?: string[];
  };
}

/**
 * Пункт меню модуля
 */
export interface ModuleMenuItem {
  id: string;
  icon: string | ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string | number;
  children?: ModuleMenuItem[];
  permissions?: string[];
  order?: number;
}

/**
 * Настройка модуля
 */
export interface ModuleSetting {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Интеграция с другим модулем
 */
export interface ModuleIntegration {
  moduleId: string;
  hooks?: {
    onEvent?: (event: ModuleEvent) => void | Promise<void>;
    onDataSync?: (data: unknown) => void | Promise<void>;
  };
  components?: {
    [slot: string]: ComponentType<any>;
  };
}

/**
 * Событие модуля
 */
export interface ModuleEvent {
  type: string;
  moduleId: string;
  payload: unknown;
  timestamp: Date;
}

/**
 * Контекст портала для модуля
 */
export interface ModuleContext {
  portalId: string;
  portalSubdomain: string;
  userId: string;
  userRole: string;
  locale: string;
  settings: Record<string, unknown>;
  emit: (event: Omit<ModuleEvent, 'timestamp'>) => void;
}

/**
 * Определение модуля (продукта)
 */
export interface ArzanModule {
  // Идентификация
  id: string;
  name: string;
  description?: string;
  version: string;
  icon?: string | ComponentType<{ className?: string }>;
  logo?: string;

  // Категория
  category: 'product' | 'addon' | 'integration';

  // UI
  routes: ModuleRoute[];
  menuItems: ModuleMenuItem[];
  settings?: ModuleSetting[];

  // Widgets для dashboard
  widgets?: Array<{
    id: string;
    component: ComponentType<any>;
    title: string;
    defaultSize?: { width: number; height: number };
  }>;

  // Зависимости
  dependencies?: string[];

  // Интеграции с другими модулями
  integrations?: Record<string, ModuleIntegration>;

  // Lifecycle hooks
  setup?: (context: ModuleContext) => void | Promise<void>;
  teardown?: (context: ModuleContext) => void | Promise<void>;

  // Permissions
  permissions?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

/**
 * Зарегистрированный модуль с метаданными
 */
export interface RegisteredModule extends ArzanModule {
  isActive: boolean;
  installedAt?: Date;
  config?: Record<string, unknown>;
}

/**
 * Определение модуля (хелпер для создания)
 */
export function defineModule(module: ArzanModule): ArzanModule {
  return module;
}
