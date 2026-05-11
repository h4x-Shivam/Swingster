export default function SkeletonCard() {
  return (
    <div className="result-row opacity-60">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4 w-full max-w-xl">
          {/* Rank */}
          <div className="w-8 h-6 rounded skeleton-shimmer flex-shrink-0" />

          {/* Ticker Name */}
          <div className="w-20 h-8 rounded skeleton-shimmer" />

          {/* Badges Row */}
          <div className="flex items-center gap-2 ml-2">
            <div className="w-16 h-5 rounded skeleton-shimmer" />
            <div className="w-20 h-5 rounded skeleton-shimmer" />
            <div className="w-12 h-5 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end flex-shrink-0 ml-4">
          <div className="w-16 h-8 rounded skeleton-shimmer mb-2" />
          <div className="w-24 h-1 rounded skeleton-shimmer" />
        </div>
      </div>

      {/* Bottom Line: Reason */}
      <div className="pl-12">
        <div className="w-3/4 h-4 rounded skeleton-shimmer" />
      </div>
    </div>
  )
}
