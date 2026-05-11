import { useState, useCallback } from 'react'
import { fetchNifty, fetchBatchAuto, resolveTickers } from '../utils/yahooFinance'
import { computeMetrics, computeRSRatings, prefilterByRS } from '../utils/metrics'
import { analyzeStocks } from '../utils/claudeApi'
import { MIN_STOCKS_AFTER_FILTER } from '../utils/constants'

export function useScanner() {
  const [status, setStatus] = useState('idle') // idle | fetching | computing | analyzing | done | error
  const [progress, setProgress] = useState({ current: 0, total: 0, ticker: '' })
  const [results, setResults] = useState([])
  const [metricsMap, setMetricsMap] = useState({})
  const [error, setError] = useState(null)
  const [skippedCount, setSkippedCount] = useState(0)

  const scan = useCallback(async (rawInput, selectedPatterns, exchange, apiKey) => {
    // Runtime guard: API key
    if (!apiKey || apiKey.trim() === '') {
      setError('Please enter your Groq API key in the header to run a scan.')
      setStatus('error')
      return
    }

    // Runtime guard: patterns
    if (!selectedPatterns || selectedPatterns.length === 0) {
      setError('Select at least one pattern to scan for.')
      setStatus('error')
      return
    }

    // Parse tickers
    const parsed = rawInput
      .replace(/[,\n\r]+/g, ',')
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0)
    const unique = [...new Set(parsed)]

    if (unique.length === 0) {
      setError('Paste at least one ticker symbol to scan.')
      setStatus('error')
      return
    }

    setError(null)
    setResults([])
    setMetricsMap({})
    setSkippedCount(0)

    try {
      // 1. Fetch Nifty benchmark
      setStatus('fetching')
      setProgress({ current: 0, total: unique.length + 1, ticker: 'NIFTYBEES.NS (benchmark)' })

      const niftyData = await fetchNifty()
      const niftyCloses = niftyData.map(d => d.close)

      // 2. Fetch all tickers
      const { results: fetchedResults, skipped } = await fetchBatchAuto(
        unique, exchange,
        (p) => setProgress({ current: p.current + 1, total: unique.length + 1, ticker: p.ticker })
      )

      setSkippedCount(skipped.length)

      if (fetchedResults.length === 0) {
        setError('No valid data returned for any ticker. Check your symbols and try again.')
        setStatus('error')
        return
      }

      // 3. Compute metrics
      setStatus('computing')

      const allMetrics = fetchedResults.map(r => computeMetrics(r, niftyCloses))
      const ranked = computeRSRatings(allMetrics)

      // 4. Pre-filter by RS
      const filtered = prefilterByRS(ranked)

      if (filtered.length < MIN_STOCKS_AFTER_FILTER) {
        setError(`Not enough strong setups in this batch (only ${filtered.length} passed RS filter). Try more tickers.`)
        setStatus('error')
        return
      }

      // Store metrics for CSV export enrichment
      const mMap = {}
      for (const m of ranked) mMap[m.ticker] = m
      setMetricsMap(mMap)

      // 5. Send to Claude
      setStatus('analyzing')

      const aiResults = await analyzeStocks(filtered, selectedPatterns, apiKey)

      // Enrich results with volRatio from computed metrics
      const enriched = aiResults.map(r => {
        const m = mMap[r.ticker] || mMap[`${r.ticker}.NS`] || mMap[`${r.ticker}.BO`]
        return {
          ...r,
          volRatio1v50: m?.volRatio1v50 ?? null,
        }
      })

      setResults(enriched)
      setStatus('done')

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResults([])
    setError(null)
    setProgress({ current: 0, total: 0, ticker: '' })
    setSkippedCount(0)
    setMetricsMap({})
  }, [])

  return { scan, reset, status, progress, results, metricsMap, error, skippedCount }
}
