// Small display helpers for the dashboard.

export function timeAgo(iso) {
  if (!iso) return null
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

// Chips for a restroom's open alerts: issues first (most reported first),
// then all low ratings folded into one — "Out of soap ×5", "2 low ratings · lowest 1★"
export function alertChips(alerts) {
  const issues = alerts
    .filter(a => a.kind === 'issue')
    .sort((a, b) => (b.report_count || 1) - (a.report_count || 1))
    .map(a => ({ key: a.id, label: a.report_count > 1 ? `${a.issue_label} ×${a.report_count}` : a.issue_label }))
  const low = alerts.filter(a => a.kind !== 'issue')
  if (low.length) {
    const lowest = Math.min(...low.map(a => a.rating))
    issues.push({
      key: 'low',
      label: low.length > 1 ? `${low.length} low ratings · lowest ${lowest}★` : `Low rating · ${lowest}★`,
    })
  }
  return issues
}
