import { useState, useEffect } from 'react'
import Header from './components/Header'
import TickerInput from './components/TickerInput'
import PatternSelector from './components/PatternSelector'
import ScanButton from './components/ScanButton'
import ProgressBar from './components/ProgressBar'
import ResultsPanel from './components/ResultsPanel'
import CSVExport from './components/CSVExport'
import { useScanner } from './hooks/useScanner'

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [rawTickers, setRawTickers] = useState('')
  const [exchange, setExchange] = useState('NSE') // NSE, BSE, Auto
  const [selectedPatterns, setSelectedPatterns] = useState(new Set(['VCP', 'Cup & Handle', 'Flag', 'Breakout']))

  const { scan, reset, status, progress, results, error, skippedCount } = useScanner()

  // Load API key from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('swingster_api_key')
    if (stored) setApiKey(stored)
  }, [])

  function handleApiKeyChange(newKey) {
    setApiKey(newKey)
    if (newKey) localStorage.setItem('swingster_api_key', newKey)
    else localStorage.removeItem('swingster_api_key')
  }

  function handleScan() {
    scan(rawTickers, Array.from(selectedPatterns), exchange, apiKey)
  }

  const isScanning = status === 'fetching' || status === 'computing' || status === 'analyzing'
  const isInputDisabled = isScanning

  return (
    <div className="min-h-screen flex flex-col selection:bg-[var(--color-accent)] selection:text-black">
      <Header apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
        
        {/* Left Column: Controls (Solid Panel) */}
        <div className="side-panel h-fit space-y-8">
          <TickerInput
            value={rawTickers}
            onChange={setRawTickers}
            exchange={exchange}
            onExchangeChange={setExchange}
          />

          <PatternSelector
            selected={selectedPatterns}
            onChange={setSelectedPatterns}
            error={selectedPatterns.size === 0 && !isScanning ? 'Select at least one pattern' : null}
          />

          <ScanButton
            onClick={handleScan}
            disabled={isInputDisabled || rawTickers.length === 0 || selectedPatterns.size === 0}
            scanning={isScanning}
          />

          <ProgressBar
            status={status}
            progress={progress}
            skippedCount={skippedCount}
          />
        </div>

        {/* Right Column: Results */}
        <div className="min-w-0">
          <ResultsPanel
            status={status}
            results={results}
            error={error}
            onRetry={handleScan}
          />
        </div>

      </main>

      {/* Footer / Export */}
      {status === 'done' && results.length > 0 && (
        <footer className="w-full py-6 mt-auto">
          <div className="max-w-[1400px] mx-auto px-6 flex justify-end">
            <CSVExport results={results} />
          </div>
        </footer>
      )}
    </div>
  )
}
