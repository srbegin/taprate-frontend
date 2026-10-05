/**
 * One-tap issue suggestions for the issues-question editor, per product.
 * Businesses can rename them or add their own; these are only starting points.
 */
const ISSUE_PRESETS = {
  cleanpulse: [
    'Out of toilet paper',
    'Out of soap',
    'Out of paper towels',
    'Needs cleaning',
    'Trash is full',
    'Toilet clogged',
    'Sink or faucet problem',
    'Bad odor',
    'Wet floor',
    'Hand dryer not working',
  ],
  taprate: [
    'Long wait',
    'Order was wrong',
    'Staff was unfriendly',
    'Area was dirty',
    'Item unavailable',
    'Too noisy',
    'Too expensive',
  ],
}

export const DEFAULT_ISSUES_QUESTION = 'Anything need attention?'

export function issuePresetsFor(product) {
  return ISSUE_PRESETS[product] ?? ISSUE_PRESETS.taprate
}
