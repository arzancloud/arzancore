"use client";

import * as React from "react";
import { cn } from "./utils";
import { Button } from "./button";
import { Progress } from "./progress";
import { AlertTriangle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LimitIndicatorProps {
  current: number;
  max: number;
  label: string;
  className?: string;
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
  compact?: boolean;
  showWarningAt?: number; // percentage threshold for warning (default 80)
}

export function LimitIndicator({
  current,
  max,
  label,
  className,
  showUpgradeButton = true,
  onUpgrade,
  compact = false,
  showWarningAt = 80,
}: LimitIndicatorProps) {
  const { t } = useTranslation('common');

  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isAtLimit = current >= max;
  const isNearLimit = percentage >= showWarningAt && !isAtLimit;
  const remaining = Math.max(0, max - current);

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <span className="text-slate-600">{label}:</span>
        <span className={cn(
          "font-medium",
          isAtLimit && "text-red-600",
          isNearLimit && "text-amber-600",
          !isAtLimit && !isNearLimit && "text-slate-900"
        )}>
          {current} / {max}
        </span>
        {isAtLimit && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-white p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold",
            isAtLimit && "text-red-600",
            isNearLimit && "text-amber-600",
            !isAtLimit && !isNearLimit && "text-slate-900"
          )}>
            {current} {t('limits.of', 'из')} {max}
          </span>
          {isAtLimit && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      </div>

      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full transition-all duration-300", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {isAtLimit
            ? t('limits.limitReached', 'Лимит исчерпан')
            : `${t('limits.remaining', 'Осталось')}: ${remaining}`
          }
        </span>
        {showUpgradeButton && onUpgrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpgrade}
            className="h-6 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            {t('limits.upgrade', 'Увеличить')}
          </Button>
        )}
      </div>
    </div>
  );
}

// Compact inline version for headers/toolbars
export function LimitBadge({
  current,
  max,
  label,
  className,
}: Pick<LimitIndicatorProps, 'current' | 'max' | 'label' | 'className'>) {
  const { t } = useTranslation('common');
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isAtLimit = current >= max;
  const isNearLimit = percentage >= 80 && !isAtLimit;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      isAtLimit && "bg-red-100 text-red-700",
      isNearLimit && "bg-amber-100 text-amber-700",
      !isAtLimit && !isNearLimit && "bg-slate-100 text-slate-700",
      className
    )}>
      {isAtLimit && <AlertTriangle className="w-3 h-3" />}
      <span>{label}: {current}/{max}</span>
    </div>
  );
}

// Storage-specific variant with MB/GB display
export function StorageLimitIndicator({
  usedMb,
  maxMb,
  className,
  showUpgradeButton = true,
  onUpgrade,
}: {
  usedMb: number;
  maxMb: number;
  className?: string;
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
}) {
  const { t } = useTranslation('common');

  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const percentage = maxMb > 0 ? Math.min((usedMb / maxMb) * 100, 100) : 0;
  const isAtLimit = usedMb >= maxMb;
  const isNearLimit = percentage >= 80 && !isAtLimit;
  const remaining = Math.max(0, maxMb - usedMb);

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className={cn("rounded-lg border bg-white p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {t('limits.storage', 'Хранилище')}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold",
            isAtLimit && "text-red-600",
            isNearLimit && "text-amber-600",
            !isAtLimit && !isNearLimit && "text-slate-900"
          )}>
            {formatSize(usedMb)} {t('limits.of', 'из')} {formatSize(maxMb)}
          </span>
          {isAtLimit && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      </div>

      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full transition-all duration-300", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {isAtLimit
            ? t('limits.storageFullDesc', 'Хранилище заполнено')
            : `${t('limits.remaining', 'Осталось')}: ${formatSize(remaining)}`
          }
        </span>
        {showUpgradeButton && onUpgrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpgrade}
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            {t('limits.addStorage', 'Добавить место')}
          </Button>
        )}
      </div>
    </div>
  );
}
