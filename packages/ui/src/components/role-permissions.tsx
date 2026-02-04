"use client";

import * as React from "react";
import { cn } from "./utils";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ChevronDown,
  ChevronRight,
  Check,
  Minus,
  Eye,
  Pencil,
  Trash2,
  Settings,
  Lock,
} from "lucide-react";

// Types
type Permission = "read" | "write" | "delete" | "admin";

interface PermissionModule {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  code?: string;
  color?: string;
  isSystem?: boolean;
  permissions: Record<string, Permission[]>;
}

// Default modules with their available permissions
const defaultModules: PermissionModule[] = [
  {
    id: "portal",
    name: "Портал",
    description: "Общие настройки портала",
    permissions: ["read", "write", "admin"],
  },
  {
    id: "employees",
    name: "Сотрудники",
    description: "Управление сотрудниками",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "roles",
    name: "Роли",
    description: "Управление ролями и правами",
    permissions: ["read", "write", "delete"],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Сделки, контакты, воронки",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "ai-messenger",
    name: "AI + Мессенджеры",
    description: "Чат-боты, каналы",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "stock",
    name: "Склад",
    description: "Товары, остатки, касса",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "med",
    name: "Медицина",
    description: "Пациенты, приёмы",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "booking",
    name: "Онлайн-запись",
    description: "Услуги, расписание",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "shop",
    name: "Магазин",
    description: "Заказы, доставка",
    permissions: ["read", "write", "delete", "admin"],
  },
  {
    id: "build",
    name: "Строительство",
    description: "Проекты, сметы",
    permissions: ["read", "write", "delete", "admin"],
  },
];

// Permission labels
const permissionLabels: Record<Permission, { label: string; icon: React.ReactNode }> = {
  read: { label: "Просмотр", icon: <Eye className="h-4 w-4" /> },
  write: { label: "Редактирование", icon: <Pencil className="h-4 w-4" /> },
  delete: { label: "Удаление", icon: <Trash2 className="h-4 w-4" /> },
  admin: { label: "Администратор", icon: <Settings className="h-4 w-4" /> },
};

// Role Permissions Editor
interface RolePermissionsProps {
  role: Role;
  modules?: PermissionModule[];
  onChange?: (permissions: Record<string, Permission[]>) => void;
  readOnly?: boolean;
  className?: string;
}

