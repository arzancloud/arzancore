import * as React from 'react';
import { moduleRegistry } from '../registry';
import type { RegisteredModule, ModuleMenuItem } from '../types';

/**
 * Hook для получения списка активных модулей
 */
export function useActiveModules(): RegisteredModule[] {
  const [modules, setModules] = React.useState<RegisteredModule[]>([]);

  React.useEffect(() => {
    setModules(moduleRegistry.getActive());
  }, []);

  return modules;
}

/**
 * Hook для получения конкретного модуля
 */
export function useModule(moduleId: string): RegisteredModule | undefined {
  const [module, setModule] = React.useState<RegisteredModule | undefined>();

  React.useEffect(() => {
    setModule(moduleRegistry.get(moduleId));
  }, [moduleId]);

  return module;
}

/**
 * Hook для получения пунктов меню
 */
export function useModuleMenu(): ModuleMenuItem[] {
  const [items, setItems] = React.useState<ModuleMenuItem[]>([]);

  React.useEffect(() => {
    setItems(moduleRegistry.getMenuItems());
  }, []);

  return items;
}

/**
 * Hook для проверки доступа к модулю
 */
export function useModuleAccess(
  moduleId: string,
  requiredPermissions?: string[]
): {
  hasAccess: boolean;
  isActive: boolean;
  missingDependencies: string[];
} {
  const [access, setAccess] = React.useState({
    hasAccess: false,
    isActive: false,
    missingDependencies: [] as string[],
  });

  React.useEffect(() => {
    const module = moduleRegistry.get(moduleId);
    const { can, missing } = moduleRegistry.canActivate(moduleId);

    // TODO: Проверка permissions через auth context

    setAccess({
      hasAccess: !!module && can,
      isActive: module?.isActive ?? false,
      missingDependencies: missing,
    });
  }, [moduleId, requiredPermissions]);

  return access;
}

/**
 * Hook для получения виджетов модулей
 */
export function useModuleWidgets() {
  const [widgets, setWidgets] = React.useState<
    Array<{
      id: string;
      moduleId: string;
      component: React.ComponentType<any>;
      title: string;
      defaultSize?: { width: number; height: number };
    }>
  >([]);

  React.useEffect(() => {
    const activeModules = moduleRegistry.getActive();
    const allWidgets = activeModules.flatMap((module) =>
      (module.widgets ?? []).map((widget) => ({
        ...widget,
        moduleId: module.id,
      }))
    );
    setWidgets(allWidgets);
  }, []);

  return widgets;
}
