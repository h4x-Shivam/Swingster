import { useState, useEffect } from 'react'
import { User } from 'lucide-react'

export default function Header({ apiKey, onApiKeyChange }) {
  const [localKey, setLocalKey] = useState(apiKey || '')

  useEffect(() => {
    setLocalKey(apiKey || '')
  }, [apiKey])

  function handleBlur() {
    onApiKeyChange(localKey.trim())
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Tagline */}
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold font-[var(--font-mono)] tracking-tight text-[var(--color-accent)]">
            Swingster
          </h1>
          <span className="hidden sm:block text-sm text-[var(--color-text-muted)] font-[var(--font-mono)]">
            Chart patterns. Quantified.
          </span>
        </div>

        {/* Right: Navigation + User */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6 font-[var(--font-mono)] text-sm">
            <a href="#" className="text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-1">
              &gt;_ Scanner
            </a>
            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Watchlist
            </a>
            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Alerts
            </a>
            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Docs
            </a>
          </nav>

          <div className="flex items-center gap-4 border-l border-[var(--color-border)] pl-8">
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="API Key..."
              className="header-api-key"
              autoComplete="off"
              spellCheck="false"
              title="Groq API Key"
            />
            <div className="w-8 h-8 rounded-full border border-[var(--color-text-muted)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] cursor-pointer transition-colors">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
