import {
  NIFTY_SYMBOLS,
  BATCH_SIZE,
  BATCH_DELAY_MS,
  RETRY_DELAY_MS,
  YAHOO_RANGE,
  YAHOO_INTERVAL,
} from './constants'

const BASE_URL = import.meta.env.DEV
  ? '/api/yahoo'
  : 'https://corsproxy.io/?https://query1.finance.yahoo.com'

function buildUrl(ticker) {
  return `${BASE_URL}/v8/finance/chart/${encodeURIComponent(ticker)}?range=${YAHOO_RANGE}&interval=${YAHOO_INTERVAL}`
}

function parseOHLCV(ticker, json) {
  try {
    const result = json.chart?.result?.[0]
    if (!result) return { ticker, data: null, error: 'No data' }
    const ts = result.timestamp
    const q = result.indicators?.quote?.[0]
    if (!ts || !q) return { ticker, data: null, error: 'Missing OHLCV' }
    const data = []
    for (let i = 0; i < ts.length; i++) {
      if (q.open[i] != null && q.close[i] != null && q.volume[i] != null) {
        data.push({
          date: new Date(ts[i] * 1000),
          open: q.open[i], high: q.high[i],
          low: q.low[i], close: q.close[i],
          volume: q.volume[i],
        })
      }
    }
    if (!data.length) return { ticker, data: null, error: 'All null' }
    return { ticker, data, error: null }
  } catch (err) {
    return { ticker, data: null, error: err.message }
  }
}

export async function fetchOHLCV(ticker) {
  const url = buildUrl(ticker)
  try {
    let res = await fetch(url)
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
      res = await fetch(url)
    }
    if (!res.ok) return { ticker, data: null, error: `HTTP ${res.status}` }
    const json = await res.json()
    return parseOHLCV(ticker, json)
  } catch (err) {
    return { ticker, data: null, error: err.message }
  }
}

export async function fetchNifty() {
  for (const symbol of NIFTY_SYMBOLS) {
    const result = await fetchOHLCV(symbol)
    if (result.data && result.data.length > 50) return result.data
  }
  throw new Error('Could not fetch Nifty benchmark data. Try again later.')
}

export async function fetchBatch(tickers, onProgress) {
  const results = []
  const skipped = []
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (ticker, idx) => {
        onProgress?.({ current: i + idx + 1, total: tickers.length, ticker })
        return fetchOHLCV(ticker)
      })
    )
    for (const r of batchResults) {
      if (r.data) results.push(r)
      else skipped.push({ ticker: r.ticker, error: r.error })
    }
    if (i + BATCH_SIZE < tickers.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }
  return { results, skipped }
}

export function resolveTickers(rawInput, exchange) {
  const cleaned = rawInput
    .replace(/[,\n\r]+/g, ',')
    .split(',')
    .map(t => t.trim().toUpperCase())
    .filter(t => t.length > 0 && !t.includes('BEES') && !t.includes('ETF'))
  const unique = [...new Set(cleaned)]
  if (exchange === 'NSE') return unique.map(t => t.endsWith('.NS') || t.endsWith('.BO') ? t : `${t}.NS`)
  if (exchange === 'BSE') return unique.map(t => t.endsWith('.NS') || t.endsWith('.BO') ? t : `${t}.BO`)
  return unique
}

async function fetchWithAutoExchange(ticker) {
  if (ticker.endsWith('.NS') || ticker.endsWith('.BO')) return fetchOHLCV(ticker)
  const nse = await fetchOHLCV(`${ticker}.NS`)
  if (nse.data?.length > 0) return nse
  return fetchOHLCV(`${ticker}.BO`)
}

export async function fetchBatchAuto(rawTickers, exchange, onProgress) {
  if (exchange === 'Auto') {
    const results = []
    const skipped = []
    for (let i = 0; i < rawTickers.length; i += BATCH_SIZE) {
      const batch = rawTickers.slice(i, i + BATCH_SIZE)
      const br = await Promise.all(
        batch.map(async (ticker, idx) => {
          onProgress?.({ current: i + idx + 1, total: rawTickers.length, ticker })
          return fetchWithAutoExchange(ticker)
        })
      )
      for (const r of br) {
        if (r.data) results.push(r)
        else skipped.push({ ticker: r.ticker, error: r.error })
      }
      if (i + BATCH_SIZE < rawTickers.length) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
      }
    }
    return { results, skipped }
  }
  const tickers = resolveTickers(rawTickers.join(','), exchange)
  return fetchBatch(tickers, onProgress)
}
