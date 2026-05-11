import { Download } from 'lucide-react'
import { exportToCSV } from '../utils/csvExport'

export default function CSVExport({ results, disabled }) {
  if (!results || results.length === 0) return null

  return (
    <button
      onClick={() => exportToCSV(results)}
      disabled={disabled}
      className="export-btn"
      title="Download results as CSV"
    >
      <Download size={16} />
      Export CSV
    </button>
  )
}
