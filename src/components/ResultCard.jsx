import { Flame } from 'lucide-react'

const BADGE_CLASS = {
  'VCP': 'badge-vcp',
  'Cup & Handle': 'badge-cup',
  'Cup': 'badge-cup',
  'Flag': 'badge-flag',
  'Breakout': 'badge-breakout',
}

function getRSClass(rs) {
  if (rs >= 80) return 'rs-badge'
  if (rs >= 60) return 'rs-badge rs-mid'
  return 'badge border border-[var(--color-border)] text-[var(--color-text-muted)]'
}

function getTradingViewUrl(ticker) {
  let symbol = ticker;
  if (ticker.endsWith('.NS')) {
    symbol = `NSE:${ticker.replace('.NS', '')}`;
  } else if (ticker.endsWith('.BO')) {
    symbol = `BSE:${ticker.replace('.BO', '')}`;
  }
  return `https://in.tradingview.com/chart/?symbol=${symbol}`;
}

export default function ResultCard({ result, rank, index }) {
  const { ticker, score, patterns, rs, volSpike, reason } = result
  const isFirst = rank === 1

  return (
    <div
      className={`result-row animate-fade-in-up ${isFirst ? 'result-row-first' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top Line: Rank, Ticker, Badges, Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Rank */}
          <div className="w-8 text-xl font-bold font-[var(--font-mono)] text-[var(--color-text-muted)]">
            {rank}
          </div>

          {/* Ticker Name */}
          <a
            href={getTradingViewUrl(ticker)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold font-[var(--font-mono)] text-[var(--color-text-primary)] tracking-wide hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            title="Open in TradingView"
          >
            {ticker.replace(/\.(NS|BO)$/, '')}
          </a>

          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap ml-2">
            {/* Pattern Badges */}
            {(patterns || []).map((p) => (
              <span key={p} className={`badge ${BADGE_CLASS[p] || 'badge-vcp'}`}>
                {/* SVG icons mapped from PatternSelector would be nice here, but keeping it simple for now to match the image's text+icon style */}
                {p}
              </span>
            ))}

            {/* RS Badge */}
            <span className={getRSClass(rs)}>
              RS {rs}
            </span>

            {/* Vol Spike */}
            {volSpike && (
              <span className="vol-spike-badge ml-2">
                <Flame size={12} className="mr-1" />
                VOL SPIKE
              </span>
            )}
          </div>
        </div>

        {/* Score on Far Right */}
        <div className="flex flex-col items-end flex-shrink-0 ml-4">
          <div className="score-display">
            {score.toFixed(1)}
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Line: Reason */}
      <div className="pl-12">
        <p className="text-xs font-[var(--font-mono)] text-[var(--color-text-secondary)]">
          {reason}
        </p>
      </div>
    </div>
  )
}
