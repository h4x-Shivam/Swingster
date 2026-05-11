import { Info } from 'lucide-react'
import { EXCHANGES } from '../utils/constants'

export default function TickerInput({ value, onChange, exchange, onExchangeChange }) {
  // Rough character count
  const charCount = value.length
  
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="section-heading mb-0">
          1. PASTE STOCK TICKERS
          <Info size={14} className="text-[var(--color-text-muted)] ml-1" />
        </h2>
        
        {/* Subtle Exchange Selector */}
        <div className="flex gap-2">
          {EXCHANGES.map((ex) => (
            <button
              key={ex.key}
              type="button"
              onClick={() => onExchangeChange(ex.key)}
              className={`text-xs-mono px-2 py-1 rounded transition-colors ${
                exchange === ex.key 
                  ? 'bg-[var(--color-border)] text-[var(--color-text-primary)]' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="AAPL MSFT NVDA AMZN GOOGL META&#10;TSLA NFLX CRM PLTR AMD SMCI"
        className="ticker-textarea"
        spellCheck="false"
        autoComplete="off"
      />

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs-mono">
        <span>One ticker per space, comma, or newline.</span>
        <span>{charCount} / 5000</span>
      </div>
    </div>
  )
}
