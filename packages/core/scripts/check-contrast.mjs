/**
 * Contrast gate for token generation.
 * Text pairs below 4.5:1 and control boundaries below 3:1 fail the build.
 * Component tokens that no recipe reads are dropped before emit.
 */

const TEXT_MIN = 4.5
const BOUNDARY_MIN = 3

/** Component token names that a recipe actually reads. Unlisted names are not emitted. */
export const CONSUMED_COMPONENT_TOKENS = new Set()

function linearChannel(byte) {
  const value = byte / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex) {
  const raw = hex.replace('#', '')
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((part) => part + part)
          .join('')
      : raw.slice(0, 6)
  const r = Number.parseInt(expanded.slice(0, 2), 16)
  const g = Number.parseInt(expanded.slice(2, 4), 16)
  const b = Number.parseInt(expanded.slice(4, 6), 16)
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b)
}

export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

export function assertContrast(foreground, background, minimum) {
  const ratio = contrastRatio(foreground, background)
  if (ratio < minimum) {
    throw new Error(
      `Contrast ${ratio.toFixed(2)}:1 for ${foreground} on ${background} is below ${minimum}:1`
    )
  }
  return ratio
}

function resolveRef(ref, root, seen = new Set()) {
  if (typeof ref !== 'string') return ref
  if (!/^(primitive|semantic|component|global|alias)\./.test(ref)) return ref
  if (seen.has(ref)) return ref
  seen.add(ref)
  let cur = root
  for (const part of ref.split('.')) {
    cur = cur?.[part]
    if (cur === undefined) return ref
  }
  return typeof cur === 'string' ? resolveRef(cur, root, seen) : cur
}

function isHex(value) {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

const TEXT_PAIRS = [
  ['text', 'surface', TEXT_MIN],
  ['text', 'surfaceMuted', TEXT_MIN],
  ['text', 'surfaceRaised', TEXT_MIN],
  ['primaryForeground', 'primary', TEXT_MIN]
]

const BOUNDARY_PAIRS = [
  ['primary', 'surface', BOUNDARY_MIN],
  ['border', 'surface', BOUNDARY_MIN],
  ['focusRing', 'surface', BOUNDARY_MIN]
]

export function checkTokenContrast(tokens) {
  const runtime = tokens.runtime
  if (!runtime) return
  for (const scheme of ['light', 'dark']) {
    const colors = runtime[scheme]?.colors
    if (!colors) continue
    const resolved = Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [key, resolveRef(value, tokens)])
    )
    for (const [fg, bg, minimum] of [...TEXT_PAIRS, ...BOUNDARY_PAIRS]) {
      const foreground = resolved[fg]
      const background = resolved[bg]
      if (!isHex(foreground) || !isHex(background)) continue
      assertContrast(foreground, background, minimum)
    }
  }
}

export function filterUnreadComponentTokens(component) {
  if (!component || typeof component !== 'object') return component
  const next = {}
  for (const [name, value] of Object.entries(component)) {
    if (CONSUMED_COMPONENT_TOKENS.has(name)) next[name] = value
  }
  return next
}
