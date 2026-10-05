/**
 * TapRate dashboard theme
 *
 * All visual design decisions live here.
 * Import `theme` wherever you need styling constants — Sidebar, layouts, page headers, etc.
 * To restyle the entire dashboard, edit this file only.
 */

const theme = {
  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebar: {
    bg: 'bg-[#0e0e11]',
    border: 'border-r border-white/5',
    width: 'w-56',

    logo: {
      text: 'text-white font-semibold text-sm tracking-tight',
      icon: 'text-violet-400',
      orgName: 'text-white/30 text-xs mt-1 truncate',
    },

    nav: {
      // Active item
      active: 'bg-white/10 text-white',
      // Inactive item
      inactive: 'text-white/40 hover:bg-white/5 hover:text-white/80',
      // Shared
      base: 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
      // Active indicator dot (shown left of active item)
      dot: 'w-1 h-1 rounded-full bg-violet-400',
    },

    footer: {
      border: 'border-t border-white/5',
      name: 'text-xs font-medium text-white/60 truncate',
      email: 'text-xs text-white/25 truncate',
      signOut: 'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors',
    },
  },

  // ── Mobile top bar ─────────────────────────────────────────────────────────
  topBar: {
    bg: 'bg-[#0e0e11] border-b border-white/5',
    text: 'text-white font-semibold text-sm tracking-tight',
    icon: 'text-violet-400',
    menuButton: 'p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors',
  },

  // ── Main content area ──────────────────────────────────────────────────────
  main: {
    bg: 'bg-[#f5f5f7]',
    // Padding: tighter on mobile (accounts for fixed top bar), comfortable on desktop
    padding: 'p-6 md:p-8 pt-20 md:pt-8',
  },

  // ── Accent color (used sparingly — active states, badges, highlights) ──────
  accent: {
    color: '#7c6ff7',       // violet-ish purple
    tailwind: 'violet-400', // for tailwind classes where needed
  },
}

export default theme