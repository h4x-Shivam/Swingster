// ── Pattern Definitions ──────────────────────────────────

export const PATTERNS = [
  { key: 'VCP', label: 'VCP', color: 'vcp', description: 'Volatility Contraction Pattern' },
  { key: 'Cup & Handle', label: 'Cup & Handle', color: 'cup', description: 'Cup and Handle formation' },
  { key: 'Flag', label: 'Flag', color: 'flag', description: 'Bull Flag consolidation' },
  { key: 'Breakout', label: 'Breakout', color: 'breakout', description: 'Price breakout setup' },
]

// ── Exchange Definitions ─────────────────────────────────

export const EXCHANGES = [
  { key: 'NSE', label: 'NSE', suffix: '.NS' },
  { key: 'BSE', label: 'BSE', suffix: '.BO' },
  { key: 'Auto', label: 'Auto', suffix: null },
]

// ── Nifty Benchmark Symbols ──────────────────────────────

export const NIFTY_SYMBOLS = ['NIFTYBEES.NS', '^NSEI']

// ── Groq API ───────────────────────────────────────────

export const AI_MODEL = 'llama-3.3-70b-versatile'
export const AI_MAX_TOKENS = 2048
export const GROQ_API_URL = import.meta.env.DEV
  ? 'https://corsproxy.io/?https://api.groq.com/openai/v1/chat/completions'
  : 'https://corsproxy.io/?https://api.groq.com/openai/v1/chat/completions'

// ── Scoring Thresholds ───────────────────────────────────

export const RS_PREFILTER_THRESHOLD = 60
export const MIN_STOCKS_AFTER_FILTER = 3
export const MIN_SCORE_TO_SHOW = 50
export const MAX_RESULTS = 10

// ── Fetch Config ─────────────────────────────────────────

export const BATCH_SIZE = 5
export const BATCH_DELAY_MS = 200
export const RETRY_DELAY_MS = 1000
export const YAHOO_RANGE = '1y'
export const YAHOO_INTERVAL = '1d'