function RolePermissions({
  role,
  modules = defaultModules,
  onChange,
  readOnly = false,
  className,
}: RolePermissionsProps) {
  const [permissions, setPermissions] = React.useState<Record<string, Permission[]>>(
    role.permissions || {}
  );
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    new Set(modules.slice(0, 3).map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (moduleId: string, permission: Permission) => {
    if (readOnly || role.isSystem) return;

    const modulePermissions = permissions[moduleId] || [];
    let newModulePermissions: Permission[];

    if (modulePermissions.includes(permission)) {
      // Remove permission
      newModulePermissions = modulePermissions.filter((p) => p !== permission);
      // If removing admin, also keep other permissions
      // If removing read, also remove write and delete
      if (permission === "read") {
        newModulePermissions = [];
      }
    } else {
      // Add permission
      newModulePermissions = [...modulePermissions, permission];
      // If adding write or delete, also add read
      if (permission === "write" || permission === "delete") {
        if (!newModulePermissions.includes("read")) {
          newModulePermissions.push("read");
        }
      }
      // If adding admin, add all permissions
      if (permission === "admin") {
        const module = modules.find((m) => m.id === moduleId);
        newModulePermissions = module?.permissions || [];
      }
    }

    const newPermissions = {
      ...permissions,
      [moduleId]: newModulePermissions,
    };

    setPermissions(newPermissions);
    onChange?.(newPermissions);
  };

  const toggleAllPermissions = (moduleId: string) => {
    if (readOnly || role.isSystem) return;

    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const modulePermissions = permissions[moduleId] || [];
    const hasAll = module.permissions.every((p) => modulePermissions.includes(p));

    const newPermissions = {
      ...permissions,
      [moduleId]: hasAll ? [] : [...module.permissions],
    };

    setPermissions(newPermissions);
    onChange?.(newPermissions);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 pb-2 border-b">
        <Shield className="h-4 w-4" />
        <span className="flex-1">Модуль</span>
        <div className="flex gap-6">
          {(["read", "write", "delete", "admin"] as Permission[]).map((perm) => (
            <div
              key={perm}
              className="w-16 text-center"
              title={permissionLabels[perm].label}
            >
              {permissionLabels[perm].icon}
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-1">
        {modules.map((module) => {
          const isExpanded = expandedModules.has(module.id);
          const modulePermissions = permissions[module.id] || [];
          const hasAny = modulePermissions.length > 0;
          const hasAll = module.permissions.every((p) =>
            modulePermissions.includes(p)
          );

          return (
            <div key={module.id} className="border rounded-lg overflow-hidden">
              {/* Module header */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50",
                  hasAny && "bg-primary/5"
                )}
                onClick={() => toggleModule(module.id)}
              >
                <button className="p-0.5">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="font-medium text-sm">{module.name}</div>
                  {module.description && (
                    <div className="text-xs text-muted-foreground">
                      {module.description}
                    </div>
                  )}
                </div>

                {/* Quick toggle all */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllPermissions(module.id);
                  }}
                  disabled={readOnly || role.isSystem}
                  className={cn(
                    "p-1 rounded",
                    !readOnly && !role.isSystem && "hover:bg-accent"
                  )}
                >
                  {hasAll ? (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  ) : hasAny ? (
                    <Shield className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <ShieldX className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Permissions grid */}
              {isExpanded && (
                <div className="px-3 py-2 bg-muted/30 border-t">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 pl-6 text-sm text-muted-foreground">
                      Права доступа
                    </div>
                    <div className="flex gap-6">
                      {(["read", "write", "delete", "admin"] as Permission[]).map(
                        (perm) => {
                          const isAvailable = module.permissions.includes(perm);
                          const isActive = modulePermissions.includes(perm);

                          return (
                            <div key={perm} className="w-16 flex justify-center">
                              {isAvailable ? (
                                <button
                                  onClick={() => togglePermission(module.id, perm)}
                                  disabled={readOnly || role.isSystem}
                                  className={cn(
                                    "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                                    isActive
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-muted-foreground/30 hover:border-primary/50",
                                    (readOnly || role.isSystem) &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isActive && <Check className="h-4 w-4" />}
                                </button>
                              ) : (
                                <div className="w-6 h-6 flex items-center justify-center">
                                  <Minus className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System role warning */}
      {role.isSystem && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          <Lock className="h-4 w-4" />
          <span>Это системная роль. Её права нельзя изменить.</span>
        </div>
      )}
    </div>
  );
}

// Role Card - compact role display
interface RoleCardProps {
  role: Role;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

function RoleCard({
  role,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  className,
}: RoleCardProps) {
  const permissionCount = Object.values(role.permissions).flat().length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-primary/50 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {role.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: role.color }}
            />
          )}
          <div>
            <h4 className="font-medium">{role.name}</h4>
            {role.code && (
              <span className="text-xs text-muted-foreground">{role.code}</span>
            )}
          </div>
        </div>
        {role.isSystem && (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {role.description && (
        <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className="text-sm text-muted-foreground">
          {permissionCount} прав
        </span>
        {!role.isSystem && (onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 rounded hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded hover:bg-accent text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Roles List
interface RolesListProps {
  roles: Role[];
  selectedRoleId?: string;
  onSelectRole?: (role: Role) => void;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
  onAddRole?: () => void;
  className?: string;
}

function RolesList({
  roles,
  selectedRoleId,
  onSelectRole,
  onEditRole,
  onDeleteRole,
  onAddRole,
  className,
}: RolesListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          isSelected={selectedRoleId === role.id}
          onClick={() => onSelectRole?.(role)}
          onEdit={onEditRole ? () => onEditRole(role) : undefined}
          onDelete={onDeleteRole ? () => onDeleteRole(role) : undefined}
        />
      ))}
      {onAddRole && (
        <button
          onClick={onAddRole}
          className="w-full border-2 border-dashed rounded-lg p-4 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          + Добавить роль
        </button>
      )}
    </div>
  );
}

// Permission Badge
interface PermissionBadgeProps {
  permission: Permission;
  className?: string;
}

function PermissionBadge({ permission, className }: PermissionBadgeProps) {
  const { label, icon } = permissionLabels[permission];

  const colors: Record<Permission, string> = {
    read: "bg-blue-100 text-blue-700",
    write: "bg-green-100 text-green-700",
    delete: "bg-red-100 text-red-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        colors[permission],
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}

export {
  RolePermissions,
  RoleCard,
  RolesList,
  PermissionBadge,
  defaultModules,
  permissionLabels,
  type RolePermissionsProps,
  type RoleCardProps,
  type RolesListProps,
  type PermissionBadgeProps,
  type PermissionModule,
  type Permission,
  type Role,
};
