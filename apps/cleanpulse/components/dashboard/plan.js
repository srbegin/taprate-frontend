// Plan wording from the organization payload (its billing keys describe the
// request's product — Cleanpulse here). `plan` reads 'free' while trialing.

export function planState(org) {
  if (!org) return 'unknown'
  if (org.subscription_status === 'active') return 'active'
  if (org.trial_ends_at && new Date(org.trial_ends_at) > new Date()) return 'trial'
  if (org.trial_ends_at) return 'expired'
  return 'none'
}

export function planSummary(org) {
  switch (planState(org)) {
    case 'active':
      return `${org.plan.charAt(0).toUpperCase()}${org.plan.slice(1)} plan`
    case 'trial': {
      const days = org.trial_days_remaining   // whole days, so 0 on the last day
      return days ? `Free trial · ${days} day${days !== 1 ? 's' : ''} left` : 'Free trial · ends today'
    }
    case 'expired':
      return 'Free trial ended'
    default:
      return 'No plan yet'
  }
}
