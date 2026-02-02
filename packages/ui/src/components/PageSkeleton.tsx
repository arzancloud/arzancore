import { Skeleton } from "./skeleton";

/**
 * Full page skeleton for initial load
 * Shows a layout-like skeleton while the app is loading
 */
export function PageSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        {/* Table/List skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

/**
 * Table skeleton for data tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Kanban skeleton for CRM board
 */
export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="bg-white rounded-lg p-3 shadow-sm">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
