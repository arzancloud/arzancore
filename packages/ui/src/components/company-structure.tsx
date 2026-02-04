"use client";

import * as React from "react";
import { cn } from "./utils";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  User,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

// Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  employeeCount?: number;
  children?: Department[];
  level?: number;
}

export interface DepartmentEmployee {
  id: string;
  firstName: string;
  lastName?: string;
  position?: string;
  avatar?: string;
  email?: string;
  departmentId?: string;
  status?: "active" | "vacation" | "sick_leave" | "fired";
}

// Company Structure Tree
interface CompanyStructureProps {
  departments: Department[];
  employees?: DepartmentEmployee[];
  selectedDepartmentId?: string;
  onSelectDepartment?: (department: Department) => void;
  onAddDepartment?: (parentId?: string) => void;
  onEditDepartment?: (department: Department) => void;
  onDeleteDepartment?: (department: Department) => void;
  showEmployeeCount?: boolean;
  showActions?: boolean;
  className?: string;
}

function CompanyStructure({
  departments,
  employees,
  selectedDepartmentId,
  onSelectDepartment,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  showEmployeeCount = true,
  showActions = false,
  className,
}: CompanyStructureProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {departments.map((department) => (
        <DepartmentNode
          key={department.id}
          department={department}
          employees={employees}
          selectedId={selectedDepartmentId}
          onSelect={onSelectDepartment}
          onAdd={onAddDepartment}
          onEdit={onEditDepartment}
          onDelete={onDeleteDepartment}
          showEmployeeCount={showEmployeeCount}
          showActions={showActions}
          level={0}
        />
      ))}
      {showActions && onAddDepartment && (
        <button
          onClick={() => onAddDepartment(undefined)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md w-full"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить отдел</span>
        </button>
      )}
    </div>
  );
}

// Department Node
interface DepartmentNodeProps {
  department: Department;
  employees?: DepartmentEmployee[];
  selectedId?: string;
  onSelect?: (department: Department) => void;
  onAdd?: (parentId?: string) => void;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  showEmployeeCount?: boolean;
  showActions?: boolean;
  level: number;
}

