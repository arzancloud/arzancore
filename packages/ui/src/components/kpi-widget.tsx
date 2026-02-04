"use client";

import * as React from "react";
import { cn } from "./utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";

// Types
export interface KPIMetric {
  id: string;
  name: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  previousValue?: number;
  unit?: string;
  format?: "number" | "currency" | "percent" | "time";
  currency?: string;
  direction?: "up" | "down"; // up = higher is better, down = lower is better
  category?: string;
  period?: string;
  status?: "on_track" | "at_risk" | "behind" | "exceeded";
}

export interface KPIEmployee {
  id: string;
  name: string;
  avatar?: string;
  metrics: KPIMetric[];
  overallScore?: number;
}

// KPI Card - single metric display
interface KPICardProps {
  metric: KPIMetric;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

function KPICard({
  metric,
  size = "md",
  showTrend = true,
  showProgress = true,
  onClick,
  className,
}: KPICardProps) {
  const progress = Math.min(100, (metric.currentValue / metric.targetValue) * 100);
  const trend = metric.previousValue
    ? ((metric.currentValue - metric.previousValue) / metric.previousValue) * 100
    : 0;
  const isPositiveTrend =
    metric.direction === "down" ? trend < 0 : trend > 0;

  const formatValue = (value: number) => {
    switch (metric.format) {
      case "currency":
        return new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: metric.currency || "KZT",
          maximumFractionDigits: 0,
        }).format(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      case "time":
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours}ч ${minutes}м`;
      default:
        return new Intl.NumberFormat("ru-RU").format(value);
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const valueClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg",
        sizeClasses[size],
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            {metric.name}
          </h4>
          {metric.period && (
            <span className="text-xs text-muted-foreground">{metric.period}</span>
          )}
        </div>
        <StatusIcon status={metric.status} />
      </div>

      {/* Value */}
      <div className="flex items-end gap-2 mb-2">
        <span className={cn("font-bold", valueClasses[size])}>
          {formatValue(metric.currentValue)}
        </span>
        {metric.unit && (
          <span className="text-sm text-muted-foreground mb-1">
            {metric.unit}
          </span>
        )}
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Target className="h-4 w-4" />
        <span>Цель: {formatValue(metric.targetValue)}</span>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Прогресс</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress >= 100
                  ? "bg-green-500"
                  : progress >= 70
                  ? "bg-primary"
                  : progress >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend */}
      {showTrend && metric.previousValue !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          {trend > 0 ? (
            <TrendingUp
              className={cn(
                "h-4 w-4",
                isPositiveTrend ? "text-green-500" : "text-red-500"
              )}
            />
          ) : trend < 0 ? (
            <TrendingDown
              className={cn(
                "h-4 w-4",
                isPositiveTrend ? "text-green-500" : "text-red-500"
              )}
            />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              trend !== 0
                ? isPositiveTrend
                  ? "text-green-500"
                  : "text-red-500"
                : "text-muted-foreground"
            )}
          >
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs прошлый период</span>
        </div>
      )}
    </div>
  );
}

// Status Icon
function StatusIcon({ status }: { status?: KPIMetric["status"] }) {
  switch (status) {
    case "exceeded":
      return <Award className="h-5 w-5 text-green-500" />;
    case "on_track":
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    case "at_risk":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "behind":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

// KPI Grid - multiple metrics
interface KPIGridProps {
  metrics: KPIMetric[];
  columns?: 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  onMetricClick?: (metric: KPIMetric) => void;
  className?: string;
}

function KPIGrid({
  metrics,
  columns = 3,
  size = "md",
  onMetricClick,
  className,
}: KPIGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {metrics.map((metric) => (
        <KPICard
          key={metric.id}
          metric={metric}
          size={size}
          onClick={onMetricClick ? () => onMetricClick(metric) : undefined}
        />
      ))}
    </div>
  );
}

// KPI Summary - overview card
interface KPISummaryProps {
  metrics: KPIMetric[];
  title?: string;
  period?: string;
  className?: string;
}

function KPISummary({
  metrics,
  title = "Сводка KPI",
  period,
  className,
}: KPISummaryProps) {
  const exceeded = metrics.filter((m) => m.status === "exceeded").length;
  const onTrack = metrics.filter((m) => m.status === "on_track").length;
  const atRisk = metrics.filter((m) => m.status === "at_risk").length;
  const behind = metrics.filter((m) => m.status === "behind").length;

  const avgProgress =
    metrics.reduce((sum, m) => sum + (m.currentValue / m.targetValue) * 100, 0) /
    metrics.length;

  return (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {period && (
            <span className="text-sm text-muted-foreground">{period}</span>
          )}
        </div>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Общий прогресс</span>
          <span className="font-medium">{avgProgress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              avgProgress >= 100
                ? "bg-green-500"
                : avgProgress >= 70
                ? "bg-primary"
                : avgProgress >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${Math.min(100, avgProgress)}%` }}
          />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-500">{exceeded}</div>
          <div className="text-xs text-muted-foreground">Превышено</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{onTrack}</div>
          <div className="text-xs text-muted-foreground">В плане</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{atRisk}</div>
          <div className="text-xs text-muted-foreground">Под угрозой</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{behind}</div>
          <div className="text-xs text-muted-foreground">Отставание</div>
        </div>
      </div>
    </div>
  );
}

