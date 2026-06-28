/**
 * Tigercat Design Tokens
 *
 * Three-layer token system:
 *  - Primitive: raw values (colors, spacing, radius, shadow, font, motion)
 *  - Semantic: intent mappings (bg-primary, text-secondary, border-focus, etc.)
 *  - Component: per-component overrides (button height, modal width, etc.)
 *
 * @module tokens
 */
export {
  primitiveColors,
  primitiveSpace,
  primitiveRadius,
  primitiveShadow,
  primitiveFont,
  primitiveDuration,
  primitiveEasing,
  semanticTokens,
  designTokens,
  componentTokens
} from './tokens'

export type {
  PrimitiveColorHue,
  PrimitiveColorLevel,
  PrimitiveSpaceKey,
  PrimitiveRadiusKey,
  PrimitiveShadowKey,
  PrimitiveDurationKey,
  PrimitiveEasingKey,
  SemanticTokenCategory,
  ComponentTokenName
} from './tokens'
