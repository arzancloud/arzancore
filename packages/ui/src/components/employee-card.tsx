"use client";

import * as React from "react";
import { cn } from "./utils";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog,
  Clock,
} from "lucide-react";

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  workPhone?: string;
  position?: string;
  departmentName?: string;
  avatar?: string;
  hireDate?: string;
  status?: "active" | "vacation" | "sick_leave" | "fired" | "suspended";
  employmentType?: "full_time" | "part_time" | "contract" | "intern";
}

// Status config
const statusConfig: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  active: {
    label: "Активен",
    className: "bg-green-50 text-green-700 border-green-200",
    dotClassName: "bg-green-500",
  },
  vacation: {
    label: "Отпуск",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotClassName: "bg-blue-500",
  },
  sick_leave: {
    label: "Больничный",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dotClassName: "bg-yellow-500",
  },
  fired: {
    label: "Уволен",
    className: "bg-red-50 text-red-700 border-red-200",
    dotClassName: "bg-red-500",
  },
  suspended: {
    label: "Приостановлен",
    className: "bg-gray-50 text-gray-700 border-gray-200",
    dotClassName: "bg-gray-500",
  },
};

const employmentTypeLabels: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  intern: "Стажёр",
};

// Employee Card
interface EmployeeCardProps {
  employee: Employee;
  variant?: "default" | "compact" | "detailed";
  showStatus?: boolean;
  showActions?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageRoles?: () => void;
  className?: string;
}

function EmployeeCard({
  employee,
  variant = "default",
  showStatus = true,
  showActions = false,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onManageRoles,
  className,
}: EmployeeCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  const status = statusConfig[employee.status || "active"];

  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          onClick && "cursor-pointer hover:bg-accent",
          isSelected && "bg-primary/10",
          className
        )}
      >
        <EmployeeAvatar employee={employee} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{fullName}</div>
          {employee.position && (
            <div className="text-xs text-muted-foreground truncate">
              {employee.position}
            </div>
          )}
        </div>
        {showStatus && employee.status && employee.status !== "active" && (
          <div
            className={cn("w-2 h-2 rounded-full", status.dotClassName)}
            title={status.label}
          />
        )}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "bg-card border rounded-lg p-6",
          isSelected && "ring-2 ring-primary",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <EmployeeAvatar employee={employee} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{fullName}</h3>
                {employee.position && (
                  <p className="text-muted-foreground">{employee.position}</p>
                )}
              </div>
              {showStatus && (
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    status.className
                  )}
                >
                  {status.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {employee.departmentName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{employee.departmentName}</span>
            </div>
          )}
          {employee.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${employee.email}`} className="hover:underline">
                {employee.email}
              </a>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${employee.phone}`} className="hover:underline">
                {employee.phone}
              </a>
            </div>
          )}
          {employee.hireDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                С{" "}
                {new Date(employee.hireDate).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {employee.employmentType && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{employmentTypeLabels[employee.employmentType]}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (onEdit || onDelete || onManageRoles) && (
          <div className="mt-6 pt-4 border-t flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
                Редактировать
              </button>
            )}
            {onManageRoles && (
              <button
                onClick={onManageRoles}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-accent"
              >
                <UserCog className="h-4 w-4" />
                Роли
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-accent text-destructive ml-auto"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-4 transition-all group",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        isSelected && "ring-2 ring-primary",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <EmployeeAvatar employee={employee} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium truncate">{fullName}</h4>
              {employee.position && (
                <p className="text-sm text-muted-foreground truncate">
                  {employee.position}
                </p>
              )}
            </div>
            {showActions && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-popover border rounded-md shadow-md py-1 min-w-[140px]">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full"
                        >
                          <Pencil className="h-4 w-4" />
                          Редактировать
                        </button>
                      )}
                      {onManageRoles && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageRoles();
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full"
                        >
                          <UserCog className="h-4 w-4" />
                          Роли
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {employee.departmentName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {employee.departmentName}
              </span>
            )}
            {employee.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {employee.email}
              </span>
            )}
          </div>
        </div>

        {showStatus && employee.status && employee.status !== "active" && (
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full border shrink-0",
              status.className
            )}
          >
            {status.label}
          </span>
        )}
      </div>
    </div>
  );
}

// Employee Avatar
interface EmployeeAvatarProps {
  employee: Employee;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function EmployeeAvatar({ employee, size = "md", className }: EmployeeAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };

  const initials = [employee.firstName?.[0], employee.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt=""
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium",
        sizeClasses[size],
        className
      )}
    >
      {initials || <User className="h-1/2 w-1/2" />}
    </div>
  );
}

// Employee Grid
interface EmployeeGridProps {
  employees: Employee[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "compact";
  selectedEmployeeId?: string;
  onSelectEmployee?: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
  showActions?: boolean;
  className?: string;
}

function EmployeeGrid({
  employees,
  columns = 3,
  variant = "default",
  selectedEmployeeId,
  onSelectEmployee,
  onEditEmployee,
  onDeleteEmployee,
  showActions = false,
  className,
}: EmployeeGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (employees.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Нет сотрудников</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          variant={variant}
          isSelected={selectedEmployeeId === employee.id}
          onClick={onSelectEmployee ? () => onSelectEmployee(employee) : undefined}
          onEdit={onEditEmployee ? () => onEditEmployee(employee) : undefined}
          onDelete={onDeleteEmployee ? () => onDeleteEmployee(employee) : undefined}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

export {
  EmployeeCard,
  EmployeeAvatar,
  EmployeeGrid,
  statusConfig,
  employmentTypeLabels,
  type EmployeeCardProps,
  type EmployeeAvatarProps,
  type EmployeeGridProps,
  type Employee,
};
