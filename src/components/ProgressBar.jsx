export default function ProgressBar({ status, progress, skippedCount }) {
  const isActive = status === 'fetching' || status === 'computing' || status === 'analyzing'
  if (!isActive && status !== 'done') return null

  const pct = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  let statusText = ''
  if (status === 'fetching') {
    statusText = `Fetching ${progress.ticker} (${progress.current}/${progress.total})...`
  } else if (status === 'computing') {
    statusText = 'Computing metrics & RS ratings...'
  } else if (status === 'analyzing') {
    statusText = 'AI analyzing setups with Claude...'
  } else if (status === 'done') {
    statusText = `Scan complete${skippedCount > 0 ? ` · ${skippedCount} ticker${skippedCount !== 1 ? 's' : ''} skipped` : ''}`
  }

  const barWidth = status === 'analyzing' ? 90 : status === 'computing' ? 85 : status === 'done' ? 100 : pct

  return (
    <div className="space-y-2">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-xs font-[var(--font-mono)] text-[var(--color-text-muted)] tracking-wide">
        {statusText}
      </p>
    </div>
  )
}
