/**
 * Modern theme tokens — opt-in extended design tokens.
 *
 * These tokens add an extra layer of visual polish (rounder radii, layered
 * shadows, glass surfaces, subtle gradients, motion easings) without
 * affecting the default Tigercat visual.
 *
 * Two layers:
 *  1. `MODERN_BASE_TOKENS_LIGHT/DARK` — safe fallback values that keep the
 *     current v1.0.x visual exactly. These are always injected at `:root`
 *     so component CSS like `var(--tiger-radius-md, 0.5rem)` resolves.
 *  2. `MODERN_OVERRIDE_TOKENS_LIGHT/DARK` — the actual "modern" look, only
 *     applied when `data-tiger-style="modern"` is set on a parent.
 *
 * @module themes/modern/tokens
 * @since 1.1.0
 */

/**
 * Default (fallback) values that match the current v1.0.x visual.
 * Always injected at `:root` by the Tailwind plugin so consumers can already
 * reference the new token names safely.
 */
export const MODERN_BASE_TOKENS_LIGHT: Record<string, string> = {
  // Radius (matches existing rounded-md/lg/xl)
  '--tiger-radius-sm': '0.375rem',
  '--tiger-radius-md': '0.5rem',
  '--tiger-radius-lg': '0.75rem',
  '--tiger-radius-xl': '1rem',
  '--tiger-radius-pill': '9999px',

  // Shadows (Tailwind defaults)
  '--tiger-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--tiger-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '--tiger-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '--tiger-shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Glass — disabled by default (no backdrop blur, no inset highlights)
  '--tiger-shadow-glass': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--tiger-shadow-glass-strong': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  '--tiger-blur-glass': '0px',
  '--tiger-blur-glass-strong': '0px',

  // Gradients — fall back to solid color via a no-op linear-gradient
  '--tiger-gradient-primary': 'linear-gradient(180deg, var(--tiger-primary), var(--tiger-primary))',
  '--tiger-gradient-surface': 'linear-gradient(180deg, var(--tiger-surface), var(--tiger-surface))',
  '--tiger-gradient-danger': 'linear-gradient(180deg, var(--tiger-error), var(--tiger-error))',

  // Motion — current durations / easings
  '--tiger-motion-duration-instant': '80ms',
  '--tiger-motion-duration-quick': '150ms',
  '--tiger-motion-duration-base': '200ms',
  '--tiger-motion-duration-relaxed': '300ms',
  '--tiger-motion-duration-slow': '450ms',

  '--tiger-motion-ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--tiger-motion-ease-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
  '--tiger-motion-ease-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
  '--tiger-motion-ease-emphasized': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--tiger-motion-ease-spring': 'cubic-bezier(0.4, 0, 0.2, 1)',

  '--tiger-transition-base': 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '--tiger-transition-quick': 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  '--tiger-transition-emphasized': 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
}

/**
 * Dark-mode fallback values (same as light for opt-in tokens — kept for
 * symmetry with override layer).
 */
export const MODERN_BASE_TOKENS_DARK: Record<string, string> = {
  // Shadows tinted slightly to handle dark backgrounds
  '--tiger-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.2)',
  '--tiger-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.25)',
  '--tiger-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.25)',
  '--tiger-shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.25)',

  '--tiger-shadow-glass': '0 1px 2px 0 rgb(0 0 0 / 0.2)',
  '--tiger-shadow-glass-strong': '0 4px 6px -1px rgb(0 0 0 / 0.3)'
}

/**
 * "Modern" overrides — applied only when `data-tiger-style="modern"` is set.
 * Implements Phase 1C spec: rounder radii, multi-layer shadows, glass,
 * subtle gradients, refined motion.
 */
