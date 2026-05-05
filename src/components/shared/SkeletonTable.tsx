import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonTable({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`c-${r}-${c}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
