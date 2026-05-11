import { Info, Activity, Coffee, Flag as FlagIcon, Zap } from 'lucide-react'
import { PATTERNS } from '../utils/constants'

// Map pattern keys to icons for the rows
const ICON_MAP = {
  'VCP': <Activity size={16} />,
  'Cup & Handle': <Coffee size={16} />,
  'Flag': <FlagIcon size={16} />,
  'Breakout': <Zap size={16} />
}

export default function PatternSelector({ selected, onChange, error }) {
  function toggle(key) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <h2 className="section-heading mb-0">
        2. SELECT PATTERNS TO SCAN
        <Info size={14} className="text-[var(--color-text-muted)] ml-1" />
      </h2>

      <div className="space-y-2">
        {PATTERNS.map((p) => {
          const isActive = selected.has(p.key)
          return (
            <div 
              key={p.key} 
              className={`pattern-row pattern-row-${p.color} ${isActive ? 'active' : ''}`}
              onClick={() => toggle(p.key)}
            >
              <div className="pattern-name">
                {ICON_MAP[p.key]}
                {p.label}
              </div>
              <input 
                type="checkbox" 
                className={`toggle-switch toggle-switch-${p.color}`}
                checked={isActive}
                readOnly
              />
            </div>
          )
        })}
      </div>

      {error && (
        <div className="text-red-500 text-xs font-[var(--font-mono)] mt-2">
          {error}
        </div>
      )}
    </div>
  )
}
