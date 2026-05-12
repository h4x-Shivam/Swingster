# Swingster 📈

> Scan Smarter, Swing Harder.

Tired of manually scanning 100s of stocks every morning? Swingster does it in seconds. Paste your tickers, get your top 10 VCP, Flag, Cup & Handle, and Breakout setups — scored by AI, ranked by strength. Built for NSE/BSE swing traders.

---

## What is Swingster?

Swingster is a personal tool I built to automate my daily stock scanning routine as a swing trader. Every morning I used to copy tickers from Chartink, manually check each one for pattern setups, and shortlist the best ones. It was taking 1–2 hours daily.

Swingster collapses that entire workflow into a single scan. Paste your Chartink tickers, select which patterns you're hunting for, and the AI engine fetches live OHLCV data, computes key metrics, and returns your top 10 setups — ranked by pattern strength, Relative Strength Rating, and volume confirmation.

It follows Mark Minervini's SEPA methodology — only stage 2 stocks, only market leaders, only setups with volume confirmation.

---

## Features

- **Pattern Scanner** — Scans for VCP, Cup & Handle, Flag, and Breakout setups
- **AI Scoring** — Groq AI scores every stock 0–100 based on pattern quality
- **RS Rating** — Relative Strength Rating vs Nifty 50, percentile ranked across your batch
- **Volume Spike Alert** — Flags stocks where volume is 1.5× above 50-day average
- **Pre-filtering** — Automatically drops stocks with RS < 60 before AI analysis
- **Pattern Selection** — Choose which patterns to scan for, AI only scores those
- **NSE / BSE Support** — Toggle between NSE (.NS) and BSE (.BO) tickers
- **CSV Export** — Download your top 10 picks with full metrics
- **BYOK** — Bring your own Groq API key, stored locally in your browser

---

## How It Works

1. Paste tickers from your Chartink scanner (comma or newline separated)
2. Select which patterns to scan for
3. Hit Run Scanner
4. Swingster fetches 6 months of daily OHLCV data from Yahoo Finance for every ticker + Nifty 50 benchmark
5. Computes MA10/20/50, contraction %, volume ratios, RS Rating, 52-week high distance
6. Drops stocks with RS Rating below 60
7. Sends remaining stocks to Groq AI with only your selected patterns
8. Returns top 10 setups ranked by score with pattern badges, RS badge, volume spike alert, and a one-line reason

---

## Metrics Computed Per Stock

| Metric | Description |
|--------|-------------|
| MA10 / MA20 / MA50 | Simple moving averages of close price |
| trendingUp | MA10 > MA20 > MA50 — confirms stage 2 uptrend |
| priceRange20d | Price contraction % over last 20 days |
| volRatio10v30 | Avg volume last 10d vs last 30d — detects drying volume |
| volRatio1v50 | Today's volume vs 50-day avg — detects spikes |
| pctFrom52High | How far the stock is from its 52-week high |
| RS Rating | 3-month return vs Nifty 50, percentile ranked across batch |

---

## Pattern Scoring Criteria

**VCP (Volatility Contraction Pattern)**
- Trending up (MA10 > MA20 > MA50)
- Price contracting under 8% over last 20 days
- Volume drying up (volRatio10v30 < 0.8)
- Within 15% of 52-week high

**Cup & Handle**
- Within 20% of 52-week high
- Prior correction of 20–35%
- Smooth recovery with handle range under 5%
- Volume lower in handle than in cup

**Flag**
- Strong prior move (15%+ in under 20 days)
- Tight consolidation under 8%
- Holding above MA20
- Volume contracting inside the flag

**Breakout**
- Price within 3% of 52-week high or actively breaking out
- Volume spike confirmed (volRatio1v50 > 1.5)
- Above all moving averages

---

## Scoring Bonuses and Penalties

| Condition | Effect |
|-----------|--------|
| RS Rating > 80 | +8 points |
| Volume spike on VCP or Flag base | +10 points |
| Above MA50 + trending up | +5 points |
| RS Rating < 65 | −10 points |
| Price below MA50 | −15 points |
| Price range > 15% in 20 days | −10 points |

---

## Tech Stack

- **Frontend** — React + Tailwind CSS v4
- **Data** — Yahoo Finance public API (OHLCV)
- **AI** — Groq API
- **Build** — Vite
- **Icons** — Lucide React
- **No backend, no database, no server** — pure client-side

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Groq API key — get one at [console.groq.com](https://console.groq.com)

### Installation

```bash
git clone https://github.com/h4x-Shivam/Swingster.git
cd Swingster
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Usage

1. Enter your Groq API key in the header (stored locally in your browser, never sent anywhere except directly to Groq)
2. Paste your NSE/BSE tickers from Chartink
3. Select your exchange (NSE / BSE)
4. Select which patterns to scan for
5. Hit **Run Scanner**
6. Export results as CSV if needed

---

## API Key Security

Swingster uses a BYOK (Bring Your Own Key) architecture. Your Groq API key is:
- Entered by you directly in the UI
- Stored only in your browser's localStorage
- Sent exclusively to Groq's API endpoint — nowhere else
- Never included in the codebase or pushed to GitHub

This is a personal tool. Do not share your deployed instance publicly unless you've moved to a backend architecture.

---

## Limitations

- Yahoo Finance is the data source — occasionally unreliable for some NSE/BSE symbols
- CORS proxy (`corsproxy.io`) is used in production builds — free tier, may be rate limited under heavy use
- No scan history — results are not saved between sessions
- Designed for personal use — not built to scale to multiple concurrent users

---

## Roadmap

- [ ] Scan history — save and review past scans
- [ ] Performance tracking — did the setup play out?
- [ ] Telegram / WhatsApp alert integration
- [ ] Support for weekly timeframe scans
- [ ] Proper backend to remove CORS dependency

---

## Disclaimer

Swingster is a personal productivity tool for organizing and filtering stock watchlists. It is not financial advice. All trading decisions are your own responsibility. Past pattern performance does not guarantee future results.

---

## Author

Built by a swing trader, for swing traders.

If this saves you time in your morning routine — that's the whole point.

— Shivam
