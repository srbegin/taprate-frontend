/**
 * Which product this frontend is. Each app sets NEXT_PUBLIC_PRODUCT in its
 * next.config.mjs ('taprate' | 'cleanpulse'); shared code reads it here to
 * send the X-Product header and show the right brand name.
 */
const BRANDS = {
  taprate:    { product: 'taprate',    name: 'TapRate' },
  cleanpulse: { product: 'cleanpulse', name: 'Cleanpulse' },
}

const brand = BRANDS[process.env.NEXT_PUBLIC_PRODUCT] ?? BRANDS.taprate

export default brand
