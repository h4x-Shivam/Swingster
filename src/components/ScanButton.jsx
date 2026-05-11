import { ShieldCheck } from 'lucide-react'

export default function ScanButton({ onClick, disabled, scanning }) {
  return (
    <div className="space-y-3 pt-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className="scan-btn"
      >
        {scanning ? (
          <>
            <span className="spinner" />
            Scanning...
          </>
        ) : (
          '>_ Run Scanner'
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs-mono text-[var(--color-text-muted)]">
        <ShieldCheck size={12} className="text-[var(--color-accent-dim)]" />
        <span>We respect rate limits. No spam. Ever.</span>
      </div>
    </div>
  )
}
