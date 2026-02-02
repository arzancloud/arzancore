import type { ArzanModule, RegisteredModule, ModuleContext } from './types';

/**
 * Реестр модулей
 * Singleton для управления всеми зарегистрированными модулями
 */
class ModuleRegistry {
  private modules: Map<string, RegisteredModule> = new Map();
  private activeModules: Set<string> = new Set();
  private context: ModuleContext | null = null;

  /**
   * Регистрация модуля
   */
  register(module: ArzanModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} is already registered`);
      return;
    }

    const registered: RegisteredModule = {
      ...module,
      isActive: false,
      installedAt: new Date(),
    };

    this.modules.set(module.id, registered);
  }

  /**
   * Получение модуля по ID
   */
  get(moduleId: string): RegisteredModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Получение всех модулей
   */
  getAll(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Получение активных модулей
   */
  getActive(): RegisteredModule[] {
    return this.getAll().filter((m) => m.isActive);
  }

  /**
   * Получение модулей по категории
   */
  getByCategory(category: ArzanModule['category']): RegisteredModule[] {
    return this.getAll().filter((m) => m.category === category);
  }

  /**
   * Активация модуля
   */
  async activate(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Проверка зависимостей
    if (module.dependencies) {
      for (const depId of module.dependencies) {
        const dep = this.modules.get(depId);
        if (!dep?.isActive) {
          throw new Error(
            `Module ${moduleId} requires ${depId} to be active`
          );
        }
      }
    }

    // Вызов setup hook
    if (module.setup && this.context) {
      await module.setup(this.context);
    }

    module.isActive = true;
    this.activeModules.add(moduleId);
  }

  /**
   * Деактивация модуля
   */
  async deactivate(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Проверка что никто не зависит от этого модуля
    const dependents = this.getAll().filter(
      (m) => m.isActive && m.dependencies?.includes(moduleId)
    );
    if (dependents.length > 0) {
      throw new Error(
        `Cannot deactivate ${moduleId}, modules depend on it: ${dependents.map((d) => d.id).join(', ')}`
      );
    }

    // Вызов teardown hook
    if (module.teardown && this.context) {
      await module.teardown(this.context);
    }

    module.isActive = false;
    this.activeModules.delete(moduleId);
  }

  /**
   * Установка контекста
   */
  setContext(context: ModuleContext): void {
    this.context = context;
  }

  /**
   * Получение всех роутов активных модулей
   */
  getRoutes() {
    return this.getActive().flatMap((m) => m.routes);
  }

  /**
   * Получение всех пунктов меню активных модулей
   */
  getMenuItems() {
    return this.getActive()
      .flatMap((m) => m.menuItems)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /**
   * Получение всех виджетов активных модулей
   */
  getWidgets() {
    return this.getActive().flatMap((m) => m.widgets ?? []);
  }

  /**
   * Получение настроек модуля
   */
  getSettings(moduleId: string) {
    return this.modules.get(moduleId)?.settings ?? [];
  }

  /**
   * Проверка доступности модуля (зависимости)
   */
  canActivate(moduleId: string): { can: boolean; missing: string[] } {
    const module = this.modules.get(moduleId);
    if (!module) {
      return { can: false, missing: [] };
    }

    const missing = (module.dependencies ?? []).filter(
      (depId) => !this.modules.get(depId)?.isActive
    );

    return { can: missing.length === 0, missing };
  }

  /**
   * Очистка реестра
   */
  clear(): void {
    this.modules.clear();
    this.activeModules.clear();
    this.context = null;
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry();

// Export class for testing
export { ModuleRegistry };