function DepartmentNode({
  department,
  employees,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  showEmployeeCount,
  showActions,
  level,
}: DepartmentNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);
  const [showMenu, setShowMenu] = React.useState(false);

  const hasChildren = department.children && department.children.length > 0;
  const isSelected = selectedId === department.id;

  const deptEmployees = employees?.filter(
    (e) => e.departmentId === department.id
  );
  const employeeCount = department.employeeCount ?? deptEmployees?.length ?? 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect?.(department)}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            "p-0.5 rounded hover:bg-accent",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        <Building2 className="h-4 w-4 text-muted-foreground" />

        {/* Name */}
        <span className="flex-1 truncate text-sm font-medium">
          {department.name}
        </span>

        {/* Employee count */}
        {showEmployeeCount && employeeCount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {employeeCount}
          </span>
        )}

        {/* Actions */}
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
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-popover border rounded-md shadow-md py-1 min-w-[140px]">
                  {onAdd && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(department.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Добавить
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(department);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full"
                    >
                      <Pencil className="h-4 w-4" />
                      Изменить
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(department);
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

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {department.children!.map((child) => (
            <DepartmentNode
              key={child.id}
              department={child}
              employees={employees}
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              showEmployeeCount={showEmployeeCount}
              showActions={showActions}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Employee List for a department
interface EmployeeListProps {
  employees: DepartmentEmployee[];
  onSelectEmployee?: (employee: DepartmentEmployee) => void;
  selectedEmployeeId?: string;
  className?: string;
}

function EmployeeList({
  employees,
  onSelectEmployee,
  selectedEmployeeId,
  className,
}: EmployeeListProps) {
  if (employees.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground py-4 text-center", className)}>
        Нет сотрудников
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {employees.map((employee) => (
        <div
          key={employee.id}
          onClick={() => onSelectEmployee?.(employee)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer",
            selectedEmployeeId === employee.id
              ? "bg-primary/10 text-primary"
              : "hover:bg-accent"
          )}
        >
          {/* Avatar */}
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {employee.firstName} {employee.lastName}
            </div>
            {employee.position && (
              <div className="text-xs text-muted-foreground truncate">
                {employee.position}
              </div>
            )}
          </div>

          {/* Status */}
          {employee.status && employee.status !== "active" && (
            <StatusBadge status={employee.status} />
          )}
        </div>
      ))}
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: DepartmentEmployee["status"] }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Активен", className: "bg-green-100 text-green-700" },
    vacation: { label: "Отпуск", className: "bg-blue-100 text-blue-700" },
    sick_leave: { label: "Больничный", className: "bg-yellow-100 text-yellow-700" },
    fired: { label: "Уволен", className: "bg-red-100 text-red-700" },
  };

  const { label, className } = config[status || "active"];

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full", className)}>
      {label}
    </span>
  );
}

// Org Chart View (visual tree)
interface OrgChartProps {
  departments: Department[];
  employees?: DepartmentEmployee[];
  onSelectDepartment?: (department: Department) => void;
  onSelectEmployee?: (employee: DepartmentEmployee) => void;
  className?: string;
}

function OrgChart({
  departments,
  employees,
  onSelectDepartment,
  onSelectEmployee,
  className,
}: OrgChartProps) {
  return (
    <div className={cn("flex flex-col items-center gap-8 p-4", className)}>
      {departments.map((dept) => (
        <OrgChartNode
          key={dept.id}
          department={dept}
          employees={employees}
          onSelectDepartment={onSelectDepartment}
          onSelectEmployee={onSelectEmployee}
        />
      ))}
    </div>
  );
}

function OrgChartNode({
  department,
  employees,
  onSelectDepartment,
  onSelectEmployee,
}: {
  department: Department;
  employees?: DepartmentEmployee[];
  onSelectDepartment?: (department: Department) => void;
  onSelectEmployee?: (employee: DepartmentEmployee) => void;
}) {
  const deptEmployees = employees?.filter(
    (e) => e.departmentId === department.id
  );
  const manager = deptEmployees?.find((e) => e.id === department.managerId);

  return (
    <div className="flex flex-col items-center">
      {/* Department Card */}
      <div
        onClick={() => onSelectDepartment?.(department)}
        className="border rounded-lg p-4 bg-card cursor-pointer hover:shadow-md transition-shadow min-w-[200px]"
      >
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-medium">{department.name}</span>
        </div>
        {manager && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {manager.firstName} {manager.lastName}
            </span>
          </div>
        )}
        {deptEmployees && deptEmployees.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Users className="h-4 w-4" />
            <span>{deptEmployees.length} сотрудников</span>
          </div>
        )}
      </div>

      {/* Children */}
      {department.children && department.children.length > 0 && (
        <>
          {/* Connector line */}
          <div className="w-px h-8 bg-border" />
          {/* Horizontal line */}
          <div className="flex items-start">
            {department.children.length > 1 && (
              <div
                className="h-px bg-border"
                style={{
                  width: `${(department.children.length - 1) * 220}px`,
                }}
              />
            )}
          </div>
          {/* Child nodes */}
          <div className="flex gap-4">
            {department.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {department.children!.length > 1 && (
                  <div className="w-px h-4 bg-border" />
                )}
                <OrgChartNode
                  department={child}
                  employees={employees}
                  onSelectDepartment={onSelectDepartment}
                  onSelectEmployee={onSelectEmployee}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export {
  CompanyStructure,
  DepartmentNode,
  EmployeeList,
  OrgChart,
  StatusBadge,
  type CompanyStructureProps,
  type DepartmentNodeProps,
  type EmployeeListProps,
  type OrgChartProps,
};
