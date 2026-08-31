/**
 * Mix a status hue toward `--tiger-text` so sm-sized chips and solid fills
 * keep ≥ 4.5:1 in both light (darken) and dark (lighten) schemes.
 */
export const STATUS_MIX_HUE_PERCENT = 75

export function mixStatusTowardText(cssVar: string, fallbackHex: string): string {
  return `color-mix(in_srgb,var(${cssVar},${fallbackHex})_${STATUS_MIX_HUE_PERCENT}%,var(--tiger-text,#111827))`
}

export function mixStatusTowardTextClass(
  kind: 'bg' | 'text',
  cssVar: string,
  fallbackHex: string
): string {
  return `${kind}-[${mixStatusTowardText(cssVar, fallbackHex)}]`
}
