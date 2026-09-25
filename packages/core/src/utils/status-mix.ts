/**
 * Mix a status hue toward `--tiger-text` so sm-sized chips and solid fills
 * keep ≥ 4.5:1 in both light (darken) and dark (lighten) schemes.
 *
 * Each class below is a complete literal. Tailwind v4 only emits candidates it
 * can read in source; a class built by concatenating `bg-[` + color-mix is
 * applied in the DOM and then paints nothing.
 */
export const STATUS_MIX_HUE_PERCENT = 75

const MIX_BG = {
  '--tiger-primary': 'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_75%,var(--tiger-text))]',
  '--tiger-success': 'bg-[color-mix(in_srgb,var(--tiger-success,#16a34a)_75%,var(--tiger-text))]',
  '--tiger-warning': 'bg-[color-mix(in_srgb,var(--tiger-warning,#d97706)_75%,var(--tiger-text))]',
  '--tiger-error': 'bg-[color-mix(in_srgb,var(--tiger-error,#dc2626)_75%,var(--tiger-text))]',
  '--tiger-info': 'bg-[color-mix(in_srgb,var(--tiger-info,#3b82f6)_75%,var(--tiger-text))]',
  '--tiger-text-secondary':
    'bg-[color-mix(in_srgb,var(--tiger-text-secondary,#6b7280)_75%,var(--tiger-text))]',
  '--tiger-chart-4': 'bg-[color-mix(in_srgb,var(--tiger-chart-4,#a855f7)_75%,var(--tiger-text))]',
  '--tiger-chart-5': 'bg-[color-mix(in_srgb,var(--tiger-chart-5,#0ea5e9)_75%,var(--tiger-text))]',
  '--tiger-secondary':
    'bg-[color-mix(in_srgb,var(--tiger-secondary,#4b5563)_75%,var(--tiger-text))]'
} as const

const MIX_TEXT = {
  '--tiger-primary': 'text-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_75%,var(--tiger-text))]',
  '--tiger-success': 'text-[color-mix(in_srgb,var(--tiger-success,#16a34a)_75%,var(--tiger-text))]',
  '--tiger-warning': 'text-[color-mix(in_srgb,var(--tiger-warning,#d97706)_75%,var(--tiger-text))]',
  '--tiger-error': 'text-[color-mix(in_srgb,var(--tiger-error,#dc2626)_75%,var(--tiger-text))]',
  '--tiger-info': 'text-[color-mix(in_srgb,var(--tiger-info,#3b82f6)_75%,var(--tiger-text))]'
} as const

export function mixStatusTowardText(cssVar: string, fallbackHex: string): string {
  return `color-mix(in_srgb,var(${cssVar},${fallbackHex})_${STATUS_MIX_HUE_PERCENT}%,var(--tiger-text))`
}

export function mixStatusTowardTextClass(
  kind: 'bg' | 'text',
  cssVar: string,
  fallbackHex: string
): string {
  const table = kind === 'bg' ? MIX_BG : MIX_TEXT
  const known = table[cssVar as keyof typeof table]
  if (known) return known
  return `${kind}-[${mixStatusTowardText(cssVar, fallbackHex)}]`
}
