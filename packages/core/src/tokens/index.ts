/**
 * Tigercat Design Tokens
 *
 * Three-layer token system:
 *  - Global: primitive values (colors, spacing, radius, shadow, font, motion)
 *  - Alias: semantic mappings (bg-primary, text-secondary, border-focus, etc.)
 *  - Component: per-component overrides (button height, modal width, etc.)
 *
 * @module tokens
 */
export {
  globalColors,
  globalSpace,
  globalRadius,
  globalShadow,
  globalFont,
  globalDuration,
  globalEasing,
  aliasTokens,
  componentTokens
} from './tokens'

export type {
  GlobalColorHue,
  GlobalColorLevel,
  GlobalSpaceKey,
  GlobalRadiusKey,
  GlobalShadowKey,
  GlobalDurationKey,
  GlobalEasingKey
} from './tokens'
