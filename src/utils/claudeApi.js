import {
  AI_MODEL,
  AI_MAX_TOKENS,
  GROQ_API_URL,
} from './constants'
import { formatMetricsForPrompt } from './metrics'

const SYSTEM_PROMPT = `You are an expert swing trader and technical analyst specializing in momentum stocks on NSE/BSE. You strictly follow Mark Minervini's SEPA methodology. Your job is to score stocks based on computed OHLCV metrics and return structured JSON — nothing else.`

function buildUserPrompt(metricsArray, selectedPatterns) {
  const patternList = selectedPatterns.join(', ')
  const stockLines = metricsArray.map(formatMetricsForPrompt).join('\n')

  return `Analyze the following NSE/BSE stocks for swing trading setups.
The user has selected these patterns to scan for: ${patternList}
Score each stock 0–100 ONLY for the selected patterns. Ignore all other patterns completely.

SCORING GUIDELINES (apply only for selected patterns):

- VCP SCORING (STRICT RULES — follow exactly):
  HARD CAPS (non-negotiable):
  - Score CANNOT exceed 40 if ANY of these are false: hasExplosiveThrust, baseFormingAfterThrust, buyVolDominance.
  - Score CANNOT exceed 60 unless ALL of these are true: contraction=true, tightBase=true, AND volRatio10v30 < 0.8.

  BONUS POINTS (stackable, add to base score):
  - udRatio > 2.5: add 12 points
  - udRatio > 1.5 (but <= 2.5): add 6 points
  - priceRange20d < 5% AND tightBase=true: add 8 points
  - pctFrom52H > -8%: add 6 points
  - daysSincePeak between 10 and 25: add 5 points

  PENALTY POINTS (stackable, subtract from score):
  - hasExplosiveThrust=false: subtract 25 points
  - buyVolDominance=false: subtract 20 points
  - baseFormingAfterThrust=false: subtract 20 points
  - avgBodyPct > 4%: subtract 10 points
  - priceRange20d > 12%: subtract 10 points
  - pctFrom52H < -20%: subtract 15 points

- Cup & Handle: Look for pctFrom52H > -25%, handle range < 8%, and volume contraction.
- Flag: Look for tight consolidation (priceRange20d < 10%), aboveMA50=true, and volume contracting.
- Breakout: Look for pctFrom52H > -5% OR actively breaking out, volSpike=true, and price > ma150.

GENERAL BONUSES (Stackable, all patterns):
- Exceptionally high RS (RS > 85): add 10 points
- volSpike on a tight VCP or Flag base: add 10 points
- Perfect Minervini Trend (trendingUp=true AND aboveMA50=true AND price > ma150 AND ma150 > ma200): add 15 points

GENERAL PENALTIES (Stackable, all patterns):
- Weak Momentum (RS < 50): subtract 20 points
- Broken Trend (close < ma200 OR ma150 < ma200): subtract 20 points
- Loose Action (priceRange20d > 15% for VCP/Flag): subtract 15 points

STOCK DATA:
${stockLines}

Each stock line includes inline tags: [THRUST]=explosive thrust detected, [TIGHT]=tight base, [BUYERS]/[SELLERS]=buy vs sell volume dominance, [SPIKE]=volume spike.

Return ONLY a JSON array, no markdown, no explanation:
[{
  "ticker": "SYMBOL",
  "score": 82,
  "patterns": ["VCP", "Breakout"],
  "rs": 78,
  "volSpike": true,
  "reason": "One sentence: why this stock qualifies right now"
}]

Include only stocks with score >= 50. Sort by score descending. Return max 10.`
}

export async function analyzeStocks(metricsArray, selectedPatterns, apiKey) {
  const userPrompt = buildUserPrompt(metricsArray, selectedPatterns)

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    if (response.status === 401) throw new Error('Invalid API key. Check your Groq API key.')
    if (response.status === 429) throw new Error('Rate limited by Groq API. Wait a moment and try again.')
    throw new Error(`Groq API error (${response.status}): ${errBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  // Parse JSON — Claude might wrap in backticks
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const results = JSON.parse(cleaned)
    if (!Array.isArray(results)) throw new Error('Response is not an array')
    return results
  } catch (err) {
    throw new Error(`Failed to parse Claude response as JSON: ${err.message}\nRaw: ${cleaned.slice(0, 300)}`)
  }
}
