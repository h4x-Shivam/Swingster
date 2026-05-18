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
  const opens = data.map(d => d.open)
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

  // ── Explosive Thrust Detection ───────────────────────────
  // Check for 2+ big green candles with above-avg volume in the 60-to-15 day ago window
  let hasExplosiveThrust = false
  const avgVol50ForThrust = avgVol50 // reuse 50-day avg volume
  if (data.length >= 15) {
    const windowStart = Math.max(0, data.length - 60)
    const windowEnd = data.length - 15
    if (windowEnd > windowStart) {
      let thrustCount = 0
      for (let i = windowStart; i < windowEnd; i++) {
        const d = data[i]
        const bodyPct = d.open > 0 ? ((d.close - d.open) / d.open) * 100 : 0
        const isGreen = d.close > d.open
        const isBigBody = bodyPct > 3
        const isAboveAvgVol = avgVol50ForThrust ? d.volume > avgVol50ForThrust : false
        if (isGreen && isBigBody && isAboveAvgVol) {
          thrustCount++
        }
      }
      hasExplosiveThrust = thrustCount >= 2
    }
  }

  // ── Thrust Peak Timing ───────────────────────────────────
  // Find the highest close in last 60 days and how many days ago it was
  const last60Closes = closes.slice(-Math.min(60, closes.length))
  let peakClose = -Infinity
  let peakIdx = 0
  for (let i = 0; i < last60Closes.length; i++) {
    if (last60Closes[i] > peakClose) {
      peakClose = last60Closes[i]
      peakIdx = i
    }
  }
  const daysSincePeak = last60Closes.length - 1 - peakIdx
  const baseFormingAfterThrust = daysSincePeak >= 5 && daysSincePeak <= 30

  // ── Tight Base Detection ─────────────────────────────────
  // Average candle body size as % of open over last 15 days
  const last15 = data.slice(-Math.min(15, data.length))
  let totalBodyPct = 0
  let validBodyCount = 0
  for (const d of last15) {
    if (d.open > 0) {
      totalBodyPct += Math.abs(d.close - d.open) / d.open * 100
      validBodyCount++
    }
  }
  const avgBodyPct = validBodyCount > 0 ? +(totalBodyPct / validBodyCount).toFixed(2) : 0
  const tightBase = avgBodyPct < 2.5

  // ── Buy / Sell Volume Separation ─────────────────────────
  // Split last 20 days into up days (close > open) and down days (close <= open)
  const last20Data = data.slice(-Math.min(20, data.length))
  let buyVol = 0
  let sellVol = 0
  let upDayVolumes = []
  let downDayVolumes = []
  for (const d of last20Data) {
    if (d.close > d.open) {
      buyVol += d.volume
      upDayVolumes.push(d.volume)
    } else {
      sellVol += d.volume
      downDayVolumes.push(d.volume)
    }
  }
  const buyVolDominance = buyVol > sellVol
  const buyVolRatio = sellVol > 0 ? +(buyVol / sellVol).toFixed(2) : (buyVol > 0 ? 999 : 0)
  const avgUpDayVol = upDayVolumes.length > 0
    ? upDayVolumes.reduce((a, b) => a + b, 0) / upDayVolumes.length
    : 0
  const avgDownDayVol = downDayVolumes.length > 0
    ? downDayVolumes.reduce((a, b) => a + b, 0) / downDayVolumes.length
    : 0
  const udRatio = avgDownDayVol > 0 ? +(avgUpDayVol / avgDownDayVol).toFixed(2) : (avgUpDayVol > 0 ? 999 : 0)

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
    // New VCP metrics
    hasExplosiveThrust,
    daysSincePeak,
    baseFormingAfterThrust,
    avgBodyPct,
    tightBase,
    buyVol,
    sellVol,
    buyVolDominance,
    buyVolRatio,
    udRatio,
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
  const tags = [
    m.hasExplosiveThrust ? '[THRUST]' : '',
    m.tightBase ? '[TIGHT]' : '',
    m.buyVolDominance ? '[BUYERS]' : '[SELLERS]',
    m.volSpike ? '[SPIKE]' : '',
  ].filter(Boolean).join(' ')
  const tagStr = tags ? ` ${tags}` : ''
  const ma150Str = m.ma150 != null ? m.ma150 : 'N/A'
  const ma200Str = m.ma200 != null ? m.ma200 : 'N/A'
  return `${m.ticker}: close=${m.latestClose}, pctFrom52H=${m.pctFrom52High}%, priceRange60d=${m.priceRange60d}%, priceRange40d=${m.priceRange40d}%, priceRange20d=${m.priceRange20d}%, volRatio10v30=${m.volRatio10v30}, volRatio1v50=${m.volRatio1v50}, RS=${m.rsRating}, aboveMA50=${m.aboveMA50}, trendingUp=${m.trendingUp}, contraction=${m.contraction}, ma150=${ma150Str}, ma200=${ma200Str}, hasExplosiveThrust=${m.hasExplosiveThrust}, daysSincePeak=${m.daysSincePeak}, baseFormingAfterThrust=${m.baseFormingAfterThrust}, avgBodyPct=${m.avgBodyPct}%, tightBase=${m.tightBase}, buyVolDominance=${m.buyVolDominance}, buyVolRatio=${m.buyVolRatio}, udRatio=${m.udRatio}${tagStr}`
}
