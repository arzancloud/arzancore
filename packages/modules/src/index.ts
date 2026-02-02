// Types
export {
  defineModule,
  type ArzanModule,
  type RegisteredModule,
  type ModuleRoute,
  type ModuleMenuItem,
  type ModuleSetting,
  type ModuleIntegration,
  type ModuleEvent,
  type ModuleContext,
} from './types';

// Registry
export { moduleRegistry, ModuleRegistry } from './registry';

// Hooks
export {
  useActiveModules,
  useModule,
  useModuleMenu,
  useModuleAccess,
  useModuleWidgets,
} from './hooks/useModules';
