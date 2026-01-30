export function SkeletonCard() {
  return (
    <div className="border border-border bg-surface animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        
        {/* Author */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        
        {/* Meta row */}
        <div className="flex items-center gap-3">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
