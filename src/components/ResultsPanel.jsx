import { RefreshCw, Info } from 'lucide-react'
import ResultCard from './ResultCard'
import SkeletonCard from './SkeletonCard'

export default function ResultsPanel({ status, results, error, onRetry }) {
  const showSkeletons = status === 'fetching' || status === 'computing' || status === 'analyzing'
  
  if (status === 'idle') return null

  if (status === 'error') {
    return (
      <div className="side-panel flex flex-col items-center justify-center text-center space-y-4 py-12">
        <div className="w-12 h-12 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-red-500 mb-2">
          <RefreshCw size={24} />
        </div>
        <h3 className="text-lg font-bold text-red-500 font-[var(--font-mono)]">Scan Failed</h3>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded text-sm font-semibold hover:border-red-500/50 hover:text-red-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (showSkeletons) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <h2 className="section-heading mb-0 text-[var(--color-text-primary)]">
            ANALYZING SETUPS...
          </h2>
        </div>
        <div className="results-container">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
        </div>
      </div>
    )
  }

  if (status === 'done' && results.length === 0) {
    return (
      <div className="side-panel text-center py-12">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 font-[var(--font-mono)]">No Setups Found</h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          None of the scanned tickers matched your selected patterns.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[var(--color-border)] gap-4">
        <h2 className="section-heading mb-0 text-[var(--color-accent)] font-bold">
          {results.length} RESULTS 
          <span className="text-[var(--color-text-secondary)] font-normal ml-2">Sorted by Swingster Score.</span>
          <Info size={14} className="text-[var(--color-text-muted)] ml-1" />
        </h2>
        
        <div className="flex items-center gap-2 text-xs-mono">
          <span>Updated just now</span>
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
        </div>
      </div>
      
      <div className="results-container">
        {results.map((result, idx) => (
          <ResultCard
            key={result.ticker}
            result={result}
            rank={idx + 1}
            index={idx}
          />
        ))}
      </div>
    </div>
  )
}