// Employee KPI Row
interface EmployeeKPIRowProps {
  employee: KPIEmployee;
  metrics: KPIMetric[];
  onEmployeeClick?: (employee: KPIEmployee) => void;
  className?: string;
}

function EmployeeKPIRow({
  employee,
  metrics,
  onEmployeeClick,
  className,
}: EmployeeKPIRowProps) {
  const avgScore =
    employee.overallScore ??
    employee.metrics.reduce(
      (sum, m) => sum + (m.currentValue / m.targetValue) * 100,
      0
    ) / employee.metrics.length;

  return (
    <div
      onClick={() => onEmployeeClick?.(employee)}
      className={cn(
        "flex items-center gap-4 p-4 border-b last:border-b-0",
        onEmployeeClick && "cursor-pointer hover:bg-accent/50",
        className
      )}
    >
      {/* Employee info */}
      <div className="flex items-center gap-3 min-w-[200px]">
        {employee.avatar ? (
          <img
            src={employee.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
            {employee.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-muted-foreground">
            {avgScore.toFixed(0)}% выполнения
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {employee.metrics.slice(0, 3).map((metric) => {
          const progress = (metric.currentValue / metric.targetValue) * 100;
          return (
            <div key={metric.id} className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                {metric.name}
              </div>
              <div className="font-medium">{metric.currentValue}</div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className={cn(
                    "h-full rounded-full",
                    progress >= 100
                      ? "bg-green-500"
                      : progress >= 70
                      ? "bg-primary"
                      : progress >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall score */}
      <div className="text-right min-w-[80px]">
        <div
          className={cn(
            "text-2xl font-bold",
            avgScore >= 100
              ? "text-green-500"
              : avgScore >= 70
              ? "text-primary"
              : avgScore >= 50
              ? "text-yellow-500"
              : "text-red-500"
          )}
        >
          {avgScore.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

// KPI Leaderboard
interface KPILeaderboardProps {
  employees: KPIEmployee[];
  title?: string;
  maxItems?: number;
  onEmployeeClick?: (employee: KPIEmployee) => void;
  className?: string;
}

function KPILeaderboard({
  employees,
  title = "Лидеры",
  maxItems = 5,
  onEmployeeClick,
  className,
}: KPILeaderboardProps) {
  const sorted = [...employees]
    .map((e) => ({
      ...e,
      score:
        e.overallScore ??
        e.metrics.reduce(
          (sum, m) => sum + (m.currentValue / m.targetValue) * 100,
          0
        ) / e.metrics.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems);

  return (
    <div className={cn("bg-card border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y">
        {sorted.map((employee, index) => (
          <div
            key={employee.id}
            onClick={() => onEmployeeClick?.(employee)}
            className={cn(
              "flex items-center gap-4 p-4",
              onEmployeeClick && "cursor-pointer hover:bg-accent/50"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                index === 0
                  ? "bg-yellow-100 text-yellow-700"
                  : index === 1
                  ? "bg-gray-100 text-gray-700"
                  : index === 2
                  ? "bg-orange-100 text-orange-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>

            {/* Avatar */}
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                {employee.name.charAt(0)}
              </div>
            )}

            {/* Name */}
            <div className="flex-1">
              <div className="font-medium">{employee.name}</div>
            </div>

            {/* Score */}
            <div
              className={cn(
                "text-lg font-bold",
                employee.score >= 100
                  ? "text-green-500"
                  : employee.score >= 70
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {employee.score.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  KPICard,
  KPIGrid,
  KPISummary,
  EmployeeKPIRow,
  KPILeaderboard,
  StatusIcon,
  type KPICardProps,
  type KPIGridProps,
  type KPISummaryProps,
  type EmployeeKPIRowProps,
  type KPILeaderboardProps,
};