export const MODERN_OVERRIDE_TOKENS_LIGHT: Record<string, string> = {
  // Rounder corners
  '--tiger-radius-sm': '8px',
  '--tiger-radius-md': '12px',
  '--tiger-radius-lg': '16px',
  '--tiger-radius-xl': '20px',
  '--tiger-radius-pill': '9999px',

  // Multi-layer shadows
  '--tiger-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
  '--tiger-shadow-md': '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
  '--tiger-shadow-lg': '0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
  '--tiger-shadow-xl': '0 24px 48px -8px rgb(0 0 0 / 0.1), 0 8px 16px -4px rgb(0 0 0 / 0.05)',

  // Glass: backdrop blur + inset highlights
  '--tiger-shadow-glass':
    'inset 0 1px 0 rgb(255 255 255 / 0.6), inset 0 -1px 0 rgb(0 0 0 / 0.04), 0 8px 24px -4px rgb(15 23 42 / 0.1)',
  '--tiger-shadow-glass-strong':
    'inset 0 1px 0 rgb(255 255 255 / 0.5), inset 0 0 0 1px rgb(255 255 255 / 0.18), 0 16px 32px -8px rgb(15 23 42 / 0.16)',
  '--tiger-blur-glass': '16px',
  '--tiger-blur-glass-strong': '24px',

  // Chart axis softening (modern look uses fainter axis/grid strokes)
  '--tiger-chart-axis-line-opacity': '0.6',
  '--tiger-chart-axis-tick-opacity': '0.55',
  '--tiger-chart-grid-line-opacity': '0.4',

  // Chart legend marker + row hover (opt-in glassy look)
  '--tiger-chart-legend-marker-image':
    'linear-gradient(135deg, color-mix(in oklab, var(--tiger-chart-legend-marker-color) 100%, white 18%) 0%, var(--tiger-chart-legend-marker-color) 100%)',
  '--tiger-chart-legend-row-hover-bg': 'rgb(15 23 42 / 0.04)',
  '--tiger-chart-legend-row-radius': 'var(--tiger-radius-sm, 6px)',

  // Subtle gradients via OKLab color-mix
  '--tiger-gradient-primary':
    'linear-gradient(180deg, color-mix(in oklab, var(--tiger-primary) 100%, white 8%) 0%, var(--tiger-primary) 100%)',
  '--tiger-gradient-surface':
    'linear-gradient(180deg, color-mix(in oklab, var(--tiger-surface) 100%, white 4%) 0%, var(--tiger-surface) 100%)',
  '--tiger-gradient-danger':
    'linear-gradient(180deg, color-mix(in oklab, var(--tiger-error) 100%, white 6%) 0%, var(--tiger-error) 100%)',

  // Refined motion
  '--tiger-motion-ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  '--tiger-motion-ease-decelerate': 'cubic-bezier(0, 0, 0, 1)',
  '--tiger-motion-ease-accelerate': 'cubic-bezier(0.3, 0, 1, 1)',
  '--tiger-motion-ease-emphasized': 'cubic-bezier(0.2, 0, 0, 1.2)',
  '--tiger-motion-ease-spring': 'linear(0, 0.36 8%, 0.85 22%, 1.05 33%, 1.02 50%, 0.99 70%, 1)',

  '--tiger-transition-base':
    'all var(--tiger-motion-duration-base) var(--tiger-motion-ease-standard)',
  '--tiger-transition-quick':
    'all var(--tiger-motion-duration-quick) var(--tiger-motion-ease-standard)',
  '--tiger-transition-emphasized':
    'transform var(--tiger-motion-duration-relaxed) var(--tiger-motion-ease-emphasized)'
}

/**
 * Modern overrides for dark mode — adjusts glass + shadows for dark surfaces.
 */
export const MODERN_OVERRIDE_TOKENS_DARK: Record<string, string> = {
  '--tiger-shadow-sm': '0 1px 2px 0 rgb(2 6 23 / 0.5)',
  '--tiger-shadow-md': '0 4px 8px -2px rgb(2 6 23 / 0.55), 0 2px 4px -1px rgb(2 6 23 / 0.4)',
  '--tiger-shadow-lg': '0 12px 24px -4px rgb(2 6 23 / 0.55), 0 4px 8px -2px rgb(2 6 23 / 0.4)',
  '--tiger-shadow-xl': '0 24px 48px -8px rgb(2 6 23 / 0.6), 0 8px 16px -4px rgb(2 6 23 / 0.45)',

  '--tiger-shadow-glass':
    'inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 -1px 0 rgb(0 0 0 / 0.4), 0 8px 24px -4px rgb(0 0 0 / 0.4)',
  '--tiger-shadow-glass-strong':
    'inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.06), 0 16px 32px -8px rgb(0 0 0 / 0.55)',

  // Chart legend row hover for dark surfaces (slightly brighter)
  '--tiger-chart-legend-row-hover-bg': 'rgb(255 255 255 / 0.06)'
}

/**
 * Reduced-motion override — applied via `@media (prefers-reduced-motion: reduce)`.
 * Collapses all motion durations to ~0ms.
 */
export const MODERN_REDUCED_MOTION_TOKENS: Record<string, string> = {
  '--tiger-motion-duration-instant': '0ms',
  '--tiger-motion-duration-quick': '0ms',
  '--tiger-motion-duration-base': '0ms',
  '--tiger-motion-duration-relaxed': '0ms',
  '--tiger-motion-duration-slow': '0ms'
}
