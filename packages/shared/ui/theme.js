import brand from '../brand'

// Neutral surfaces/text for shared auth + setup screens, per brand
// (brand.uiTheme). Accents come from the app's `brand-*` colours.
// 'dark' = the original TapRate classes — keep them exactly as they were.
export const UI_THEMES = {
  dark: {
    page:       'bg-[#0e0e11]',
    card:       'bg-[#1a1a1f] border border-white/10',
    title:      'text-white',
    sub:        'text-white/40',
    label:      'text-white/50',
    input:      'bg-white/5 border border-white/10',
    inputText:  'text-white placeholder-white/20',
    error:      'text-red-400 bg-red-500/10 border border-red-500/20',
    errorTile:  'bg-red-500/10 border border-red-500/20',
    errorIcon:  'text-red-400',
    footer:     'text-white/30',
    faint:      'text-white/25',
    emphasis:   'text-white/60',
    legal:      'text-zinc-500',
    legalHover: 'hover:text-zinc-300',
    wordmark:   'text-white',
  },
  light: {
    page:       'bg-stone-50',
    card:       'bg-white border border-stone-200 shadow-sm',
    title:      'text-stone-900',
    sub:        'text-stone-500',
    label:      'text-stone-600',
    input:      'bg-white border border-stone-300',
    inputText:  'text-stone-900 placeholder-stone-400',
    error:      'text-red-700 bg-red-50 border border-red-200',
    errorTile:  'bg-red-50 border border-red-200',
    errorIcon:  'text-red-600',
    footer:     'text-stone-500',
    faint:      'text-stone-500',
    emphasis:   'text-stone-700',
    legal:      'text-stone-500',
    legalHover: 'hover:text-stone-800',
    wordmark:   'text-stone-900',
  },
}

const U = UI_THEMES[brand.uiTheme] ?? UI_THEMES.dark

export default U
