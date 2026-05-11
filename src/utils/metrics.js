import { RS_PREFILTER_THRESHOLD } from './constants'

// ── Simple Moving Average ────────────────────────────────
function sma(closes, period) {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

// ── Average Volume ───────────────────────────────────────
function avgVolume(volumes, period) {
  if (volumes.length < period) return null
  const slice = volumes.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

// ── Compute Metrics for Single Ticker ────────────────────
export function computeMetrics(tickerData, niftyCloses) {
  const { ticker, data } = tickerData
  const closes = data.map(d => d.close)
  const volumes = data.map(d => d.volume)
  const highs = data.map(d => d.high)

  const latestClose = closes[closes.length - 1]
  const ma10 = sma(closes, 10)
  const ma20 = sma(closes, 20)
  const ma50 = sma(closes, 50)
  const ma150 = sma(closes, 150)
  const ma200 = sma(closes, 200)

  // Trending up: Minervini Template
  const trendingUp = ma50 && ma150 && ma200
    ? (latestClose > ma50) && (ma50 > ma150) && (ma150 > ma200) && (latestClose > ma200)
    : (ma10 && ma20 && ma50 ? ma10 > ma20 && ma20 > ma50 * 0.98 : false)

  // Price ranges for volatility contraction
  function getPriceRange(slice) {
    if (!slice.length) return 0;
    const max = Math.max(...slice);
    const min = Math.min(...slice);
    return min > 0 ? ((max - min) / min) * 100 : 0;
  }

  const priceRange60d = getPriceRange(closes.slice(-60));
  const priceRange40d = getPriceRange(closes.slice(-40));
  const priceRange20d = getPriceRange(closes.slice(-20));

  // Non-overlapping segments to measure true left-to-right contraction
  const range1 = getPriceRange(closes.slice(-60, -40));
  const range2 = getPriceRange(closes.slice(-40, -20));
  const range3 = priceRange20d;

  // True contraction means volatility is progressively drying up left-to-right
  const contraction = (range1 > range2 && range2 > range3 && range3 < 10) || 
                      (range2 > range3 && range3 < 10 && range2 > 10);

  // Volume ratios
  const avgVol10 = avgVolume(volumes, 10)
  const avgVol30 = avgVolume(volumes, 30)
  const avgVol50 = avgVolume(volumes, 50)
  const todayVol = volumes[volumes.length - 1]

  const volRatio10v30 = avgVol10 && avgVol30 ? +(avgVol10 / avgVol30).toFixed(2) : null
  const volRatio1v50 = avgVol50 ? +(todayVol / avgVol50).toFixed(2) : null
  const volSpike = volRatio1v50 ? volRatio1v50 > 1.5 : false

  // 52-week high
  const high52w = Math.max(...highs)
  const pctFrom52High = high52w > 0
    ? +((latestClose - high52w) / high52w * 100).toFixed(2)
    : 0

  // Above MA50
  const aboveMA50 = ma50 ? latestClose > ma50 : false

  // RS raw (will be ranked later)
  // Compute momentum score based on 3m and 6m returns
  let return3m = 0
  if (closes.length >= 63) {
    return3m = (closes[closes.length - 1] - closes[closes.length - 63]) / closes[closes.length - 63]
  }

  let return6m = 0
  if (closes.length >= 126) {
    return6m = (closes[closes.length - 1] - closes[closes.length - 126]) / closes[closes.length - 126]
  }

  // Composite momentum score (60% 6-month, 40% 3-month)
  const rawRS = (return6m * 0.6) + (return3m * 0.4)

  return {
    ticker,
    latestClose: +latestClose.toFixed(2),
    ma10: ma10 ? +ma10.toFixed(2) : null,
    ma20: ma20 ? +ma20.toFixed(2) : null,
    ma50: ma50 ? +ma50.toFixed(2) : null,
    ma150: ma150 ? +ma150.toFixed(2) : null,
    ma200: ma200 ? +ma200.toFixed(2) : null,
    trendingUp,
    priceRange60d: +priceRange60d.toFixed(2),
    priceRange40d: +priceRange40d.toFixed(2),
    priceRange20d: +priceRange20d.toFixed(2),
    contraction,
    volRatio10v30,
    volRatio1v50,
    volSpike,
    pctFrom52High,
    aboveMA50,
    rawRS: +rawRS.toFixed(4),
    rsRating: 0, // will be set by percentile ranking
  }
}

// ── Compute RS Percentile Ranking Across Batch ───────────
export function computeRSRatings(metricsArray) {
  const sorted = [...metricsArray].sort((a, b) => a.rawRS - b.rawRS)
  const n = sorted.length

  for (let i = 0; i < n; i++) {
    sorted[i].rsRating = Math.round((i / (n - 1 || 1)) * 100)
  }

  return sorted
}

// ── Pre-filter: drop stocks with RS < threshold ──────────
export function prefilterByRS(metricsArray) {
  return metricsArray.filter(m => m.rsRating >= RS_PREFILTER_THRESHOLD)
}

// ── Format metrics for Claude prompt ─────────────────────
export function formatMetricsForPrompt(m) {
  const spike = m.volSpike ? ' [SPIKE]' : ''
  return `${m.ticker}: close=${m.latestClose}, pctFrom52H=${m.pctFrom52High}%, priceRange60d=${m.priceRange60d}%, priceRange40d=${m.priceRange40d}%, priceRange20d=${m.priceRange20d}%, volRatio10v30=${m.volRatio10v30}, volRatio1v50=${m.volRatio1v50}${spike}, RS=${m.rsRating}, aboveMA50=${m.aboveMA50}, trendingUp=${m.trendingUp}, contraction=${m.contraction}, ma150=${m.ma150}, ma200=${m.ma200}`
}
