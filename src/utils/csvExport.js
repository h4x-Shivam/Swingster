export function exportToCSV(results) {
  const headers = ['Ticker', 'Score', 'RS Rating', 'Vol Ratio', 'Vol Spike', 'Patterns', 'Reason']
  const rows = results.map(r => [
    r.ticker,
    r.score,
    r.rs,
    r.volRatio1v50 ?? '',
    r.volSpike ? 'Yes' : 'No',
    `"${(r.patterns || []).join(', ')}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `swingster_results_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
