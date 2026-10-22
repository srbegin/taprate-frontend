/**
 * Which product this frontend is. Each app sets NEXT_PUBLIC_PRODUCT in its
 * next.config.mjs ('taprate' | 'cleanpulse'); shared code reads it here to
 * send the X-Product header and show the right brand name and wordmark.
 * Accent colours come from each app's globals.css (`brand` theme colours);
 * surveyTheme picks the customer survey look (survey/theme.js), uiTheme the
 * auth/setup screens (ui/theme.js).
 */
const BRANDS = {
  taprate:    { product: 'taprate',    name: 'TapRate',    wordmark: ['Tap', 'Rate'],    hasLegalPages: true,  surveyTheme: 'dark',  uiTheme: 'dark' },
  // Cleanpulse legal pages don't exist yet — Terms/Privacy links stay hidden until they do.
  cleanpulse: { product: 'cleanpulse', name: 'Cleanpulse', wordmark: ['Clean', 'pulse'], hasLegalPages: true,  surveyTheme: 'light', uiTheme: 'light' },
}

const brand = BRANDS[process.env.NEXT_PUBLIC_PRODUCT] ?? BRANDS.taprate

// Each brand's public site, for cross-brand redirects (e.g. a Cleanpulse tag
// tapped on taprate.app). Overridable for local dev.
export const SITE_URLS = {
  taprate:    process.env.NEXT_PUBLIC_TAPRATE_URL    || 'https://taprate.app',
  cleanpulse: process.env.NEXT_PUBLIC_CLEANPULSE_URL || 'https://cleanpulse.app',
}

export default brand
